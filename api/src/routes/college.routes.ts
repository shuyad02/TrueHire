import { Router } from 'express';
import { getCollegeDashboard } from '../controllers/college.controller';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('COLLEGE'));

router.get('/dashboard', getCollegeDashboard);

export default router;
