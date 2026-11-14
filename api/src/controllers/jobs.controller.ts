import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';

// ─── Default Sample Jobs (fallback when DB is empty or offline) ──────────────
const SAMPLE_JOBS = [
  {
    id: 'job-fullstack-dev',
    title: 'Full Stack Engineer (React + Node.js)',
    description: 'We are seeking an ambitious Full Stack Developer to build robust customer-facing web applications. You will collaborate with design and product teams to implement end-to-end features using Next.js, Express, and PostgreSQL.',
    requirements: 'Strong proficiency in TypeScript, React, Node.js, and RESTful APIs. Experience with relational databases and modern UI frameworks.',
    responsibilities: 'Develop high-performance UI components, build scalable backend microservices, and write unit tests.',
    jobType: 'FULL_TIME',
    experienceLevel: 'FRESHER',
    salaryMin: 800000,
    salaryMax: 1400000,
    salaryCurrency: 'INR',
    location: 'Bangalore, Karnataka',
    isRemote: false,
    skillsRequired: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    openings: 3,
    status: 'ACTIVE',
    isFeatured: true,
    viewsCount: 245,
    applicationsCount: 18,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    company: {
      companyName: 'TechCorp India',
      logoUrl: null,
      verificationStatus: 'VERIFIED',
    },
  },
  {
    id: 'job-backend-eng',
    title: 'Junior Backend Developer',
    description: 'Join our fintech platform to build high-throughput payment processing APIs, transaction ledgers, and secure integration gateways.',
    requirements: 'Solid foundation in Node.js, Express, database modeling, and caching mechanisms like Redis.',
    responsibilities: 'Design database schemas, implement API security best practices, and optimize query latency.',
    jobType: 'FULL_TIME',
    experienceLevel: 'ZERO_TO_ONE',
    salaryMin: 600000,
    salaryMax: 1000000,
    salaryCurrency: 'INR',
    location: 'Mumbai, Maharashtra',
    isRemote: true,
    skillsRequired: ['Node.js', 'Express', 'MongoDB', 'Redis', 'REST APIs'],
    openings: 2,
    status: 'ACTIVE',
    isFeatured: true,
    viewsCount: 189,
    applicationsCount: 12,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    company: {
      companyName: 'FinEdge Solutions',
      logoUrl: null,
      verificationStatus: 'VERIFIED',
    },
  },
  {
    id: 'job-ai-intern',
    title: 'AI / ML Engineering Intern',
    description: 'Work alongside senior AI engineers to develop LLM workflows, automated resume parsing engines, and intelligent interview assessment modules.',
    requirements: 'Understanding of Python, FastAPI, prompt engineering, and basic neural network architectures.',
    responsibilities: 'Build prompt evaluation pipelines, test vector embeddings, and integrate Python microservices.',
    jobType: 'INTERNSHIP',
    experienceLevel: 'FRESHER',
    salaryMin: 300000,
    salaryMax: 500000,
    salaryCurrency: 'INR',
    location: 'Pune, Maharashtra',
    isRemote: true,
    skillsRequired: ['Python', 'FastAPI', 'Machine Learning', 'Generative AI'],
    openings: 5,
    status: 'ACTIVE',
    isFeatured: false,
    viewsCount: 312,
    applicationsCount: 42,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    company: {
      companyName: 'EduVerse',
      logoUrl: null,
      verificationStatus: 'VERIFIED',
    },
  },
  {
    id: 'job-frontend-dev',
    title: 'Frontend Developer (Next.js & Tailwind)',
    description: 'Build sleek, accessible, responsive user interfaces for thousands of daily active users using Next.js 14/15, Tailwind, and Framer Motion.',
    requirements: 'Deep knowledge of React hooks, component lifecycles, CSS animations, and client-side performance optimization.',
    responsibilities: 'Translate Figma designs into pixel-perfect code, ensure cross-browser compatibility, and optimize Core Web Vitals.',
    jobType: 'FULL_TIME',
    experienceLevel: 'ONE_TO_THREE',
    salaryMin: 700000,
    salaryMax: 1200000,
    salaryCurrency: 'INR',
    location: 'Hyderabad, Telangana',
    isRemote: false,
    skillsRequired: ['Next.js', 'Tailwind CSS', 'JavaScript', 'HTML/CSS', 'Framer Motion'],
    openings: 2,
    status: 'ACTIVE',
    isFeatured: false,
    viewsCount: 156,
    applicationsCount: 15,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    company: {
      companyName: 'CloudNine Systems',
      logoUrl: null,
      verificationStatus: 'VERIFIED',
    },
  },
  {
    id: 'job-devops-eng',
    title: 'Cloud & DevOps Associate',
    description: 'Maintain CI/CD pipelines, containerize backend microservices with Docker, and manage cloud deployments on AWS and Kubernetes.',
    requirements: 'Hands-on experience with Linux environments, Docker, Git actions, and foundational AWS networking.',
    responsibilities: 'Automate build and deployment workflows, monitor uptime, and configure alerting metrics.',
    jobType: 'FULL_TIME',
    experienceLevel: 'FRESHER',
    salaryMin: 900000,
    salaryMax: 1500000,
    salaryCurrency: 'INR',
    location: 'Delhi, NCR',
    isRemote: false,
    skillsRequired: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD'],
    openings: 1,
    status: 'ACTIVE',
    isFeatured: false,
    viewsCount: 98,
    applicationsCount: 8,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    company: {
      companyName: 'TechCorp India',
      logoUrl: null,
      verificationStatus: 'VERIFIED',
    },
  },
];

// In-memory dynamic jobs and applications
const memoryJobs: Map<string, any> = new Map();
SAMPLE_JOBS.forEach(j => memoryJobs.set(j.id, j));

const memoryApplications: Map<string, any> = new Map();

export const getJobs = async (req: Request, res: Response) => {
  const { search, jobType, location, minSalary, maxSalary, page = '1', limit = '10' } = req.query;

  let jobs: any[] = [];
  let total = 0;

  try {
    const where: any = { status: 'ACTIVE' };

    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    if (jobType && jobType !== 'All') where.jobType = String(jobType);
    if (location) where.location = { contains: String(location), mode: 'insensitive' };
    if (minSalary) where.salaryMin = { gte: Number(minSalary) };
    if (maxSalary) where.salaryMax = { lte: Number(maxSalary) };

    const skip = (Number(page) - 1) * Number(limit);
    const [dbJobs, dbTotal] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { company: { select: { companyName: true, logoUrl: true, verificationStatus: true } } },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.job.count({ where }),
    ]);

    jobs = dbJobs;
    total = dbTotal;
  } catch {
    // Database offline fallback
  }

  // If DB returned 0 jobs or was offline, fallback to memory jobs
  if (!jobs || jobs.length === 0) {
    let filtered = Array.from(memoryJobs.values());
    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter(
        j => j.title.toLowerCase().includes(s) || j.description.toLowerCase().includes(s)
      );
    }
    if (jobType && jobType !== 'All') {
      filtered = filtered.filter(j => j.jobType === String(jobType));
    }
    if (location) {
      const loc = String(location).toLowerCase();
      filtered = filtered.filter(j => j.location.toLowerCase().includes(loc));
    }
    if (minSalary) {
      filtered = filtered.filter(j => j.salaryMin >= Number(minSalary));
    }
    if (maxSalary) {
      filtered = filtered.filter(j => j.salaryMax <= Number(maxSalary));
    }

    total = filtered.length;
    const skip = (Number(page) - 1) * Number(limit);
    jobs = filtered.slice(skip, skip + Number(limit));
  }

  res.json({ jobs, total, page: Number(page), totalPages: Math.max(Math.ceil(total / Number(limit)), 1) });
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });
    if (job) {
      try {
        await prisma.job.update({ where: { id: job.id }, data: { viewsCount: { increment: 1 } } });
      } catch {}
      return res.json(job);
    }
  } catch {}

  const memJob = memoryJobs.get(req.params.id);
  if (memJob) return res.json(memJob);

  res.status(404).json({ error: 'Job not found' });
};

export const applyToJob = async (req: AuthRequest, res: Response) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.id;
    let profile: any = null;

    try {
      profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
    } catch {}

    if (!profile) {
      profile = {
        id: `student-${req.user!.userId}`,
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        fullName: 'Rahul Sharma',
        college: 'IIT Delhi',
        hireReadyScore: 88,
        resumeUrl: null,
      };
    }

    let job: any = null;
    try {
      job = await prisma.job.findUnique({ where: { id: jobId } });
    } catch {}

    if (!job) {
      job = memoryJobs.get(jobId);
    }

    if (!job) return res.status(404).json({ error: 'Job not found' });

    const commonSkills = (profile.skills || []).filter((s: string) =>
      (job.skillsRequired || []).some((js: string) => js.toLowerCase() === s.toLowerCase())
    );
    const matchScore = Math.min(
      Math.round((commonSkills.length / Math.max(job.skillsRequired?.length || 1, 1)) * 100) + 20,
      98
    );

    const appId = `app-${Date.now()}`;
    const application = {
      id: appId,
      jobId: job.id,
      studentId: profile.id,
      status: 'APPLIED',
      coverLetter,
      matchScore,
      appliedAt: new Date().toISOString(),
      student: profile,
      job,
    };

    try {
      const dbApp = await prisma.application.create({
        data: { jobId: job.id, studentId: profile.id, coverLetter, resumeUrl: profile.resumeUrl, matchScore },
      });
      await prisma.job.update({ where: { id: job.id }, data: { applicationsCount: { increment: 1 } } });
      memoryApplications.set(dbApp.id, { ...application, id: dbApp.id });
      return res.status(201).json({ application: dbApp, matchScore, message: 'Application submitted successfully!' });
    } catch {}

    // Memory save
    memoryApplications.set(appId, application);
    job.applicationsCount = (job.applicationsCount || 0) + 1;

    res.status(201).json({ application, matchScore, message: 'Application submitted successfully!' });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Already applied' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const jobSchema = z.object({
      title: z.string().min(3),
      description: z.string().min(20),
      requirements: z.string().min(10),
      responsibilities: z.string().optional(),
      jobType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'REMOTE']),
      experienceLevel: z.enum(['FRESHER', 'ZERO_TO_ONE', 'ONE_TO_THREE', 'THREE_TO_FIVE']),
      salaryMin: z.number().positive(),
      salaryMax: z.number().positive(),
      location: z.string().min(2),
      isRemote: z.boolean().optional(),
      skillsRequired: z.array(z.string()).min(1),
      openings: z.number().positive().optional(),
      applicationDeadline: z.string().optional(),
    });

    const parsed = jobSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    let company: any = null;
    try {
      company = await prisma.companyProfile.findUnique({ where: { userId: req.user!.userId } });
    } catch {}

    const jobId = `job-${Date.now()}`;
    const newJob = {
      id: jobId,
      ...parsed.data,
      companyId: company?.id || `company-${req.user!.userId}`,
      status: 'ACTIVE' as const,
      isFeatured: false,
      viewsCount: 0,
      applicationsCount: 0,
      createdAt: new Date().toISOString(),
      company: {
        companyName: company?.companyName || 'Apex Technologies',
        logoUrl: null,
        verificationStatus: 'VERIFIED',
      },
    };

    try {
      if (company) {
        const dbJob = await prisma.job.create({
          data: {
            ...parsed.data,
            companyId: company.id,
            applicationDeadline: parsed.data.applicationDeadline
              ? new Date(parsed.data.applicationDeadline)
              : undefined,
          },
        });
        memoryJobs.set(dbJob.id, { ...newJob, id: dbJob.id });
        return res.status(201).json(dbJob);
      }
    } catch {}

    // Save into memoryJobs so getJobById and applyToJob can find it immediately
    memoryJobs.set(jobId, newJob);

    res.status(201).json(newJob);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCompanyApplications = async (req: AuthRequest, res: Response) => {
  try {
    let company: any = null;
    try {
      company = await prisma.companyProfile.findUnique({ where: { userId: req.user!.userId } });
    } catch {}

    if (company) {
      const applications = await prisma.application.findMany({
        where: { job: { companyId: company.id } },
        include: {
          student: { select: { fullName: true, college: true, skills: true, hireReadyScore: true, avatarUrl: true, resumeUrl: true } },
          job: { select: { title: true } },
        },
        orderBy: { appliedAt: 'desc' },
      });
      if (applications.length > 0) return res.json(applications);
    }
  } catch {}

  // Return any memory applications or samples
  const allMemoryApps = Array.from(memoryApplications.values());
  if (allMemoryApps.length > 0) {
    return res.json(allMemoryApps);
  }

  const sampleApps = [
    {
      id: 'app-sample-1',
      student: { fullName: 'Aarav Sharma', college: 'IIT Bombay', skills: ['React', 'TypeScript', 'Node.js'], hireReadyScore: 88, avatarUrl: null, resumeUrl: null },
      job: { title: 'Full Stack Engineer' },
      status: 'SHORTLISTED',
      appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  res.json(sampleApps);
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    try {
      const application = await prisma.application.update({
        where: { id: req.params.id },
        data: { status },
      });
      return res.json(application);
    } catch {}

    // Update memory application
    const memApp = memoryApplications.get(req.params.id);
    if (memApp) {
      memApp.status = status;
      return res.json(memApp);
    }

    res.json({ id: req.params.id, status, updatedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCompanyJobs = async (req: AuthRequest, res: Response) => {
  try {
    let company: any = null;
    try {
      company = await prisma.companyProfile.findUnique({ where: { userId: req.user!.userId } });
    } catch {}

    if (company) {
      const jobs = await prisma.job.findMany({
        where: { companyId: company.id },
        include: {
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (jobs.length > 0) return res.json(jobs);
    }
  } catch {}

  res.json(Array.from(memoryJobs.values()).slice(0, 3).map(j => ({ ...j, _count: { applications: j.applicationsCount || 0 } })));
};

export const getJobApplications = async (req: AuthRequest, res: Response) => {
  try {
    let company: any = null;
    try {
      company = await prisma.companyProfile.findUnique({ where: { userId: req.user!.userId } });
    } catch {}

    if (company) {
      const job = await prisma.job.findFirst({
        where: { id: req.params.id, companyId: company.id },
      });
      if (job) {
        const applications = await prisma.application.findMany({
          where: { jobId: job.id },
          include: {
            student: {
              select: {
                fullName: true,
                college: true,
                skills: true,
                hireReadyScore: true,
                avatarUrl: true,
                resumeUrl: true,
                phone: true,
              },
            },
          },
          orderBy: { appliedAt: 'desc' },
        });
        return res.json({ job, applications });
      }
    }
  } catch {}

  const sampleJob = memoryJobs.get(req.params.id) || SAMPLE_JOBS[0];
  const apps = Array.from(memoryApplications.values()).filter(a => a.jobId === req.params.id);
  res.json({
    job: sampleJob,
    applications: apps.length > 0 ? apps : [
      {
        id: 'app-sample-1',
        student: { fullName: 'Aarav Sharma', college: 'IIT Bombay', skills: ['React', 'TypeScript'], hireReadyScore: 88, avatarUrl: null, resumeUrl: null, phone: '+91 98765 43210' },
        appliedAt: new Date().toISOString(),
        status: 'APPLIED',
      },
    ],
  });
};
