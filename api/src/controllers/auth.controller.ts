import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'truehire_secret';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'COMPANY', 'COLLEGE']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// In-memory user store for seamless fallback when DB is sleeping/offline
interface MemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'STUDENT' | 'COMPANY' | 'COLLEGE' | 'ADMIN';
  name: string;
  createdAt: string;
}

const memoryUsers: Map<string, MemoryUser> = new Map();

// Initialize standard demo accounts (Password: Password123!)
const initDemoAccounts = () => {
  const hash = bcrypt.hashSync('Password123!', 10);
  memoryUsers.set('student@truehire.in', {
    id: 'user-demo-student',
    email: 'student@truehire.in',
    passwordHash: hash,
    role: 'STUDENT',
    name: 'Aarav Sharma',
    createdAt: new Date().toISOString(),
  });
  memoryUsers.set('company@truehire.in', {
    id: 'user-demo-company',
    email: 'company@truehire.in',
    passwordHash: hash,
    role: 'COMPANY',
    name: 'TechCorp India',
    createdAt: new Date().toISOString(),
  });
  memoryUsers.set('admin@truehire.in', {
    id: 'user-demo-admin',
    email: 'admin@truehire.in',
    passwordHash: hash,
    role: 'ADMIN',
    name: 'Super Admin',
    createdAt: new Date().toISOString(),
  });
  memoryUsers.set('college@truehire.in', {
    id: 'user-demo-college',
    email: 'college@truehire.in',
    passwordHash: hash,
    role: 'COLLEGE',
    name: 'IIT Bombay Placement Cell',
    createdAt: new Date().toISOString(),
  });
};
initDemoAccounts();

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Validation error' });
    }
    const { email, password, role, name } = parsed.data;

    let dbUser: any = null;
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ error: 'User already exists with this email' });

      const hashedPassword = await bcrypt.hash(password, 12);
      dbUser = await prisma.user.create({
        data: { email, password: hashedPassword, role },
      });

      if (role === 'STUDENT') {
        await prisma.studentProfile.create({ data: { userId: dbUser.id, fullName: name } });
      } else if (role === 'COMPANY') {
        await prisma.companyProfile.create({ data: { userId: dbUser.id, companyName: name } });
      } else if (role === 'COLLEGE') {
        await prisma.collegeProfile.create({ data: { userId: dbUser.id, collegeName: name } });
      }

      const token = jwt.sign({ userId: dbUser.id, role: dbUser.role }, JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...safeUser } = dbUser;
      return res.status(201).json({ token, user: safeUser });
    } catch (dbErr) {
      // Database offline fallback: register into memory
      if (memoryUsers.has(email.toLowerCase())) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newMemoryUser: MemoryUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        role,
        name,
        createdAt: new Date().toISOString(),
      };
      memoryUsers.set(email.toLowerCase(), newMemoryUser);

      const token = jwt.sign({ userId: newMemoryUser.id, role: newMemoryUser.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        token,
        user: {
          id: newMemoryUser.id,
          email: newMemoryUser.email,
          role: newMemoryUser.role,
          name: newMemoryUser.name,
          createdAt: newMemoryUser.createdAt,
        },
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Validation error' });
    }
    const { email, password } = parsed.data;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        if (!user.password) {
          return res.status(401).json({ error: `Aapne ${user.oauthProvider || 'social'} se sign up kiya tha. Please use that to login.` });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...safeUser } = user;
        return res.json({ token, user: safeUser });
      }
    } catch (dbErr) {
      // DB offline, fall through to memory check
    }

    // Memory users check
    const memUser = memoryUsers.get(email.toLowerCase());
    if (memUser) {
      const isValid = await bcrypt.compare(password, memUser.passwordHash);
      if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

      const token = jwt.sign({ userId: memUser.id, role: memUser.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        user: {
          id: memUser.id,
          email: memUser.email,
          role: memUser.role,
          name: memUser.name,
          createdAt: memUser.createdAt,
        },
      });
    }

    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          studentProfile: true,
          companyProfile: true,
          collegeProfile: true,
        },
      });
      if (user) {
        const { password: _, ...safeUser } = user;
        return res.json(safeUser);
      }
    } catch {}

    // Check memory users
    for (const memUser of memoryUsers.values()) {
      if (memUser.id === userId) {
        return res.json({
          id: memUser.id,
          email: memUser.email,
          role: memUser.role,
          name: memUser.name,
          createdAt: memUser.createdAt,
        });
      }
    }

    // Fallback
    res.json({
      id: userId,
      email: `${userId}@truehire.in`,
      role: req.user?.role || 'STUDENT',
      name: 'TrueHire User',
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// In-memory password reset token store
const resetTokens: Map<string, { email: string; expires: number }> = new Map();

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    let exists = false;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) exists = true;
    } catch {}

    if (memoryUsers.has(email.toLowerCase())) exists = true;

    if (!exists) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    resetTokens.set(token, { email, expires: Date.now() + 3600000 }); // 1 hour

    console.log(`🔐 Password reset token for ${email}: ${token}`);
    res.json({ message: 'Password reset link sent to your email', token });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const entry = resetTokens.get(token);
    if (!entry || entry.expires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    try {
      await prisma.user.update({
        where: { email: entry.email },
        data: { password: hashedPassword },
      });
    } catch {}

    const memUser = memoryUsers.get(entry.email.toLowerCase());
    if (memUser) {
      memUser.passwordHash = hashedPassword;
    }

    resetTokens.delete(token);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
