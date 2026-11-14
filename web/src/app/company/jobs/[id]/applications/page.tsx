"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, GraduationCap, Award, ExternalLink,
  FileText, CheckCircle, XCircle, ChevronRight, Clock,
  Eye, Star, Phone
} from "lucide-react";
import { apiFetch } from "@/store/authStore";

const COLUMNS = [
  { key: "APPLIED",     label: "Applied",      color: "border-blue-500",   bg: "bg-blue-500/10",   dot: "bg-blue-500" },
  { key: "VIEWED",      label: "Viewed",       color: "border-purple-500", bg: "bg-purple-500/10", dot: "bg-purple-500" },
  { key: "SHORTLISTED", label: "Shortlisted",  color: "border-amber-500",  bg: "bg-amber-500/10",  dot: "bg-amber-500" },
  { key: "INTERVIEW",   label: "Interviewing", color: "border-cyan-500",   bg: "bg-cyan-500/10",   dot: "bg-cyan-500" },
  { key: "OFFERED",     label: "Offered",      color: "border-green-500",  bg: "bg-green-500/10",  dot: "bg-green-500" },
  { key: "REJECTED",    label: "Rejected",     color: "border-red-500",    bg: "bg-red-500/10",    dot: "bg-red-500" },
];

const ACTIONS: Record<string, { next: string; label: string; cls: string }[]> = {
  APPLIED:     [{ next: "SHORTLISTED", label: "✓ Shortlist", cls: "btn-success" }, { next: "REJECTED", label: "✗ Reject", cls: "btn-danger" }],
  VIEWED:      [{ next: "SHORTLISTED", label: "✓ Shortlist", cls: "btn-success" }, { next: "REJECTED", label: "✗ Reject", cls: "btn-danger" }],
  SHORTLISTED: [{ next: "INTERVIEW",   label: "📅 Schedule Interview", cls: "btn-primary" }, { next: "REJECTED", label: "✗ Reject", cls: "btn-danger" }],
  INTERVIEW:   [{ next: "OFFERED",     label: "🎉 Make Offer", cls: "btn-success" }, { next: "REJECTED", label: "✗ Reject", cls: "btn-danger" }],
  OFFERED:     [],
  REJECTED:    [{ next: "SHORTLISTED", label: "↩ Reconsider", cls: "btn-primary" }],
};

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch(`/api/jobs/${jobId}/applications`);
        if (res.ok) {
          const data = await res.json();
          setJob(data.job);
          setApplications(data.applications);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  // Auto-mark as VIEWED when HR opens card
  const openCard = async (app: any) => {
    setSelected(app);
    if (app.status === "APPLIED") {
      await updateStatus(app.id, "VIEWED");
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    setUpdating(appId);
    try {
      const res = await apiFetch(`/api/jobs/company/applications/${appId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications(prev =>
          prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
        );
        if (selected?.id === appId) {
          setSelected((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch {} finally {
      setUpdating(null);
    }
  };

  const getColApps = (colKey: string) =>
    applications.filter(a => a.status === colKey);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 pb-10 px-4">
      {/* Header */}
      <div className="container mx-auto max-w-[1600px] mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{job?.title}</h1>
            <p className="text-slate-400 mt-1">{applications.length} total applications · ATS Board</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {COLUMNS.map(col => (
              <div key={col.key} className="flex items-center gap-1.5 text-sm text-slate-400">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                {col.label}: <span className="text-white font-bold">{getColApps(col.key).length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="container mx-auto max-w-[1600px]">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <div key={col.key} className={`min-w-[260px] flex-1 rounded-xl border ${col.color} ${col.bg} p-3 flex flex-col`}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <span className="font-semibold text-sm text-white">{col.label}</span>
                <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {getColApps(col.key).length}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {getColApps(col.key).map(app => (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-3 cursor-pointer hover:border-slate-500 transition-all group"
                    onClick={() => openCard(app)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {app.student?.fullName?.[0] ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-white truncate">{app.student?.fullName}</div>
                        <div className="text-xs text-slate-500 truncate">{app.student?.college}</div>
                      </div>
                    </div>

                    {/* Score badge */}
                    {app.hireReadyScore !== undefined && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">Match</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          (app.matchScore ?? 0) >= 70 ? "bg-green-500/20 text-green-400" :
                          (app.matchScore ?? 0) >= 50 ? "bg-amber-500/20 text-amber-400" :
                                                        "bg-red-500/20 text-red-400"
                        }`}>
                          {app.matchScore ?? 0}%
                        </span>
                      </div>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(app.student?.skills ?? []).slice(0, 3).map((s: string) => (
                        <span key={s} className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                      {(app.student?.skills ?? []).length > 3 && (
                        <span className="text-xs text-slate-500">+{app.student.skills.length - 3}</span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 mt-2 group-hover:text-slate-400 flex items-center gap-1">
                      View Profile <ChevronRight size={10} />
                    </div>
                  </motion.div>
                ))}

                {getColApps(col.key).length === 0 && (
                  <div className="text-center py-8 text-slate-600 text-xs">No candidates</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Detail Sidebar */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Close */}
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                  <XCircle size={22} />
                </button>

                {/* Candidate header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                    {selected.student?.fullName?.[0] ?? "?"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selected.student?.fullName}</h2>
                    <p className="text-slate-400 text-sm flex items-center gap-1">
                      <GraduationCap size={13} /> {selected.student?.degree ?? "—"} · {selected.student?.college ?? "—"}
                    </p>
                  </div>
                </div>

                {/* Current status */}
                <div className={`mb-6 px-4 py-3 rounded-xl ${
                  selected.status === "OFFERED"  ? "bg-green-500/20 border border-green-500/30" :
                  selected.status === "REJECTED" ? "bg-red-500/20 border border-red-500/30" :
                                                   "bg-slate-800 border border-slate-700"
                }`}>
                  <div className="text-xs text-slate-400 mb-1">Current Status</div>
                  <div className="font-bold text-white">{selected.status}</div>
                </div>

                {/* Quick links */}
                <div className="flex gap-3 mb-6 flex-wrap">
                  {selected.student?.resumeUrl && (
                    <a href={selected.student.resumeUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg transition-colors">
                      <FileText size={14} /> Resume
                    </a>
                  )}
                  {selected.student?.linkedinUrl && (
                    <a href={selected.student.linkedinUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm bg-blue-800/40 hover:bg-blue-700/40 text-blue-300 px-3 py-2 rounded-lg transition-colors">
                      <ExternalLink size={14} /> LinkedIn
                    </a>
                  )}
                  {selected.student?.githubUrl && (
                    <a href={selected.student.githubUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg transition-colors">
                      <ExternalLink size={14} /> GitHub
                    </a>
                  )}
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-slate-300 mb-2">Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {(selected.student?.skills ?? []).map((s: string) => (
                      <span key={s} className="text-xs bg-pink-500/20 text-pink-300 px-2.5 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                    {!selected.student?.skills?.length && (
                      <span className="text-xs text-slate-500">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* Hire Ready Score */}
                <div className="mb-6 p-4 bg-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-300">Hire-Ready Score</span>
                    <span className="text-lg font-bold text-pink-400">{selected.student?.hireReadyScore ?? 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${selected.student?.hireReadyScore ?? 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Profile match: <span className="text-white font-medium">{selected.matchScore ?? 0}%</span></p>
                </div>

                {/* Cover Letter */}
                {selected.coverLetter && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-slate-300 mb-2">Cover Letter</div>
                    <p className="text-sm text-slate-400 bg-slate-800 p-4 rounded-xl leading-relaxed">
                      {selected.coverLetter}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                {ACTIONS[selected.status]?.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-slate-300 mb-2">Actions</div>
                    {ACTIONS[selected.status].map(action => (
                      <button
                        key={action.next}
                        disabled={!!updating}
                        onClick={() => updateStatus(selected.id, action.next)}
                        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${
                          action.cls === "btn-success" ? "bg-green-500 hover:bg-green-400 text-white" :
                          action.cls === "btn-danger"  ? "bg-red-500/80 hover:bg-red-500 text-white" :
                                                         "bg-pink-500 hover:bg-pink-400 text-white"
                        }`}
                      >
                        {updating === selected.id ? "Updating…" : action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
