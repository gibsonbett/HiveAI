jest.mock('../../config/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    scan: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    http: jest.fn(),
  },
}));

import { redis } from '../../config/redis';
import { getOrSetCache, invalidateCacheByPrefix } from '../../utils/cache';

type MockedFn = jest.Mock<any, any>;

describe('cache utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cached value when present', async () => {
    (redis.get as MockedFn).mockResolvedValue(JSON.stringify({ value: 42 }));

    const resolver = jest.fn().mockResolvedValue({ value: 100 });
    const result = await getOrSetCache('analytics:test', 60, resolver);

    expect(result).toEqual({ value: 42 });
    expect(resolver).not.toHaveBeenCalled();
    expect(redis.set).not.toHaveBeenCalled();
  });

  it('resolves and stores value when cache misses', async () => {
    (redis.get as MockedFn).mockResolvedValue(null);
    (redis.set as MockedFn).mockResolvedValue('OK');

    const resolver = jest.fn().mockResolvedValue({ value: 99 });
    const result = await getOrSetCache('analytics:test', 120, resolver);

    expect(result).toEqual({ value: 99 });
    expect(resolver).toHaveBeenCalledTimes(1);
    expect(redis.set).toHaveBeenCalledWith('analytics:test', JSON.stringify({ value: 99 }), 'EX', 120);
  });

  it('invalidates all keys by prefix using SCAN', async () => {
    (redis.scan as MockedFn)
      .mockResolvedValueOnce(['1', ['analytics:overview', 'analytics:tasks:trend:30']])
      .mockResolvedValueOnce(['0', ['analytics:revenue:trend:30']]);
    (redis.del as MockedFn).mockResolvedValueOnce(2).mockResolvedValueOnce(1);

    const deleted = await invalidateCacheByPrefix('analytics:');

    expect(redis.scan).toHaveBeenCalledWith('0', 'MATCH', 'analytics:*', 'COUNT', '100');
    expect(redis.scan).toHaveBeenCalledWith('1', 'MATCH', 'analytics:*', 'COUNT', '100');
    expect(redis.del).toHaveBeenCalledWith('analytics:overview', 'analytics:tasks:trend:30');
    expect(redis.del).toHaveBeenCalledWith('analytics:revenue:trend:30');
    expect(deleted).toBe(3);
  });
});
