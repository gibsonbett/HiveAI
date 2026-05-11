import { Router } from 'express';
import * as paymentController from '../../controllers/paymentController';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserRole } from '../../constants';
import { depositSchema, withdrawalSchema, rejectWithdrawalSchema, upgradePlanSchema } from '../../validators/paymentValidators';

const router = Router();

// M-Pesa callback (no auth — Safaricom calls this)
router.post('/mpesa/callback', asyncHandler(paymentController.mpesaCallback as any));

// Authenticated routes
router.use(authenticate);

// Wallet info
router.get('/wallet', asyncHandler(paymentController.getWallet as any));
router.get('/transactions', asyncHandler(paymentController.getTransactions as any));
router.get('/plans', asyncHandler(paymentController.getPlans as any));
router.get('/subscription', asyncHandler(paymentController.getSubscription as any));
router.post(
	'/plans/upgrade',
	authorize(UserRole.CLIENT, UserRole.WORKER, UserRole.REVIEWER),
	validate(upgradePlanSchema),
	asyncHandler(paymentController.initiatePlanUpgrade as any)
);

// Deposit via M-Pesa STK Push
router.post('/deposit', validate(depositSchema), asyncHandler(paymentController.initiateDeposit as any));

// Withdrawal
router.post('/withdraw', authorize(UserRole.WORKER), validate(withdrawalSchema), asyncHandler(paymentController.requestWithdrawal as any));

// Admin: manage withdrawals
router.get('/withdrawals/pending', authorize(UserRole.ADMIN), asyncHandler(paymentController.getPendingWithdrawals as any));
router.post('/withdrawals/:id/approve', authorize(UserRole.ADMIN), asyncHandler(paymentController.approveWithdrawal as any));
router.post('/withdrawals/:id/reject', authorize(UserRole.ADMIN), validate(rejectWithdrawalSchema), asyncHandler(paymentController.rejectWithdrawal as any));

export default router;
