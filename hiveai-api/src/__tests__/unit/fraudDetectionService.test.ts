jest.mock('../../config/redis', () => ({
  redis: {
    set: jest.fn(),
    ttl: jest.fn(),
    scan: jest.fn(),
    del: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('../../models/User', () => ({
  User: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
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

import { fraudDetectionService } from '../../services/FraudDetectionService';
import { redis } from '../../config/redis';
import { User } from '../../models/User';

type MockedFn = jest.Mock<any, any>;

const mockFindByIdLeanResult = (value: any) => {
  (User.findById as MockedFn).mockReturnValue({
    select: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(value),
    }),
  });
};

describe('FraudDetectionService.applyRiskConsequences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (User.findByIdAndUpdate as MockedFn).mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    (redis.set as MockedFn).mockResolvedValue('OK');
  });

  it('returns no penalties for low risk', async () => {
    const result = await fraudDetectionService.applyRiskConsequences('user-1', 'withdrawal', 'low', []);

    expect(result).toEqual({ trustScore: null, throttledUntil: null });
    expect(User.findById).not.toHaveBeenCalled();
    expect(redis.set).not.toHaveBeenCalled();
  });

  it('applies trust score penalty without throttle for medium risk above threshold', async () => {
    mockFindByIdLeanResult({ trustScore: 90 });

    const result = await fraudDetectionService.applyRiskConsequences(
      'user-2',
      'withdrawal',
      'medium',
      ['withdrawal_velocity_high']
    );

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-2', { trustScore: 86 });
    expect(redis.set).not.toHaveBeenCalled();
    expect(result.trustScore).toBe(86);
    expect(result.throttledUntil).toBeNull();
  });

  it('applies trust score penalty and throttle for high risk', async () => {
    mockFindByIdLeanResult({ trustScore: 80 });

    const result = await fraudDetectionService.applyRiskConsequences(
      'user-3',
      'withdrawal',
      'high',
      ['cooldown_violation']
    );

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-3', { trustScore: 68 });
    expect(redis.set).toHaveBeenCalledWith(
      'fraud:throttle:withdrawal:user-3',
      JSON.stringify({ level: 'high', flags: ['cooldown_violation'] }),
      'EX',
      1800
    );
    expect(result.trustScore).toBe(68);
    expect(result.throttledUntil).not.toBeNull();
  });
});
