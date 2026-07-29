import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';
import logger from '../../utils/logger';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export type QueueName =
  | 'ai-processing'
  | 'email'
  | 'notifications'
  | 'file-processing'
  | 'reports'
  | 'reminders'
  | 'analytics'
  | 'vector-indexing';

interface QueueConfig {
  name: QueueName;
  defaultJobOptions: {
    attempts: number;
    backoff: { type: 'exponential'; delay: number };
    removeOnComplete: { age: number; count: number };
    removeOnFail: { age: number; count: number };
  };
}

const QUEUE_CONFIGS: QueueConfig[] = [
  {
    name: 'ai-processing',
    defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: { age: 3600, count: 100 }, removeOnFail: { age: 86400, count: 50 } },
  },
  {
    name: 'email',
    defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: { age: 3600, count: 100 }, removeOnFail: { age: 86400, count: 50 } },
  },
  {
    name: 'notifications',
    defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: { age: 1800, count: 200 }, removeOnFail: { age: 3600, count: 50 } },
  },
  {
    name: 'file-processing',
    defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: { age: 7200, count: 100 }, removeOnFail: { age: 86400, count: 50 } },
  },
  {
    name: 'reports',
    defaultJobOptions: { attempts: 2, backoff: { type: 'exponential', delay: 10000 }, removeOnComplete: { age: 86400, count: 50 }, removeOnFail: { age: 604800, count: 25 } },
  },
  {
    name: 'reminders',
    defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: { age: 86400, count: 200 }, removeOnFail: { age: 604800, count: 100 } },
  },
  {
    name: 'analytics',
    defaultJobOptions: { attempts: 2, backoff: { type: 'exponential', delay: 10000 }, removeOnComplete: { age: 86400, count: 50 }, removeOnFail: { age: 604800, count: 25 } },
  },
  {
    name: 'vector-indexing',
    defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: { age: 3600, count: 200 }, removeOnFail: { age: 86400, count: 50 } },
  },
];

class QueueService {
  private queues: Map<QueueName, Queue> = new Map();
  private workers: Map<QueueName, Worker> = new Map();
  private events: Map<QueueName, QueueEvents> = new Map();
  private initialized = false;
  private handlers: Map<QueueName, (job: Job) => Promise<void>> = new Map();

  initialize(): void {
    if (this.initialized) return;

    for (const config of QUEUE_CONFIGS) {
      const queue = new Queue(config.name, {
        connection,
        defaultJobOptions: config.defaultJobOptions,
      });
      this.queues.set(config.name, queue);
      this.events.set(config.name, new QueueEvents(config.name, { connection }));

      queue.on('error', (err) => logger.error(`Queue ${config.name} error:`, err));
    }

    this.initialized = true;
    logger.info(`Queue service initialized with ${QUEUE_CONFIGS.length} queues`);
  }

  registerHandler(queueName: QueueName, handler: (job: Job) => Promise<void>): void {
    this.handlers.set(queueName, handler);

    const worker = new Worker(
      queueName,
      async (job) => {
        logger.info(`Processing job ${job.id} in queue ${queueName}`, {
          queueName,
          jobId: job.id,
          data: job.data,
        });

        const handler = this.handlers.get(queueName);
        if (!handler) {
          throw new Error(`No handler registered for queue ${queueName}`);
        }

        await handler(job);
      },
      {
        connection,
        concurrency: 5,
        lockDuration: 30000,
      }
    );

    worker.on('completed', (job) => {
      logger.info(`Job ${job.id} completed in queue ${queueName}`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} failed in queue ${queueName}:`, err);
    });

    this.workers.set(queueName, worker);
    logger.debug(`Worker registered for queue ${queueName}`);
  }

  async addJob(
    queueName: QueueName,
    data: Record<string, unknown>,
    options?: { delay?: number; priority?: number }
  ): Promise<Job | null> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      logger.error(`Queue ${queueName} not found`);
      return null;
    }

    return queue.add(`${queueName}:${Date.now()}`, data, {
      delay: options?.delay,
      priority: options?.priority,
    });
  }

  async addBulk(
    queueName: QueueName,
    jobs: { name: string; data: Record<string, unknown> }[]
  ): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      logger.error(`Queue ${queueName} not found`);
      return;
    }

    await queue.addBulk(jobs.map((j) => ({
      name: j.name,
      data: j.data,
    })));
  }

  async getQueueMetrics(queueName: QueueName): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.queues.get(queueName);
    if (!queue) return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  async getAllQueueMetrics(): Promise<Record<QueueName, { waiting: number; active: number; completed: number; failed: number; delayed: number }>> {
    const metrics: Partial<Record<QueueName, { waiting: number; active: number; completed: number; failed: number; delayed: number }>> = {};
    for (const queueName of QUEUE_CONFIGS.map((c) => c.name)) {
      metrics[queueName] = await this.getQueueMetrics(queueName);
    }
    return metrics as Record<QueueName, { waiting: number; active: number; completed: number; failed: number; delayed: number }>;
  }

  async pauseQueue(queueName: QueueName): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) await queue.pause();
  }

  async resumeQueue(queueName: QueueName): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) await queue.resume();
  }

  async close(): Promise<void> {
    for (const [, worker] of this.workers) {
      await worker.close();
    }
    for (const [, queue] of this.queues) {
      await queue.close();
    }
    await connection.quit();
  }
}

export const queueService = new QueueService();
