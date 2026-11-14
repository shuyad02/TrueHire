"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Briefcase, Building2, MapPin, Calendar, CheckCircle2,
  Eye, Star, Phone, XCircle, Award, Clock, ExternalLink, ChevronRight
} from "lucide-react";
import { apiFetch } from "@/store/authStore";

const STATUS_STEPS = ["APPLIED", "VIEWED", "SHORTLISTED", "INTERVIEW", "OFFERED"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  APPLIED:     { label: "Applied",      color: "text-blue-400",   bg: "bg-blue-500",   icon: Clock },
  VIEWED:      { label: "Viewed",       color: "text-purple-400", bg: "bg-purple-500", icon: Eye },
  SHORTLISTED: { label: "Shortlisted",  color: "text-amber-400",  bg: "bg-amber-500",  icon: Star },
  INTERVIEW:   { label: "Interviewing", color: "text-cyan-400",   bg: "bg-cyan-500",   icon: Phone },
  OFFERED:     { label: "Offered 🎉",   color: "text-green-400",  bg: "bg-green-500",  icon: Award },
  REJECTED:    { label: "Not Selected", color: "text-red-400",    bg: "bg-red-500",    icon: XCircle },
  WITHDRAWN:   { label: "Withdrawn",    color: "text-slate-400",  bg: "bg-slate-500",  icon: XCircle },
};

function StatusProgressBar({ status }: { status: string }) {
  if (status === "REJECTED" || status === "WITHDRAWN") {
    return (
      <div className="flex items-center gap-2 mt-3">
        <XCircle size={16} className="text-red-400 shrink-0" />
        <span className="text-sm text-red-400 font-medium">
          {status === "REJECTED" ? "Application not selected" : "You withdrew this application"}
        </span>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(status);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-0">
        {STATUS_STEPS.map((step, i) => {
          const isCompleted = i < currentStep;
          const isActive    = i === currentStep;
          const cfg = STATUS_CONFIG[step];
          const Icon = cfg.icon;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                  ${isCompleted ? `${cfg.bg} border-transparent` :
                    isActive    ? `border-current ${cfg.color} bg-slate-900` :
                                  "border-slate-700 bg-slate-900"}
                `}>
                  {isCompleted ? (
                    <CheckCircle2 size={14} className="text-white" />
                  ) : (
                    <Icon size={12} className={isActive ? cfg.color : "text-slate-600"} />
                  )}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap font-medium ${
                  isCompleted || isActive ? cfg.color : "text-slate-600"
                }`}>{cfg.label}</span>
              </div>
              {/* Connector line */}
              {i < STATUS_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mb-4 mx-1 ${isCompleted ? cfg.bg : "bg-slate-700"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/student/applications");
        const data = res.ok ? await res.json() : [];
        setApplications(data);
      } catch { } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filters = ["ALL", "APPLIED", "VIEWED", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED"];
  const filtered = filter === "ALL"
    ? applications
    : applications.filter((a) => a.status === filter);

  const stats = {
    total:       applications.length,
    active:      applications.filter(a => !["REJECTED","WITHDRAWN"].includes(a.status)).length,
    shortlisted: applications.filter(a => a.status === "SHORTLISTED").length,
    offered:     applications.filter(a => a.status === "OFFERED").length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            My <span className="text-pink-400">Applications</span>
          </h1>
          <p className="text-slate-400">Track your job applications in real-time — just like LinkedIn.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Applied",  value: stats.total,       color: "text-blue-400",  bg: "from-blue-600/20 to-blue-800/10" },
            { label: "In Progress",    value: stats.active,      color: "text-amber-400", bg: "from-amber-600/20 to-amber-800/10" },
            { label: "Shortlisted",    value: stats.shortlisted, color: "text-cyan-400",  bg: "from-cyan-600/20 to-cyan-800/10" },
            { label: "Offers",         value: stats.offered,     color: "text-green-400", bg: "from-green-600/20 to-green-800/10" },
          ].map((s) => (
            <div key={s.label} className={`glass-card p-5 bg-gradient-to-br ${s.bg}`}>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? "bg-pink-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {f === "ALL" ? "All" : STATUS_CONFIG[f]?.label ?? f}
              {f !== "ALL" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({applications.filter(a => a.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Application cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No applications found.</p>
            <Link href="/jobs" className="mt-4 inline-block text-pink-400 hover:underline">
              Browse Jobs →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((app, i) => {
              const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG["APPLIED"];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left: Job info */}
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-xl font-bold text-pink-400">
                        {app.job?.company?.companyName?.[0] ?? "?"}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white">{app.job?.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-sm text-slate-400">
                            <Building2 size={13}/> {app.job?.company?.companyName}
                          </span>
                          {app.job?.location && (
                            <span className="flex items-center gap-1 text-sm text-slate-400">
                              <MapPin size={13}/> {app.job?.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-sm text-slate-500">
                            <Calendar size={13}/> Applied {new Date(app.appliedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                          </span>
                        </div>
                        {app.matchScore && (
                          <span className="mt-2 inline-block text-xs font-medium bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full">
                            {app.matchScore}% Profile Match
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Status badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shrink-0
                      ${app.status === "OFFERED" ? "bg-green-500/20 text-green-300" :
                        app.status === "REJECTED" ? "bg-red-500/20 text-red-300" :
                        "bg-slate-800 " + cfg.color}`}
                    >
                      <Icon size={14} />
                      {cfg.label}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <StatusProgressBar status={app.status} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
