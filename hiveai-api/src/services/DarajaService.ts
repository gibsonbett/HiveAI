import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const SANDBOX_URL = 'https://sandbox.safaricom.co.ke';
const PRODUCTION_URL = 'https://api.safaricom.co.ke';

class DarajaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.DARAJA_ENV === 'production' ? PRODUCTION_URL : SANDBOX_URL;
  }

  private async getAccessToken(): Promise<string> {
    if (!env.DARAJA_CONSUMER_KEY || !env.DARAJA_CONSUMER_SECRET) {
      throw new Error('Daraja credentials not configured');
    }

    const auth = Buffer.from(
      `${env.DARAJA_CONSUMER_KEY}:${env.DARAJA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } }
    );

    return response.data.access_token;
  }

  private generatePassword(): { password: string; timestamp: string } {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, '')
      .slice(0, 14);

    const password = Buffer.from(
      `${env.DARAJA_SHORTCODE}${env.DARAJA_PASSKEY}${timestamp}`
    ).toString('base64');

    return { password, timestamp };
  }

  async initiateSTKPush(params: {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
  }) {
    const token = await this.getAccessToken();
    const { password, timestamp } = this.generatePassword();

    // Format phone: 254XXXXXXXXX
    const phone = this.formatPhone(params.phoneNumber);

    const payload = {
      BusinessShortCode: env.DARAJA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(params.amount),
      PartyA: phone,
      PartyB: env.DARAJA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: env.DARAJA_CALLBACK_URL,
      AccountReference: params.accountReference,
      TransactionDesc: params.transactionDesc,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      logger.info('STK Push initiated', {
        checkoutRequestId: response.data.CheckoutRequestID,
        phone,
      });

      return {
        success: true,
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        responseDescription: response.data.ResponseDescription,
      };
    } catch (error: any) {
      logger.error('STK Push failed', {
        error: error.response?.data || error.message,
      });
      throw new Error(
        error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment'
      );
    }
  }

  async querySTKStatus(checkoutRequestId: string) {
    const token = await this.getAccessToken();
    const { password, timestamp } = this.generatePassword();

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: env.DARAJA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return {
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
      };
    } catch (error: any) {
      logger.error('STK query failed', { error: error.response?.data || error.message });
      throw new Error('Failed to query transaction status');
    }
  }

  async initiateB2C(params: {
    phoneNumber: string;
    amount: number;
    remarks: string;
    occasion?: string;
  }) {
    if (!env.DARAJA_B2C_INITIATOR || !env.DARAJA_B2C_PASSWORD) {
      throw new Error('B2C credentials not configured');
    }

    const token = await this.getAccessToken();
    const phone = this.formatPhone(params.phoneNumber);

    const payload = {
      InitiatorName: env.DARAJA_B2C_INITIATOR,
      SecurityCredential: env.DARAJA_B2C_PASSWORD,
      CommandID: 'BusinessPayment',
      Amount: Math.ceil(params.amount),
      PartyA: env.DARAJA_SHORTCODE,
      PartyB: phone,
      Remarks: params.remarks,
      QueueTimeOutURL: `${env.DARAJA_CALLBACK_URL}/timeout`,
      ResultURL: `${env.DARAJA_CALLBACK_URL}/b2c/result`,
      Occasion: params.occasion || '',
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/b2c/v3/paymentrequest`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      logger.info('B2C initiated', {
        conversationId: response.data.ConversationID,
        phone,
      });

      return {
        success: true,
        conversationId: response.data.ConversationID,
        originatorConversationId: response.data.OriginatorConversationID,
        responseDescription: response.data.ResponseDescription,
      };
    } catch (error: any) {
      logger.error('B2C failed', { error: error.response?.data || error.message });
      throw new Error(
        error.response?.data?.errorMessage || 'Failed to initiate B2C payment'
      );
    }
  }

  private formatPhone(phone: string): string {
    let cleaned = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+254')) {
      cleaned = cleaned.slice(1);
    } else if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    return cleaned;
  }

  parseSTKCallback(body: any): {
    success: boolean;
    checkoutRequestId: string;
    merchantRequestId: string;
    amount?: number;
    mpesaReceipt?: string;
    phone?: string;
    transactionDate?: string;
  } {
    const callback = body?.Body?.stkCallback;
    if (!callback) {
      throw new Error('Invalid callback body');
    }

    const result = {
      success: callback.ResultCode === 0,
      checkoutRequestId: callback.CheckoutRequestID,
      merchantRequestId: callback.MerchantRequestID,
    } as any;

    if (callback.ResultCode === 0 && callback.CallbackMetadata?.Item) {
      const items = callback.CallbackMetadata.Item;
      for (const item of items) {
        switch (item.Name) {
          case 'Amount':
            result.amount = item.Value;
            break;
          case 'MpesaReceiptNumber':
            result.mpesaReceipt = item.Value;
            break;
          case 'PhoneNumber':
            result.phone = String(item.Value);
            break;
          case 'TransactionDate':
            result.transactionDate = String(item.Value);
            break;
        }
      }
    }

    return result;
  }
}

export const darajaService = new DarajaService();
