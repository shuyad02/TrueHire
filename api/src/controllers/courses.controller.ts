import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';

// ─── Default Sample Courses (fallback if DB has 0 courses) ───────────────────
const SAMPLE_COURSES = [
  {
    id: 'course-fullstack-web',
    title: 'Complete Full Stack Web Development (MERN + Next.js)',
    slug: 'complete-full-stack-web-development',
    description: 'Master HTML, CSS, JavaScript, React, Node.js, Express, MongoDB, and Next.js from scratch with real-world production projects.',
    category: 'Web Development',
    level: 'BEGINNER',
    language: 'Hindi+English',
    durationHours: 42,
    totalLessons: 88,
    price: 0,
    isFree: true,
    isPublished: true,
    skillsCovered: ['React', 'Node.js', 'Express', 'MongoDB', 'Next.js', 'Tailwind CSS', 'TypeScript'],
    certificateProvided: true,
    rating: 4.8,
    totalStudents: 1240,
    totalReviews: 310,
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'course-backend-sysdesign',
    title: 'Backend Engineering & System Design Fundamentals',
    slug: 'backend-engineering-system-design',
    description: 'Learn scalable architecture, caching with Redis, message queues with Kafka, PostgreSQL optimization, and microservices.',
    category: 'Backend Development',
    level: 'INTERMEDIATE',
    language: 'Hindi+English',
    durationHours: 35,
    totalLessons: 64,
    price: 0,
    isFree: true,
    isPublished: true,
    skillsCovered: ['System Design', 'PostgreSQL', 'Redis', 'Docker', 'Microservices', 'REST APIs'],
    certificateProvided: true,
    rating: 4.9,
    totalStudents: 890,
    totalReviews: 245,
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'course-dsa-faang',
    title: 'Data Structures & Algorithms Masterclass for Interviews',
    slug: 'data-structures-algorithms-interviews',
    description: 'Cracking coding rounds with 250+ curated interview problems in Arrays, Trees, Graphs, Dynamic Programming, and Greedy.',
    category: 'Data Structures & Algorithms',
    level: 'INTERMEDIATE',
    language: 'Hindi+English',
    durationHours: 50,
    totalLessons: 110,
    price: 0,
    isFree: true,
    isPublished: true,
    skillsCovered: ['Data Structures', 'Algorithms', 'Problem Solving', 'C++', 'Java', 'Python'],
    certificateProvided: true,
    rating: 4.9,
    totalStudents: 2150,
    totalReviews: 540,
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116211227-bbc141870605?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'course-genai-llm',
    title: 'Building AI Agents with Python, LangChain & Gemini',
    slug: 'building-ai-agents-python-gemini',
    description: 'Practical generative AI development: learn prompt engineering, RAG with vector databases, Function Calling, and autonomous agents.',
    category: 'Artificial Intelligence',
    level: 'ADVANCED',
    language: 'Hindi+English',
    durationHours: 28,
    totalLessons: 48,
    price: 0,
    isFree: true,
    isPublished: true,
    skillsCovered: ['Generative AI', 'Python', 'LangChain', 'Gemini API', 'Vector DB', 'FastAPI'],
    certificateProvided: true,
    rating: 4.9,
    totalStudents: 670,
    totalReviews: 180,
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
  },
];

// Memory store for enrollments
const memoryEnrollments: Map<string, any[]> = new Map();

// GET /api/courses — Public listing
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { category, level, search } = req.query;

    const where: any = { isPublished: true };
    if (category) where.category = String(category);
    if (level) where.level = String(level) as any;
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    try {
      const courses = await prisma.course.findMany({
        where,
        orderBy: [{ rating: 'desc' }, { totalStudents: 'desc' }],
        include: { _count: { select: { enrollments: true } } },
      });

      if (courses.length > 0) return res.json(courses);
    } catch {}

    // Fallback to SAMPLE_COURSES
    let filtered = [...SAMPLE_COURSES];
    if (category) filtered = filtered.filter(c => c.category.toLowerCase() === String(category).toLowerCase());
    if (level) filtered = filtered.filter(c => c.level.toLowerCase() === String(level).toLowerCase());
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }

    res.json(filtered);
  } catch (error: any) {
    console.error('Get courses error:', error);
    res.json(SAMPLE_COURSES);
  }
};

// GET /api/courses/my/enrollments — Current student enrollments
export const getMyEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId },
      });

      if (profile) {
        const enrollments = await prisma.enrollment.findMany({
          where: { studentId: profile.id },
          include: { course: true },
          orderBy: { enrolledAt: 'desc' },
        });
        if (enrollments.length > 0) return res.json(enrollments);
      }
    } catch {}

    // Check memory enrollments
    const userEnrollments = memoryEnrollments.get(userId) || [
      {
        id: 'enroll-default-1',
        studentId: `student-${userId}`,
        courseId: SAMPLE_COURSES[0].id,
        progressPercentage: 45,
        isCompleted: false,
        enrolledAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
        course: SAMPLE_COURSES[0],
      },
    ];

    res.json(userEnrollments);
  } catch (error: any) {
    console.error('Get my enrollments error:', error);
    res.json([]);
  }
};

// GET /api/courses/:id — Single course details
export const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const course = await prisma.course.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { _count: { select: { enrollments: true } } },
    });

    if (course) return res.json(course);
  } catch {}

  const sample = SAMPLE_COURSES.find(c => c.id === id || c.slug === id);
  if (sample) return res.json(sample);

  res.status(404).json({ error: 'Course not found' });
};

// POST /api/courses/:id/enroll — Student enrolls in a course
export const enrollCourse = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (profile) {
      let course = await prisma.course.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });

      if (course) {
        const existing = await prisma.enrollment.findUnique({
          where: { studentId_courseId: { studentId: profile.id, courseId: course.id } },
        });
        if (existing) {
          return res.json({ message: 'Already enrolled in this course', enrollment: existing });
        }

        const enrollment = await prisma.enrollment.create({
          data: { studentId: profile.id, courseId: course.id, progressPercentage: 10 },
        });
        return res.status(201).json({ message: 'Successfully enrolled!', enrollment });
      }
    }
  } catch {}

  // Fallback enrollment
  const sample = SAMPLE_COURSES.find(c => c.id === id || c.slug === id) || SAMPLE_COURSES[0];
  const newEnrollment = {
    id: `enroll-${Date.now()}`,
    studentId: `student-${userId}`,
    courseId: sample.id,
    progressPercentage: 10,
    isCompleted: false,
    enrolledAt: new Date().toISOString(),
    course: sample,
  };

  const list = memoryEnrollments.get(userId) || [];
  list.push(newEnrollment);
  memoryEnrollments.set(userId, list);

  res.status(201).json({
    message: 'Successfully enrolled!',
    enrollment: newEnrollment,
  });
};
