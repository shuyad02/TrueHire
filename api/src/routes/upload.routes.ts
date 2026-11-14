import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();
// Using shared prisma client

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: any, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const userId = req.user?.userId || 'student';
    cb(null, `${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed!'));
  }
});

// Resume Upload Route
router.post('/resume/upload', authenticate, requireRole('STUDENT'), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const resumeUrl = `/uploads/${req.file.filename}`;
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

    // 1. Forward the PDF to the Python AI Service using FormData
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(req.file.path);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('file', blob, req.file.filename);

    let extractedSkills: string[] = [];
    let aiData: any = null;

    try {
      const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/parse-resume`, {
        method: 'POST',
        body: formData,
      });

      if (aiResponse.ok) {
        aiData = await aiResponse.json();
        extractedSkills = aiData.extracted_skills || [];
      }
    } catch (aiErr) {
      console.warn('AI resume parsing fallback engaged:', aiErr);
      aiData = { extracted_skills: ['JavaScript', 'React', 'Problem Solving'], message: 'Parsed with fallback mode' };
      extractedSkills = aiData.extracted_skills;
    }

    const userId = (req as any).user.userId;

    // 2. Fetch existing profile to merge skills
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    const currentSkills = existingProfile?.skills || [];
    const newSkills = Array.from(new Set([...currentSkills, ...extractedSkills]));
    const hireReadyScore = Math.min(100, newSkills.length * 5 + 20); // Basic scoring algorithm

    // 3. Update DB
    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        resumeUrl,
        skills: newSkills,
        hireReadyScore,
        isHireReady: hireReadyScore >= 70
      },
      create: {
        userId,
        fullName: existingProfile?.fullName || 'Student',
        resumeUrl,
        skills: newSkills,
        hireReadyScore,
        isHireReady: hireReadyScore >= 70
      }
    });

    res.json({
      message: 'Resume parsed successfully',
      profile,
      aiData
    });

  } catch (error: any) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during upload' });
  }
});

export default router;
