import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { parseNaturalLanguageTask, generateEmbedding } from '../utils/ai';
import Task from '../models/Task';

// @desc    Parse natural language into a structured task
// @route   POST /api/ai/parse-task
// @access  Private
export const parseTask = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    const taskData = await parseNaturalLanguageTask(text);
    
    // Optionally generate embedding here, or let the creation endpoint handle it.
    // We just return the parsed data for the user to confirm in the UI.
    res.json(taskData);
  } catch (error: any) {
    res.status(500).json({ error: 'AI parsing failed', details: error.message });
  }
};

// @desc    Chat with workspace (RAG prototype)
// @route   POST /api/ai/chat
// @access  Private
export const chatWithWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const { query, workspaceId } = req.body;
    
    if (!query) return res.status(400).json({ error: 'Query is required' });

    // Step 1: Generate embedding for user query
    const queryEmbedding = await generateEmbedding(query);

    // Step 2: Vector search against MongoDB Atlas Vector Search
    // NOTE: This requires creating a vector search index on the `Task` collection.
    // Example pipeline:
    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index", // Name of the Atlas Vector Search index
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 5,
          filter: { workspaceId: { $eq: workspaceId } } // Needs to be configured in the index
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          status: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];

    // Note: We bypass executing the pipeline if the index is not set up yet to avoid crashing.
    // const relevantTasks = await Task.aggregate(pipeline);
    const relevantTasks: unknown[] = []; // Placeholder

    res.json({ 
      message: 'Vector search endpoint prepared. Atlas Search Index configuration required.',
      contextExtracted: relevantTasks 
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Chat feature failed', details: error.message });
  }
};
