import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import prisma from '../lib/prisma';

const router = Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ error: "Transcript is required" });

    // Call Python AI Service
    const aiResponse = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:5000'}/api/ai/analyze-interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI Service error");
    }

    const aiData = await aiResponse.json();

    // Save to DB
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: (req as any).user.userId }
    });

    if (studentProfile) {
      await prisma.mockInterview.create({
        data: {
          studentId: studentProfile.id,
          transcript,
          aiFeedback: JSON.stringify({ strengths: aiData.strengths, areasToImprove: aiData.areasToImprove }),
          overallScore: aiData.overallScore,
          confidenceScore: aiData.confidenceLevel === "High" ? 90 : aiData.confidenceLevel === "Medium" ? 70 : 50,
        }
      });
    }

    res.json(aiData);

  } catch (error: any) {
    console.error("Mock Interview Error:", error);
    res.status(500).json({ error: "Internal server error during interview analysis" });
  }
});

export default router;
