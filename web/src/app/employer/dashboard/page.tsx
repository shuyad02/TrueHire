"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { User, Mail, Plus, ExternalLink, Calendar, MapPin, Briefcase, IndianRupee, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch, useAuthStore } from "@/store/authStore";
import Link from "next/link";

type Status = "APPLIED" | "VIEWED" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "REJECTED";

interface Candidate {
  id: string;
  student: { fullName: string; college: string; skills: string[]; hireReadyScore: number; avatarUrl: string | null; resumeUrl: string | null };
  job: { title: string };
  status: Status;
  appliedAt: string;
}

const COLUMNS: { id: Status; title: string; color: string }[] = [
  { id: "APPLIED", title: "New Applied", color: "border-slate-700" },
  { id: "VIEWED", title: "Viewed", color: "border-blue-500/50" },
  { id: "SHORTLISTED", title: "Shortlisted", color: "border-indigo-500/50" },
  { id: "INTERVIEW", title: "Interview", color: "border-purple-500/50" },
  { id: "OFFERED", title: "Offered", color: "border-emerald-500/50" },
];

export default function CompanyDashboard() {
  const { user } = useAuthStore();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<string>('PENDING');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          apiFetch("/api/jobs/company/applications"),
          apiFetch("/api/jobs/company/jobs")
        ]);

        if (appsRes.ok) setCandidates(await appsRes.json());
        if (jobsRes.ok) {
          const jobs = await jobsRes.json();
          setActiveJobsCount(jobs.length);
        }

        // Fetch company verification status
        const profileRes = await apiFetch("/api/companies/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setVerificationStatus(profileData.verificationStatus || 'PENDING');
        }
      } catch {
        console.log("Using mock data due to API error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as Status;
    const item = candidates.find((c) => c.id === draggableId);
    if (!item) return;

    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) => (c.id === draggableId ? { ...c, status: newStatus } : c))
    );

    // Backend update
    try {
      await apiFetch(`/api/jobs/company/applications/${draggableId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Revert on failure
      setCandidates((prev) =>
        prev.map((c) => (c.id === draggableId ? { ...c, status: source.droppableId as Status } : c))
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Employer Dashboard</h1>
            <p className="text-slate-400">Manage candidates and track hiring pipeline</p>
          </div>
          <div className="flex gap-4">
            {verificationStatus === 'VERIFIED' ? (
              <Link href="/employer/jobs/new" className="btn btn-primary">
                <Plus size={18} /> Post New Job
              </Link>
            ) : (
              <button disabled className="btn btn-primary opacity-40 cursor-not-allowed">
                <Plus size={18} /> Post New Job
              </button>
            )}
          </div>
        </div>

        {/* Verification Status Banner */}
        {verificationStatus === 'PENDING' && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-xl flex items-center gap-3">
            <ShieldAlert size={22} className="shrink-0 text-yellow-400" />
            <div>
              <p className="font-semibold">Account Pending Verification</p>
              <p className="text-sm text-yellow-400/80 mt-0.5">Your company is under review by our Admin team. You can explore the platform, but you cannot post jobs until you are verified. This usually takes 1-2 business days.</p>
            </div>
          </div>
        )}
        {verificationStatus === 'REJECTED' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-3">
            <ShieldAlert size={22} className="shrink-0 text-red-400" />
            <div>
              <p className="font-semibold">Verification Rejected</p>
              <p className="text-sm text-red-400/80 mt-0.5">Your company verification was not approved. Please contact support at <span className="underline">support@truehire.com</span> to re-apply.</p>
            </div>
          </div>
        )}
        {verificationStatus === 'VERIFIED' && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center gap-3">
            <ShieldCheck size={22} className="shrink-0 text-emerald-400" />
            <p className="font-semibold">Verified Company ✓ — You can post jobs and access all hiring features.</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Jobs", value: activeJobsCount.toString(), color: "text-indigo-400" },
            { label: "Total Applications", value: candidates.length.toString(), color: "text-pink-400" },
            { label: "Interviews Scheduled", value: candidates.filter(c => c.status === "INTERVIEW").length.toString(), color: "text-emerald-400" },
            { label: "Offers Extended", value: candidates.filter(c => c.status === "OFFERED").length.toString(), color: "text-amber-400" },
          ].map((stat, i) => (
            <div key={i} className="glass-card">
              <div className="text-3xl font-black text-white">{stat.value}</div>
              <div className={`text-sm font-medium ${stat.color} mt-1`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={40} className="animate-spin text-indigo-400" />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
              {COLUMNS.map((column) => (
                <div key={column.id} className="min-w-[320px] w-[320px] snap-center">
                  <div className={`glass-card bg-slate-900/50 p-4 rounded-xl border-t-4 ${column.color}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-200">{column.title}</h3>
                      <span className="bg-slate-800 text-slate-400 text-xs py-1 px-2 rounded-full font-bold">
                        {candidates.filter((c) => c.status === column.id).length}
                      </span>
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`min-h-[200px] transition-colors rounded-lg ${
                            snapshot.isDraggingOver ? "bg-slate-800/50" : ""
                          }`}
                        >
                          {candidates
                            .filter((c) => c.status === column.id)
                            .map((candidate, index) => (
                              <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`bg-slate-800 p-4 rounded-xl mb-3 shadow-lg border transition-all ${
                                      snapshot.isDragging ? "border-indigo-500 scale-105 z-50" : "border-slate-700 hover:border-slate-600"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold shrink-0">
                                          {candidate.student.fullName.charAt(0)}
                                        </div>
                                        <div>
                                          <div className="font-bold text-white text-sm">{candidate.student.fullName}</div>
                                          <div className="text-xs text-slate-400">{candidate.student.college}</div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mb-3">
                                      <div className="text-xs font-semibold text-indigo-400 mb-1">Applied for:</div>
                                      <div className="text-sm text-slate-300">{candidate.job.title}</div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {candidate.student.skills.slice(0, 3).map((skill) => (
                                        <span key={skill} className="bg-slate-900 text-slate-300 text-[10px] px-2 py-1 rounded-md border border-slate-700">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold" title="Hire-Ready Score">
                                          {candidate.student.hireReadyScore}
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        {candidate.student.resumeUrl && (
                                          <a href={candidate.student.resumeUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors p-1" title="Resume">
                                            <ExternalLink size={16} />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
