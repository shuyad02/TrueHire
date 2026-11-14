import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import jobsRoutes from './routes/jobs.routes';
import uploadRoutes from './routes/upload.routes';
import coursesRoutes from './routes/courses.routes';
import collegeRoutes from './routes/college.routes';
import companiesRoutes from './routes/companies.routes';
import adminRoutes from './routes/admin.routes';
import settingsRoutes from './routes/settings.routes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── SECURITY MIDDLEWARE ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later.' },
});

app.use(globalLimiter);

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'TrueHire API', version: '2.0.0', timestamp: new Date().toISOString() });
});

// ─── API ROUTES ──────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/student', uploadRoutes); // Mount upload routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// ─── AI SERVICE PROXY ROUTES ─────────────────────────────────────────────────
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

app.post('/api/ai/parse-resume', async (req, res) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/ai/parse-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch {
    // Fallback mock if AI service is down
    res.json({
      extracted_skills: ['React', 'Node.js', 'TypeScript'],
      education: 'B.Tech Computer Science',
      experience_years: 1,
      message: 'Resume parsed (AI service offline — fallback used)',
    });
  }
});

app.post('/api/ai/match-jobs', async (req, res) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/ai/match-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch {
    res.json({ match_score: 75, missing_skills: [], message: 'AI service offline — fallback used' });
  }
});

app.post('/api/ai/analyze-interview', async (req, res) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/ai/analyze-interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch {
    res.json({
      overallScore: 78,
      confidenceLevel: 'High',
      strengths: [
        'Clear verbal articulation of background and skillset',
        'Focused on relevant project technical stack',
        'Good pacing and structured thoughts',
      ],
      areasToImprove: [
        'Quantify achievements with business metrics and KPIs',
        'Provide more concrete system design examples',
      ],
      feedback: 'Solid interview response. Adding specific metrics will enhance your score further.',
      message: 'Analyzed with fallback (AI service offline)',
    });
  }
});

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── ERROR HANDLER ───────────────────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── START SERVER ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 TrueHire API v2.0 running on http://localhost:${PORT}`);
  console.log(`🛡️  Security: Helmet + Rate Limiting enabled`);
  console.log(`🔐 Auth: JWT + Bcrypt enabled`);
  console.log(`✅ Health: http://localhost:${PORT}/health\n`);
});
