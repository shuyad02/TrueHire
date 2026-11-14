import { Router } from 'express';
import {
  getJobs, getJobById, applyToJob,
  createJob, getCompanyApplications, updateApplicationStatus,
  getCompanyJobs, getJobApplications
} from '../controllers/jobs.controller';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

// Company only - specific routes MUST be defined before /:id
router.get('/company/jobs', authenticate, requireRole('COMPANY'), getCompanyJobs);
router.get('/company/applications', authenticate, requireRole('COMPANY'), getCompanyApplications);
router.put('/company/applications/:id/status', authenticate, requireRole('COMPANY'), updateApplicationStatus);

// Job specific applications (Company only)
router.get('/:id/applications', authenticate, requireRole('COMPANY'), getJobApplications);

// Student only
router.post('/:id/apply', authenticate, requireRole('STUDENT'), applyToJob);

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Company create job
router.post('/', authenticate, requireRole('COMPANY'), createJob);

export default router;
