import mongoose from 'mongoose';
import logger from './logger';

export const ensureIndexes = async () => {
  try {
    const collections = await mongoose.connection.db?.listCollections();
    if (!collections) return;

    logger.info('Ensuring database indexes...');
    
    const models = mongoose.modelNames();
    for (const modelName of models) {
      const model = mongoose.model(modelName);
      await model.ensureIndexes();
    }
    
    logger.info('Database indexes ensured');
  } catch (_error) {
    logger.error('Error ensuring indexes:', error);
  }
};

export const getQueryStats = async () => {
  try {
    const admin = mongoose.connection.db?.admin();
    if (!admin) return null;

    const stats = await admin.command({ serverStatus: 1 });
    return {
      opcounters: stats.opcounters,
      globalLock: stats.globalLock,
      mem: stats.mem,
      connections: stats.connections,
    };
  } catch (_error) {
    logger.error('Error getting query stats:', error);
    return null;
  }
};

export const explainQuery = async (
  collection: string,
  query: Record<string, unknown>
) => {
  try {
    const col = mongoose.connection.db?.collection(collection);
    if (!col) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (col as any).explain(query);
    return result;
  } catch (_error) {
    logger.error('Error explaining query:', error);
    return null;
  }
};
