import { Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  path: '/',
};

const shouldExposeTokensInBody = env.NODE_ENV !== 'production';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, phone, password, role } = req.body;
  const { user, accessToken, refreshToken } = await authService.register({
    firstName, lastName, email, phone, password, role,
  });

  if (accessToken && refreshToken) {
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });
  }

  sendSuccess(
    res,
    shouldExposeTokensInBody && accessToken ? { user, accessToken } : { user },
    user.status === 'pending'
      ? 'Registration successful. Your account is awaiting admin approval.'
      : 'Registration successful',
    201
  );
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);

  res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });

  sendSuccess(
    res,
    shouldExposeTokensInBody ? { user, accessToken } : { user },
    'Login successful'
  );
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;
  if (req.user && refreshToken) {
    await authService.logout(req.user.userId, refreshToken);
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Logged out successfully');
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const oldRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  const { accessToken, refreshToken } = await authService.refreshTokens(oldRefreshToken);

  res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });

  sendSuccess(res, shouldExposeTokensInBody ? { accessToken } : null, 'Tokens refreshed');
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  await authService.verifyEmail(req.body.token);
  sendSuccess(res, null, 'Email verified successfully');
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, null, 'If the email exists, a reset link has been sent');
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  await authService.resetPassword(req.body.token, req.body.password);
  sendSuccess(res, null, 'Password reset successful');
};

export const approveSignup = async (req: Request, res: Response): Promise<void> => {
  const user = await authService.approveSignupByToken(req.body.userId, req.body.token);
  sendSuccess(res, { user }, 'User approved successfully');
};
