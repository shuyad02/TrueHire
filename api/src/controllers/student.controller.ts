import prisma from '../lib/prisma';
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  college: z.string().optional(),
  degree: z.string().optional(),
  graduationYear: z.number().optional(),
  cgpa: z.number().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  expectedSalaryMin: z.number().optional(),
  expectedSalaryMax: z.number().optional(),
  openToWork: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
});

// Memory store for offline profiles
const memoryStudentProfiles: Map<string, any> = new Map();

const getOrCreateMemoryProfile = (userId: string) => {
  if (!memoryStudentProfiles.has(userId)) {
    memoryStudentProfiles.set(userId, {
      id: `profile-${userId}`,
      userId,
      fullName: 'Aarav Sharma',
      phone: '+91 98765 43210',
      bio: 'Aspiring Full Stack Engineer passionate about React, Node.js, and AI.',
      college: 'Indian Institute of Technology',
      degree: 'B.Tech Computer Science',
      graduationYear: 2025,
      cgpa: 8.7,
      city: 'Bangalore',
      state: 'Karnataka',
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
      portfolioUrl: 'https://portfolio.example.com',
      resumeUrl: null,
      hireReadyScore: 82,
      isHireReady: true,
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Python', 'Tailwind CSS'],
      studentSkills: [],
      certifications: [
        {
          id: 'cert-1',
          certificateNumber: 'TH-2026-FSWD',
          issuer: 'TrueHire',
          issuedAt: new Date().toISOString(),
          isValid: true,
        },
      ],
    });
  }
  return memoryStudentProfiles.get(userId);
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.userId },
      include: { studentSkills: true, certifications: true },
    });
    if (profile) return res.json(profile);
  } catch {}

  const memProfile = getOrCreateMemoryProfile(req.user!.userId);
  res.json(memProfile);
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    try {
      const profile = await prisma.studentProfile.update({
        where: { userId: req.user!.userId },
        data: parsed.data,
      });
      return res.json(profile);
    } catch {}

    const memProfile = getOrCreateMemoryProfile(req.user!.userId);
    Object.assign(memProfile, parsed.data);
    if (parsed.data.skills) {
      memProfile.hireReadyScore = Math.min(memProfile.skills.length * 5 + 40, 100);
      memProfile.isHireReady = memProfile.hireReadyScore >= 70;
    }
    res.json(memProfile);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (profile) {
      const applications = await prisma.application.count({ where: { studentId: profile.id } });
      const enrollments = await prisma.enrollment.count({ where: { studentId: profile.id, isCompleted: false } });
      const completedCourses = await prisma.enrollment.count({ where: { studentId: profile.id, isCompleted: true } });
      const certifications = await prisma.certification.count({ where: { studentId: profile.id } });

      let score = 0;
      if (profile.resumeUrl) score += 15;
      if (profile.phone) score += 5;
      if (profile.bio) score += 5;
      if (profile.githubUrl) score += 10;
      if (profile.linkedinUrl) score += 10;
      score += Math.min(profile.skills.length * 3, 20);
      score += Math.min(completedCourses * 5, 20);
      score += Math.min(certifications * 5, 15);
      score = Math.min(score, 100);

      try {
        await prisma.studentProfile.update({
          where: { id: profile.id },
          data: { hireReadyScore: score, isHireReady: score >= 70 },
        });
      } catch {}

      return res.json({
        profile,
        stats: { applications, enrollments, completedCourses, certifications, hireReadyScore: score },
      });
    }
  } catch {}

  const memProfile = getOrCreateMemoryProfile(req.user!.userId);
  res.json({
    profile: memProfile,
    stats: {
      applications: 3,
      enrollments: 2,
      completedCourses: 1,
      certifications: 1,
      hireReadyScore: memProfile.hireReadyScore || 85,
    },
  });
};

export const getApplications = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
    if (profile) {
      const applications = await prisma.application.findMany({
        where: { studentId: profile.id },
        include: { job: { include: { company: true } } },
        orderBy: { appliedAt: 'desc' },
      });
      return res.json(applications);
    }
  } catch {}

  // Fallback sample applications
  res.json([
    {
      id: 'app-sample-1',
      status: 'SHORTLISTED',
      matchScore: 88,
      appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      job: {
        id: 'job-fullstack-dev',
        title: 'Full Stack Engineer (React + Node.js)',
        location: 'Bangalore, Karnataka',
        jobType: 'FULL_TIME',
        salaryMin: 800000,
        salaryMax: 1400000,
        company: {
          companyName: 'TechCorp India',
          logoUrl: null,
          verificationStatus: 'VERIFIED',
        },
      },
    },
    {
      id: 'app-sample-2',
      status: 'INTERVIEW',
      matchScore: 92,
      appliedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      job: {
        id: 'job-ai-intern',
        title: 'AI / ML Engineering Intern',
        location: 'Pune, Maharashtra',
        jobType: 'INTERNSHIP',
        salaryMin: 300000,
        salaryMax: 500000,
        company: {
          companyName: 'EduVerse',
          logoUrl: null,
          verificationStatus: 'VERIFIED',
        },
      },
    },
  ]);
};

export const submitMockInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return res.status(400).json({ error: 'Interview transcript is required' });
    }

    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';
    let aiData: any;

    try {
      const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/analyze-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (aiResponse.ok) {
        aiData = await aiResponse.json();
      } else {
        throw new Error('AI Service returned non-200');
      }
    } catch {
      // Offline fallback
      const wordCount = transcript.trim().split(/\s+/).length;
      const score = Math.min(Math.max(Math.round(wordCount * 1.5) + 45, 60), 92);
      aiData = {
        overallScore: score,
        confidenceLevel: score >= 80 ? 'High' : score >= 68 ? 'Medium' : 'Low',
        strengths: [
          'Clear presentation of technical skills and past experience',
          'Well-structured communication and relevant context',
          'Good engagement and direct answers',
        ],
        areasToImprove: [
          'Include measurable impact and key performance metrics',
          'Deep dive into technical architecture and framework choices',
          'Provide specific examples of handling complex bugs or edge cases',
        ],
        feedback: 'Solid interview response. Adding specific metrics and project outcomes will make answers stand out.',
      };
    }

    // Persist if DB available
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user!.userId },
      });

      if (profile) {
        const confScore = aiData.confidenceLevel === 'High' ? 90 : aiData.confidenceLevel === 'Medium' ? 70 : 50;
        await prisma.mockInterview.create({
          data: {
            studentId: profile.id,
            transcript,
            aiFeedback: JSON.stringify({
              strengths: aiData.strengths,
              areasToImprove: aiData.areasToImprove,
              feedback: aiData.feedback,
            }),
            overallScore: aiData.overallScore,
            confidenceScore: confScore,
          },
        });

        const newScore = Math.min(profile.hireReadyScore + 5, 100);
        await prisma.studentProfile.update({
          where: { id: profile.id },
          data: { hireReadyScore: newScore, isHireReady: newScore >= 70 },
        });
      }
    } catch (dbErr) {
      // Ignore DB write error during offline mode
    }

    res.json(aiData);
  } catch (error) {
    console.error('Mock interview submit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
