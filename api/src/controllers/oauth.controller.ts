import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'truehire_secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────────

export const googleRedirect = (req: Request, res: Response) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = `${process.env.API_URL || 'http://localhost:4000'}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.API_URL || 'http://localhost:4000'}/api/auth/google/callback`;

  try {
    // Step 1: Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenData = await tokenRes.json() as any;
    if (!tokenData.access_token) {
      return res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
    }

    // Step 2: Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json() as any;

    const { email, name, id: googleId } = googleUser;
    if (!email) return res.redirect(`${FRONTEND_URL}/login?error=no_email`);

    // Step 3: Find or create user in DB
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role: 'STUDENT',
          oauthProvider: 'google',
          oauthId: googleId,
          isVerified: true,
        },
      });
      // Create default student profile
      await prisma.studentProfile.create({
        data: { userId: user.id, fullName: name || email.split('@')[0] },
      });
    } else if (!user.oauthProvider) {
      // Existing email/password user - link their Google account
      await prisma.user.update({
        where: { id: user.id },
        data: { oauthProvider: 'google', oauthId: googleId, isVerified: true },
      });
    }

    // Step 4: Issue JWT and redirect to frontend
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&role=${user.role}`);

  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }
};

// ─── GITHUB OAUTH ─────────────────────────────────────────────────────────────

export const githubRedirect = (req: Request, res: Response) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
  const redirectUri = `${process.env.API_URL || 'http://localhost:4000'}/api/auth/github/callback`;

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};

export const githubCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;

  try {
    // Step 1: Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json() as any;
    if (!tokenData.access_token) {
      return res.redirect(`${FRONTEND_URL}/login?error=github_failed`);
    }

    // Step 2: Get user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    const githubUser = await userRes.json() as any;

    // Step 3: Get user emails (GitHub may not expose primary email in /user)
    let email = githubUser.email;
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      const emails = await emailsRes.json() as any[];
      const primary = emails.find((e: any) => e.primary && e.verified);
      email = primary?.email;
    }

    if (!email) return res.redirect(`${FRONTEND_URL}/login?error=no_email`);

    // Step 4: Find or create user in DB
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role: 'STUDENT',
          oauthProvider: 'github',
          oauthId: String(githubUser.id),
          isVerified: true,
        },
      });
      // Create default student profile with GitHub name
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          fullName: githubUser.name || githubUser.login || email.split('@')[0],
          githubUrl: githubUser.html_url || undefined,
          avatarUrl: githubUser.avatar_url || undefined,
        },
      });
    } else if (!user.oauthProvider) {
      // Link GitHub to existing account
      await prisma.user.update({
        where: { id: user.id },
        data: { oauthProvider: 'github', oauthId: String(githubUser.id), isVerified: true },
      });
    }

    // Step 5: Issue JWT and redirect to frontend
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&role=${user.role}`);

  } catch (err) {
    console.error('GitHub OAuth error:', err);
    res.redirect(`${FRONTEND_URL}/login?error=github_failed`);
  }
};
