"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase, Users, Eye, Plus, ChevronRight, Building2,
  TrendingUp, CheckCircle, Clock, BarChart3
} from "lucide-react";
import { apiFetch } from "@/store/authStore";

export default function CompanyDashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/jobs/company/jobs");
        const data = res.ok ? await res.json() : [];
        setJobs(data);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalApplicants = jobs.reduce((s, j) => s + (j._count?.applications ?? 0), 0);
  const activeJobs = jobs.filter(j => j.status === "ACTIVE").length;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">
              Company <span className="text-pink-400">Dashboard</span>
            </h1>
            <p className="text-slate-400">Manage your job postings and review candidates.</p>
          </div>
          <Link href="/company/post-job"
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white px-5 py-3 rounded-xl font-semibold transition-all">
            <Plus size={18} /> Post New Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Jobs",      value: jobs.length,      icon: Briefcase,   color: "text-pink-400",   bg: "from-pink-600/20 to-pink-900/10" },
            { label: "Active Jobs",     value: activeJobs,       icon: CheckCircle, color: "text-green-400",  bg: "from-green-600/20 to-green-900/10" },
            { label: "Total Applicants",value: totalApplicants,  icon: Users,       color: "text-blue-400",   bg: "from-blue-600/20 to-blue-900/10" },
            { label: "Hiring Pipeline", value: activeJobs,       icon: TrendingUp,  color: "text-amber-400",  bg: "from-amber-600/20 to-amber-900/10" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`glass-card p-5 bg-gradient-to-br ${s.bg}`}>
              <s.icon size={20} className={`${s.color} mb-2`} />
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-slate-400 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Jobs list */}
        <h2 className="text-xl font-bold text-white mb-4">Your Job Postings</h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No jobs posted yet.</p>
            <Link href="/company/post-job" className="mt-4 inline-block text-pink-400 hover:underline">
              Post your first job →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="glass-card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-white text-lg truncate">{job.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      job.status === "ACTIVE" ? "bg-green-500/20 text-green-400" :
                      job.status === "PAUSED" ? "bg-amber-500/20 text-amber-400" :
                                                "bg-red-500/20 text-red-400"
                    }`}>{job.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1"><Users size={13}/> {job._count?.applications ?? 0} applicants</span>
                    <span className="flex items-center gap-1"><Eye size={13}/> {job.viewsCount ?? 0} views</span>
                    <span className="flex items-center gap-1"><Clock size={13}/> {new Date(job.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</span>
                  </div>
                </div>

                <Link href={`/company/jobs/${job.id}/applications`}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shrink-0">
                  <BarChart3 size={15} /> View ATS Board <ChevronRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
