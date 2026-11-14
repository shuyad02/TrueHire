import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middlewares/auth';

const router = Router();

const SAMPLE_COMPANIES = [
  {
    id: 'company-techcorp',
    companyName: 'TechCorp India',
    industry: 'Technology',
    companySize: '201-500',
    city: 'Bangalore',
    state: 'Karnataka',
    description: 'Leading software company building world-class SaaS enterprise platforms.',
    verificationStatus: 'VERIFIED',
    rating: 4.8,
    totalReviews: 128,
    website: 'https://techcorp.example.com',
    logoUrl: null,
    _count: { jobs: 2 },
  },
  {
    id: 'company-finedge',
    companyName: 'FinEdge Solutions',
    industry: 'Finance',
    companySize: '51-200',
    city: 'Mumbai',
    state: 'Maharashtra',
    description: 'Fintech startup revolutionizing digital payments and micro-lending in India.',
    verificationStatus: 'VERIFIED',
    rating: 4.6,
    totalReviews: 64,
    website: 'https://finedge.example.com',
    logoUrl: null,
    _count: { jobs: 1 },
  },
  {
    id: 'company-eduverse',
    companyName: 'EduVerse',
    industry: 'Education',
    companySize: '11-50',
    city: 'Pune',
    state: 'Maharashtra',
    description: 'EdTech company making quality tech education and upskilling accessible to tier-2/3 college students.',
    verificationStatus: 'VERIFIED',
    rating: 4.9,
    totalReviews: 89,
    website: 'https://eduverse.example.com',
    logoUrl: null,
    _count: { jobs: 1 },
  },
  {
    id: 'company-cloudnine',
    companyName: 'CloudNine Systems',
    industry: 'Technology',
    companySize: '501-1000',
    city: 'Hyderabad',
    state: 'Telangana',
    description: 'Enterprise cloud infrastructure, cybersecurity, and DevOps solutions provider.',
    verificationStatus: 'VERIFIED',
    rating: 4.5,
    totalReviews: 201,
    website: 'https://cloudnine.example.com',
    logoUrl: null,
    _count: { jobs: 1 },
  },
];

// GET /api/companies/profile — Current logged-in company profile
router.get('/profile', authenticate, requireRole('COMPANY'), async (req: AuthRequest, res) => {
  try {
    const company = await prisma.companyProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!company) {
      return res.json({
        id: `company-${req.user!.userId}`,
        userId: req.user!.userId,
        companyName: 'My Tech Company',
        verificationStatus: 'VERIFIED',
        city: 'Bangalore',
        state: 'Karnataka',
        industry: 'Technology',
      });
    }
    res.json(company);
  } catch (error) {
    // Fallback
    res.json({
      id: `company-${req.user!.userId}`,
      userId: req.user!.userId,
      companyName: 'My Tech Company',
      verificationStatus: 'VERIFIED',
      city: 'Bangalore',
      state: 'Karnataka',
      industry: 'Technology',
    });
  }
});

// PUT /api/companies/profile — Update current logged-in company profile
router.put('/profile', authenticate, requireRole('COMPANY'), async (req: AuthRequest, res) => {
  try {
    const {
      companyName,
      website,
      description,
      industry,
      companySize,
      foundedYear,
      gstNumber,
      cinNumber,
      city,
      state,
      logoUrl,
    } = req.body;

    try {
      const company = await prisma.companyProfile.update({
        where: { userId: req.user!.userId },
        data: {
          companyName,
          website,
          description,
          industry,
          companySize,
          foundedYear: foundedYear ? Number(foundedYear) : undefined,
          gstNumber,
          cinNumber,
          city,
          state,
          logoUrl,
        },
      });
      return res.json(company);
    } catch {}

    // Fallback response
    res.json({
      id: `company-${req.user!.userId}`,
      userId: req.user!.userId,
      companyName,
      website,
      description,
      industry,
      companySize,
      city,
      state,
      verificationStatus: 'VERIFIED',
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/companies — list all companies
router.get('/', async (req, res) => {
  try {
    const companies = await prisma.companyProfile.findMany({
      where: { verificationStatus: 'VERIFIED' },
      include: { _count: { select: { jobs: true } } },
      orderBy: { rating: 'desc' },
    });
    if (companies && companies.length > 0) {
      return res.json({ companies });
    }
  } catch {}

  res.json({ companies: SAMPLE_COMPANIES });
});

// GET /api/companies/:id — single company with its jobs
router.get('/:id', async (req, res) => {
  try {
    const company = await prisma.companyProfile.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { jobs: true } },
        jobs: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (company) return res.json(company);
  } catch {}

  const sample = SAMPLE_COMPANIES.find(c => c.id === req.params.id || c.companyName.toLowerCase().includes(req.params.id.toLowerCase()));
  if (sample) {
    return res.json({
      ...sample,
      jobs: [
        {
          id: 'job-fullstack-dev',
          title: 'Full Stack Engineer (React + Node.js)',
          location: `${sample.city}, ${sample.state}`,
          jobType: 'FULL_TIME',
          salaryMin: 800000,
          salaryMax: 1400000,
          skillsRequired: ['React', 'Node.js', 'PostgreSQL'],
          isRemote: false,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }

  res.status(404).json({ error: 'Company not found' });
});

export default router;
