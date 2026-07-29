import { generateEmbedding } from '../../utils/ai';
import Task from '../../models/Task';
import Project from '../../models/Project';
import Note from '../../models/Note';
import Document from '../../models/Document';
import Goal from '../../models/Goal';
import Habit from '../../models/Habit';
import CommentModel from '../../models/Comment';
import logger from '../../utils/logger';

export type IndexableEntity = 'task' | 'project' | 'note' | 'document' | 'goal' | 'habit' | 'comment';

interface SearchResult {
  entityType: IndexableEntity;
  id: string;
  title: string;
  snippet: string;
  score: number;
  url?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModel = { find: (...args: any[]) => any; findByIdAndUpdate: (...args: any[]) => any };

function getModel(entityType: IndexableEntity): AnyModel {
  switch (entityType) {
    case 'task': return Task as unknown as AnyModel;
    case 'project': return Project as unknown as AnyModel;
    case 'note': return Note as unknown as AnyModel;
    case 'document': return Document as unknown as AnyModel;
    case 'goal': return Goal as unknown as AnyModel;
    case 'habit': return Habit as unknown as AnyModel;
    case 'comment': return CommentModel as unknown as AnyModel;
  }
}

export async function indexEntity(
  entityType: IndexableEntity,
  entityId: string,
  text: string
): Promise<void> {
  try {
    const embedding = await generateEmbedding(text);
    const Model = getModel(entityType);
    await Model.findByIdAndUpdate(entityId, { embedding });
    logger.debug(`Indexed ${entityType} ${entityId} with embedding`);
  } catch (error) {
    logger.error(`Failed to index ${entityType} ${entityId}:`, error);
  }
}

export async function removeEntityIndex(
  entityType: IndexableEntity,
  entityId: string
): Promise<void> {
  try {
    const Model = getModel(entityType);
    await Model.findByIdAndUpdate(entityId, { $unset: { embedding: '' } });
  } catch (error) {
    logger.error(`Failed to remove index for ${entityType} ${entityId}:`, error);
  }
}

export async function searchSimilar(
  query: string,
  options: {
    workspaceId?: string;
    limit?: number;
    types?: IndexableEntity[];
  } = {}
): Promise<SearchResult[]> {
  const { workspaceId, limit = 10, types } = options;

  try {
    const queryEmbedding = await generateEmbedding(query);
    const results: SearchResult[] = [];

    const entityTypes = types || ['task', 'project', 'note', 'document', 'goal', 'habit', 'comment'];

    for (const entityType of entityTypes) {
      const Model = getModel(entityType);
      const filter: Record<string, unknown> = {
        embedding: { $exists: true, $ne: [] },
      };
      if (workspaceId) {
        filter.workspaceId = workspaceId;
      }

      const entities = await Model.find(filter)
        .select('title content name description text')
        .limit(limit)
        .lean() as Record<string, unknown>[];

      for (const entity of entities) {
        const embedding = entity.embedding as number[] | undefined;
        if (!embedding) continue;

        const score = cosineSimilarity(queryEmbedding, embedding);
        if (score < 0.5) continue;

        results.push({
          entityType,
          id: String(entity._id || ''),
          title: String(entity.title || entity.name || ''),
          snippet: String(entity.content || entity.description || ''),
          score,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  } catch (error) {
    logger.error('Vector search failed:', error);
    return [];
  }
}

export async function batchIndexWorkspace(workspaceId: string): Promise<void> {
  const [tasks, projects, notes, documents, goals, habits] = await Promise.all([
    Task.find({ workspaceId, isArchived: false }).select('title description').lean(),
    Project.find({ workspaceId, isArchived: false }).select('name description').lean(),
    Note.find({ workspaceId }).select('title content').lean(),
    Document.find({ workspaceId, isArchived: false }).select('title content').lean(),
    Goal.find({ workspaceId }).select('title description').lean(),
    Habit.find({ workspaceId }).select('name description').lean(),
  ]);

  const entityTypes: IndexableEntity[] = ['task', 'project', 'note', 'document', 'goal', 'habit'];
  const allEntities = [tasks, projects, notes, documents, goals, habits];

  let indexed = 0;
  for (let i = 0; i < allEntities.length; i++) {
    const type = entityTypes[i];
    for (const entity of allEntities[i] as Record<string, unknown>[]) {
      const text = [
        String(entity.title || entity.name || ''),
        String(entity.description || entity.content || ''),
      ].filter(Boolean).join(' ');

      if (text.length > 10) {
        await indexEntity(type, String(entity._id), text);
        indexed++;
      }
    }
  }

  logger.info(`Batch indexed ${indexed} entities for workspace ${workspaceId}`);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}
