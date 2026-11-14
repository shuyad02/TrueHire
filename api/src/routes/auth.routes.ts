import { Router } from 'express';
import { register, login, getMe, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { googleRedirect, googleCallback, githubRedirect, githubCallback } from '../controllers/oauth.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// OAuth Routes
router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);
router.get('/github', githubRedirect);
router.get('/github/callback', githubCallback);

export default router;
