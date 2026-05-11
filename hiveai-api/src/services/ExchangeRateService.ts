import axios from 'axios';
import { logger } from '../utils/logger';

const DEFAULT_KES_PER_USD = 129;
const CACHE_TTL_MS = 30 * 60 * 1000;

class ExchangeRateService {
  private cachedRate = DEFAULT_KES_PER_USD;
  private lastFetchedAt = 0;

  async getUsdToKesRate(): Promise<number> {
    const now = Date.now();
    if (now - this.lastFetchedAt < CACHE_TTL_MS) {
      return this.cachedRate;
    }

    try {
      const response = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 5000 });
      const kesRate = Number(response.data?.rates?.KES);
      if (Number.isFinite(kesRate) && kesRate > 0) {
        this.cachedRate = kesRate;
        this.lastFetchedAt = now;
      }
    } catch (error) {
      logger.warn('Unable to refresh USD/KES exchange rate. Using cached fallback rate.', {
        error: (error as Error).message,
      });
    }

    return this.cachedRate;
  }

  async convertUsdToKes(usdAmount: number): Promise<number> {
    const rate = await this.getUsdToKesRate();
    return Number((usdAmount * rate).toFixed(2));
  }

  async convertKesToUsd(kesAmount: number): Promise<number> {
    const rate = await this.getUsdToKesRate();
    if (!rate) return 0;
    return Number((kesAmount / rate).toFixed(2));
  }
}

export const exchangeRateService = new ExchangeRateService();
