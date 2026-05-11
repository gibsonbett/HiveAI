import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (!this.transporter) {
      if (!env.SMTP_USER || !env.SMTP_PASS) {
        logger.warn('SMTP credentials not configured — emails will be logged only');
      }
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT),
        secure: parseInt(env.SMTP_PORT) === 465,
        auth:
          env.SMTP_USER && env.SMTP_PASS
            ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
            : undefined,
      });
    }
    return this.transporter;
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      logger.info(`[Email] To: ${to} | Subject: ${subject}`);
      logger.debug(`[Email] Body: ${html}`);
      return;
    }

    try {
      await this.getTransporter().sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
    }
  }

  async sendVerificationEmail(to: string, firstName: string, token: string): Promise<void> {
    const verifyUrl = `${env.APP_URL}/auth/verify-email?token=${token}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to HiveAI, ${firstName}!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">Or copy this link: ${verifyUrl}</p>
        <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
      </div>
    `;
    await this.send(to, 'Verify your HiveAI email', html);
  }

  async sendPasswordResetEmail(to: string, firstName: string, token: string): Promise<void> {
    const resetUrl = `${env.APP_URL}/auth/reset-password?token=${token}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${firstName}, we received a request to reset your password.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">Or copy this link: ${resetUrl}</p>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `;
    await this.send(to, 'Reset your HiveAI password', html);
  }

  async sendTaskAssignedEmail(to: string, firstName: string, projectTitle: string): Promise<void> {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Task Available</h2>
        <p>Hi ${firstName}, a new task from project <strong>${projectTitle}</strong> has been assigned to you.</p>
        <a href="${env.APP_URL}/dashboard/worker" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          View Tasks
        </a>
      </div>
    `;
    await this.send(to, 'New task assigned - HiveAI', html);
  }

  async sendWithdrawalApprovedEmail(to: string, firstName: string, amount: number): Promise<void> {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Withdrawal Approved</h2>
        <p>Hi ${firstName}, your withdrawal of <strong>KES ${amount.toLocaleString()}</strong> has been approved and is being processed.</p>
      </div>
    `;
    await this.send(to, 'Withdrawal approved - HiveAI', html);
  }

  async sendSignupApprovalRequestEmail(
    to: string,
    adminFirstName: string,
    applicant: { firstName: string; lastName: string; role: string; email: string },
    approvalToken: string,
    userId: string
  ): Promise<void> {
    const approvalUrl = `${env.APP_URL}/auth/approve-signup?token=${approvalToken}&userId=${userId}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New signup awaiting approval</h2>
        <p>Hi ${adminFirstName}, a new ${applicant.role} account is waiting for approval.</p>
        <p>
          <strong>Name:</strong> ${applicant.firstName} ${applicant.lastName}<br />
          <strong>Email:</strong> ${applicant.email}
        </p>
        <a href="${approvalUrl}" style="display: inline-block; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Approve Account
        </a>
        <p style="color: #666; font-size: 14px;">This secure link expires in 24 hours.</p>
      </div>
    `;
    await this.send(to, 'Approval required: new HiveAI signup', html);
  }

  async sendSignupApprovedEmail(to: string, firstName: string): Promise<void> {
    const loginUrl = `${env.APP_URL}/auth/login`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your HiveAI account is approved</h2>
        <p>Hi ${firstName}, your account has been approved by our team.</p>
        <a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Log in to HiveAI
        </a>
        <p style="color: #666; font-size: 14px;">You can now sign in and start using the platform.</p>
      </div>
    `;
    await this.send(to, 'Your HiveAI account is approved', html);
  }
}

export const emailService = new EmailService();
