import { Router } from 'express';
import {
  getCourses,
  getMyEnrollments,
  getCourseById,
  enrollCourse
} from '../controllers/courses.controller';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

// Public list
router.get('/', getCourses);

// Student enrollments (MUST be placed before /:id)
router.get('/my/enrollments', authenticate, requireRole('STUDENT'), getMyEnrollments);

// Single course details
router.get('/:id', getCourseById);

// Enroll in course
router.post('/:id/enroll', authenticate, requireRole('STUDENT'), enrollCourse);

export default router;
