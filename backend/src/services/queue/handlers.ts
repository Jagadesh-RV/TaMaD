import { Job } from 'bullmq';
import { queueService } from './index';
import { indexEntity } from '../vector';
import { sendMail } from '../../utils/mailer';
import logger from '../../utils/logger';

export function registerQueueHandlers(): void {
  queueService.registerHandler('ai-processing', async (job: Job) => {
    const { action, data } = job.data as { action: string; data: Record<string, unknown> };
    logger.info(`AI processing: ${action}`, { data });

    switch (action) {
      case 'generate-embedding':
        if (data.entityType && data.entityId && data.text) {
          await indexEntity(
            data.entityType as 'task' | 'project' | 'note' | 'document' | 'goal' | 'habit' | 'comment',
            data.entityId as string,
            data.text as string
          );
        }
        break;
      default:
        logger.warn(`Unknown AI action: ${action}`);
    }
  });

  queueService.registerHandler('email', async (job: Job) => {
    const { to, subject, html } = job.data as { to: string; subject: string; html: string };
    logger.info(`Sending email to ${to}: ${subject}`);
    await sendMail(to, subject, html);
  });

  queueService.registerHandler('notifications', async (job: Job) => {
    logger.info('Processing notification', { data: job.data });
  });

  queueService.registerHandler('file-processing', async (job: Job) => {
    const { action, fileId, workspaceId } = job.data as {
      action: string;
      fileId: string;
      workspaceId?: string;
    };
    logger.info(`File processing: ${action}`, { fileId });

    switch (action) {
      case 'extract-text':
        break;
      case 'generate-embeddings':
        break;
      default:
        logger.warn(`Unknown file action: ${action}`);
    }
  });

  queueService.registerHandler('reports', async (job: Job) => {
    logger.info('Generating report', { data: job.data });
  });

  queueService.registerHandler('reminders', async (job: Job) => {
    logger.info('Processing reminder', { data: job.data });
  });

  queueService.registerHandler('analytics', async (job: Job) => {
    logger.info('Processing analytics', { data: job.data });
  });

  queueService.registerHandler('vector-indexing', async (job: Job) => {
    const { entityType, entityId, text } = job.data as {
      entityType: string;
      entityId: string;
      text: string;
    };
    await indexEntity(
      entityType as 'task' | 'project' | 'note' | 'document' | 'goal' | 'habit' | 'comment',
      entityId,
      text
    );
  });

  logger.info('All queue handlers registered');
}
