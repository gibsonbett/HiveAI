import { Response, NextFunction } from 'express';
import { UserRole } from '../constants';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../utils/apiResponse';

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};
