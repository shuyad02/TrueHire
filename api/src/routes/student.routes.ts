import { Router } from 'express';
import { getProfile, updateProfile, getDashboard, getApplications, submitMockInterview } from '../controllers/student.controller';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('STUDENT'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/dashboard', getDashboard);
router.get('/applications', getApplications);
router.post('/mock-interview', submitMockInterview);

export default router;
