"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, IndianRupee, Clock, Briefcase, CheckCircle2, Share2, BookmarkPlus, Zap, Loader2 } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { apiFetch, useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  location: string;
  isRemote: boolean;
  skillsRequired: string[];
  applicationsCount: number;
  createdAt: string;
  company: {
    companyName: string;
    logoUrl: string | null;
    verificationStatus: string;
    industry: string | null;
    companySize: string | null;
    description: string | null;
  };
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;

  const { user } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await apiFetch(`/api/jobs/${jobId}`);
        if (!res.ok) throw new Error("Job not found");
        const data = await res.json();
        setJob(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please login as a student to apply.");
      return;
    }
    if (user.role !== "STUDENT") {
      toast.error("Only students can apply for jobs.");
      return;
    }

    setApplying(true);
    try {
      const res = await apiFetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        body: JSON.stringify({ coverLetter: "I am very interested in this role." })
      });
      if (res.ok) {
        setApplySuccess(true);
        toast.success("Applied successfully!");
      } else {
        const errData = await res.json();
        toast.error(`Failed to apply: ${errData.error}`);
      }
    } catch (err) {
      toast.error("Something went wrong while applying.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">Job not found</h1>
        <Link href="/jobs" className="btn btn-primary">Back to Jobs</Link>
      </div>
    );
  }

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : `${(n/1000).toFixed(0)}K`;
    return `₹${fmt(min)} - ₹${fmt(max)}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-slate-950">
      <div className="container mx-auto max-w-5xl">
        
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to jobs
        </Link>

        {/* Hero Section */}
        <div className="glass-card relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-[80px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0 shadow-xl overflow-hidden font-bold text-indigo-400 text-3xl">
                {job.company.logoUrl ? (
                  <img src={job.company.logoUrl} alt={job.company.companyName} className="w-full h-full object-cover" />
                ) : (
                  job.company.companyName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{job.title}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-medium text-slate-300">{job.company.companyName}</span>
                  {job.company.verificationStatus === "VERIFIED" && <span className="verified-badge"><CheckCircle2 size={16} /> Verified</span>}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><MapPin size={16} /> {job.location} {job.isRemote && "(Remote)"}</span>
                  <span className="flex items-center gap-1.5"><IndianRupee size={16} /> {formatSalary(job.salaryMin, job.salaryMax)}</span>
                  <span className="flex items-center gap-1.5"><Briefcase size={16} /> {job.experienceLevel.replace(/_/g, " ")}</span>
                  <span className="flex items-center gap-1.5"><Clock size={16} /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              {applySuccess ? (
                <button className="btn bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 w-full py-3 text-base flex justify-center items-center gap-2 cursor-default">
                  <CheckCircle2 size={18} /> Applied Successfully
                </button>
              ) : (
                <button 
                  onClick={handleApply}
                  disabled={applying}
                  className="btn btn-primary w-full py-3 text-base shadow-lg shadow-indigo-500/25 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {applying ? "Applying..." : "Apply Now"} <Zap size={18} />
                </button>
              )}
              
              <div className="flex gap-2">
                <button className="btn btn-secondary flex-1 flex justify-center py-2"><BookmarkPlus size={18} /></button>
                <button className="btn btn-secondary flex-1 flex justify-center py-2"><Share2 size={18} /></button>
              </div>
              <p className="text-xs text-center text-slate-500 font-medium">{job.applicationsCount} applicants</p>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="card !p-0 overflow-hidden">
              <Tabs.Root defaultValue="about">
                <Tabs.List className="flex border-b border-slate-700 bg-slate-900/50 px-2 pt-2">
                  <Tabs.Trigger value="about" className="px-6 py-3 text-sm font-medium text-slate-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 transition-colors">
                    Job Description
                  </Tabs.Trigger>
                  <Tabs.Trigger value="company" className="px-6 py-3 text-sm font-medium text-slate-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 transition-colors">
                    About Company
                  </Tabs.Trigger>
                </Tabs.List>
                
                <Tabs.Content value="about" className="p-6 md:p-8 outline-none space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">About the Role</h3>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Requirements</h3>
                    <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {job.requirements}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Skills Required</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="company" className="p-6 md:p-8 outline-none">
                  <h3 className="text-lg font-bold text-white mb-3">About {job.company.companyName}</h3>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    {job.company.description || "No description provided."}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Industry</p>
                      <p className="text-sm text-slate-300 font-medium">{job.company.industry || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Company Size</p>
                      <p className="text-sm text-slate-300 font-medium">{job.company.companySize || "N/A"}</p>
                    </div>
                  </div>
                </Tabs.Content>
              </Tabs.Root>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="font-bold text-white mb-4">Missing Skills?</h3>
              <p className="text-sm text-slate-400 mb-4">Boost your chances of getting hired by upskilling.</p>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-slate-700 bg-slate-800/50 flex flex-col gap-2">
                  <p className="text-sm text-slate-300">Explore courses related to this job's required skills.</p>
                  <Link href="/courses" className="btn btn-secondary w-full justify-center py-2 text-sm">View Courses</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
