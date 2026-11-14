# 🚀 TrueHire — Next-Gen AI-Powered Hiring & Upskilling Platform

TrueHire is a full-stack, enterprise-grade recruitment and placement automation platform designed to bridge the gap between students, colleges, and top tech companies.

Featuring **AI-driven Hire-Ready Scoring**, **Automated Mock Video/Speech Interviews (powered by Gemini AI)**, and a **real-time ATS (Applicant Tracking System) Kanban board**, TrueHire revolutionizes campus and off-campus placements.

---

## 🌟 Key Features

### 🎓 For Students
- **Smart Student Dashboard**: Real-time Hire-Ready Score (0–100) tracker calculated across skills, resume completeness, and assessments.
- **AI-Powered Mock Interview**: Speech-to-text interactive interview simulator powered by **Google Gemini 2.5 Flash** providing structured feedback, confidence scores, and improvement areas.
- **Course Upskilling & Certifications**: Curated video courses with real-time enrollment and progress tracking.
- **1-Click Job Applications**: Automated candidate-job match scoring based on semantic skill alignment.

### 🏢 For Employers & Companies
- **Verification Workflow**: MCA/GST verification mechanism to ensure only legitimate employers post jobs.
- **Interactive ATS Kanban**: Drag-and-drop recruitment pipeline (`Applied` ➔ `Viewed` ➔ `Shortlisted` ➔ `Interview` ➔ `Offered`).
- **Comprehensive Candidate Profiles**: View applicant skills, GitHub/LinkedIn portfolios, and Hire-Ready scores.

### 🏛️ For Colleges & Universities
- **Placement Analytics Dashboard**: Real-time metrics on placement percentages, high-demand industry skills, and placed students.
- **Cohort Management**: Track student readiness and connect campus talent directly to verified recruiters.

### 🛡️ For Administrators
- **Admin Verification Portal**: Review and approve/reject company registrations with GST and CIN validation.
- **Platform Health Monitoring**: Real-time overview of users, job postings, and hiring volumes.

---

## 🏗️ Architecture & Tech Stack

```
TrueHire Ecosystem
├── 🌐 Web Frontend (Next.js 16, React, Tailwind CSS, Framer Motion) -> Port 3000
├── ⚙️ Backend REST API (Node.js, Express, TypeScript, Prisma ORM)    -> Port 4000
├── 🧠 AI Microservice (Python, FastAPI, Gemini 2.5 Flash)          -> Port 5000
└── 🗄️ Database (PostgreSQL / Supabase + In-Memory Fallback Engine)
```

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Radix UI |
| **Backend API** | Node.js, Express, TypeScript, Prisma ORM, JWT, Bcrypt, Helmet, Express Rate Limit |
| **AI Service** | Python 3.11, FastAPI, Uvicorn, Google Generative AI (Gemini 2.5 Flash), PyPDF2, Pure-Python TF-IDF |
| **Database** | PostgreSQL (Supabase) + Resilient In-Memory State Cache |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://python.org/) (v3.10 or higher)
- [Git](https://git-scm.com/)

### One-Click Launch (Windows)
Double-click the included batch launcher:
```cmd
START_ALL.bat
```
This automatically boots all three microservices in separate dedicated terminal windows.

---

### Manual Setup

#### 1. AI Microservice (Port 5000)
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 5000
```

#### 2. Backend API (Port 4000)
```bash
cd api
npm install
npm run dev
```

#### 3. Frontend Web Application (Port 3000)
```bash
cd web
npm install
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🔑 Demo Credentials (Ready-to-Use)

| Role | Email | Password |
|---|---|---|
| **Student** | `student@truehire.in` | `Password123!` |
| **Company** | `company@truehire.in` | `Password123!` |
| **College** | `college@truehire.in` | `Password123!` |
| **Admin** | `admin@truehire.in` | `Password123!` |

*(You can also register any new account with your own custom email and password)*

---

## 📄 License
This project is licensed under the MIT License.
