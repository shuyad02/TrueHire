"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, BookOpen, Award, TrendingUp, Clock, ChevronRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/store/authStore";
import { useAuthStore } from "@/store/authStore";

interface DashboardStats {
  applications: number;
  enrollments: number;
  completedCourses: number;
  certifications: number;
  hireReadyScore: number;
}

interface Profile {
  fullName: string;
  college: string;
  skills: string[];
  isHireReady: boolean;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/student/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setProfile(data.profile);
        }
      } catch {
        // Fallback to mock data if API is not running
        setStats({ applications: 0, enrollments: 0, completedCourses: 0, certifications: 0, hireReadyScore: 15 });
        setProfile({ fullName: user?.email?.split("@")[0] || "Student", college: "Not set", skills: [], isHireReady: false });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const statCards = [
    { label: "Applications Sent", value: stats?.applications ?? 0, icon: Briefcase, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Courses In Progress", value: stats?.enrollments ?? 0, icon: BookOpen, color: "text-pink-400", bg: "bg-pink-500/10" },
    { label: "Courses Completed", value: stats?.completedCourses ?? 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Certifications", value: stats?.certifications ?? 0, icon: Award, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  const score = stats?.hireReadyScore ?? 0;
  const scoreColor = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400";
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 px-6 pb-16">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="gradient-text">{loading ? "..." : profile?.fullName?.split(" ")[0] ?? "Student"}</span> 👋
            </h1>
            <p className="text-slate-400 mt-1">{profile?.college || "Complete your profile to get started"}</p>
          </div>
          {profile?.isHireReady && (
            <div className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 text-sm font-bold">
              ✅ Hire Ready
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">

          {/* Hire-Ready Score */}
          <div className="glass-card flex flex-col items-center justify-center col-span-1">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Hire-Ready Score</p>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={loading ? circumference : dashOffset}
                  style={{ transition: "stroke-dashoffset 1.5s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-3xl font-black ${scoreColor}`}>{loading ? "..." : score}</span>
                <span className="text-xs text-slate-500">/100</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              {score < 40 ? "Add skills & resume to improve" : score < 70 ? "Almost there! Keep going" : "You're hire-ready! 🎉"}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="col-span-1 lg:col-span-3 grid grid-cols-2 gap-4">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                  <card.icon size={24} className={card.color} />
                </div>
                <div>
                  <div className="text-3xl font-black text-white">{loading ? "..." : card.value}</div>
                  <div className="text-xs text-slate-400 font-medium">{card.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { href: "/jobs", label: "Find Jobs", desc: "Browse verified openings", icon: Briefcase, color: "from-indigo-500 to-indigo-700" },
            { href: "/courses", label: "Start Learning", desc: "Upskill with top courses", icon: BookOpen, color: "from-pink-500 to-pink-700" },
            { href: "/interviews", label: "Practice Interview", desc: "AI-powered mock rounds", icon: TrendingUp, color: "from-emerald-500 to-emerald-700" },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <motion.div whileHover={{ y: -3, scale: 1.02 }} className="glass-card cursor-pointer group flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0`}>
                  <action.icon size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{action.label}</div>
                  <div className="text-xs text-slate-400">{action.desc}</div>
                </div>
                <ChevronRight size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Skills section */}
        {profile && profile.skills.length > 0 && (
          <div className="glass-card">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Award size={18} className="text-indigo-400" /> Your Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="badge badge-primary">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Empty state if no skills */}
        {profile && profile.skills.length === 0 && (
          <div className="glass-card text-center py-10">
            <Award size={40} className="text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-2">Add your skills to boost your profile</h3>
            <p className="text-slate-400 text-sm mb-4">Skills help companies find you and increase your Hire-Ready Score</p>
            <Link href="/student/profile/edit" className="btn btn-primary">Complete Profile</Link>
          </div>
        )}
      </div>
    </div>
  );
}
