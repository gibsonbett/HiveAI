import { redis } from '../config/redis';
import { logger } from './logger';

export const getOrSetCache = async <T>(
  key: string,
  ttlSeconds: number,
  resolver: () => Promise<T>
): Promise<T> => {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch (error) {
    logger.warn('Cache read failed', { key, error });
  }

  const data = await resolver();

  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (error) {
    logger.warn('Cache write failed', { key, error });
  }

  return data;
};

export const invalidateCacheByPrefix = async (prefix: string): Promise<number> => {
  let cursor = '0';
  let deleted = 0;

  try {
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', '100');
      cursor = nextCursor;

      if (keys.length > 0) {
        deleted += await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (error) {
    logger.warn('Cache invalidation failed', { prefix, error });
  }

  return deleted;
};

export const invalidateAnalyticsCache = async (): Promise<number> => invalidateCacheByPrefix('analytics:');
