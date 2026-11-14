"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Users, Briefcase, TrendingUp, Award,
  CheckCircle2, Clock, BarChart3, BookOpen, ArrowRight, Loader2
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/store/authStore";

interface DashboardData {
  college: { collegeName: string; logoUrl?: string; city?: string; state?: string };
  stats: {
    totalStudents: number;
    placedStudents: number;
    inProcess: number;
    activeJobs: number;
    totalApplications: number;
    hireReadyCount: number;
    studentsWithCourses: number;
    placementRate: number;
  };
  topSkills: { skill: string; count: number }[];
  recentApplications: {
    id: string;
    status: string;
    appliedAt: string;
    student: { fullName: string; college?: string };
    job: { title: string; company: { companyName: string } };
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-500/20 text-blue-400",
  SHORTLISTED: "bg-amber-500/20 text-amber-400",
  INTERVIEW: "bg-indigo-500/20 text-indigo-400",
  OFFERED: "bg-emerald-500/20 text-emerald-400",
  REJECTED: "bg-red-500/20 text-red-400",
  VIEWED: "bg-slate-500/20 text-slate-400",
};

export default function CollegeDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/college/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        console.error("Failed to load college dashboard");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = data?.stats || { totalStudents: 0, placedStudents: 0, inProcess: 0, activeJobs: 0, totalApplications: 0, hireReadyCount: 0, studentsWithCourses: 0, placementRate: 0 };
  const topSkills = data?.topSkills || [];
  const recentApplications = data?.recentApplications || [];
  const college = data?.college || { collegeName: "College Profile", city: "", state: "" };
  
  const maxSkillCount = topSkills[0]?.count || 1;

  const statCards = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { label: "Students Placed", value: stats.placedStudents, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "In Interview Process", value: stats.inProcess, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Active Job Listings", value: stats.activeJobs, icon: Briefcase, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    { label: "Total Applications", value: stats.totalApplications, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Hire-Ready Students", value: stats.hireReadyCount, icon: Award, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Enrolled in Courses", value: stats.studentsWithCourses, icon: BookOpen, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
    { label: "Placement Rate", value: `${stats.placementRate}%`, icon: BarChart3, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 px-4 pb-20">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <GraduationCap size={22} className="text-indigo-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {loading ? "Loading..." : college.collegeName}
              </h1>
            </div>
            <p className="text-slate-400 ml-13">
              {college.city && `${college.city}, ${college.state} · `}
              <span className="text-indigo-400 font-medium">Placement Analytics Dashboard</span>
            </p>
          </div>
          <Link href="/jobs" className="btn btn-primary hidden md:flex">
            Browse Jobs <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={40} className="text-indigo-400 animate-spin" />
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center py-32 text-slate-400">
            Failed to load dashboard data. Please try again.
          </div>
        ) : (
          <>
            {/* Placement Rate Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card mb-6 flex flex-col md:flex-row items-center gap-6 border-indigo-500/30"
            >
              <div className="relative w-36 h-36 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke="#6366f1" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 - (stats.placementRate / 100) * 2 * Math.PI * 54}
                    style={{ transition: "stroke-dashoffset 1.5s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-indigo-400">{stats.placementRate}%</span>
                  <span className="text-xs text-slate-500">Placed</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Overall Placement Rate</h2>
                <p className="text-slate-400 text-sm max-w-lg">
                  <span className="text-emerald-400 font-bold">{stats.placedStudents}</span> students have received job offers out of{" "}
                  <span className="text-white font-bold">{stats.totalStudents}</span> total registered students.{" "}
                  <span className="text-amber-400 font-bold">{stats.inProcess}</span> more are currently in active interview processes.
                </p>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card border ${card.border} flex items-center gap-4`}
                >
                  <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                    <card.icon size={22} className={card.color} />
                  </div>
                  <div>
                    <div className={`text-2xl font-black ${card.color}`}>{card.value}</div>
                    <div className="text-xs text-slate-500 font-medium leading-tight">{card.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Top Skills In Demand */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card">
                <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                  <BarChart3 size={20} className="text-pink-400" />
                  Top Skills In Demand
                </h3>
                <div className="space-y-4">
                  {topSkills.map((item, i) => (
                    <div key={item.skill}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300 font-medium">{item.skill}</span>
                        <span className="text-slate-500">{item.count} jobs</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / maxSkillCount) * 100}%` }}
                          transition={{ delay: 0.4 + i * 0.07, duration: 0.6 }}
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Applications */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card">
                <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-indigo-400" />
                  Recent Student Applications
                </h3>
                <div className="space-y-3">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-200 text-sm truncate">{app.student.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {app.job.title} · <span className="text-indigo-400">{app.job.company.companyName}</span>
                        </p>
                      </div>
                      <span className={`ml-3 shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${STATUS_COLORS[app.status] || "bg-slate-700 text-slate-300"}`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
