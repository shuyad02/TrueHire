"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, MapPin, Briefcase, Clock, Filter, IndianRupee, CheckCircle2, Loader2 } from "lucide-react";
import { apiFetch } from "@/store/authStore";

interface Job {
  id: string;
  title: string;
  location: string;
  jobType: string;
  salaryMin: number;
  salaryMax: number;
  skillsRequired: string[];
  isRemote: boolean;
  createdAt: string;
  company: {
    companyName: string;
    logoUrl: string | null;
    verificationStatus: string;
  };
}

const formatSalary = (min: number, max: number) => {
  const fmt = (n: number) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : `${(n/1000).toFixed(0)}K`;
  return `₹${fmt(min)} - ₹${fmt(max)}`;
};

const JOB_TYPES = ["All", "FULL_TIME", "INTERNSHIP", "REMOTE", "PART_TIME", "CONTRACT"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [total, setTotal] = useState(0);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedType !== "All") params.set("jobType", selectedType);
      params.set("limit", "12");

      const res = await apiFetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
        setTotal(data.total);
      }
    } catch {
      // Fallback mock data if API offline
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [selectedType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your <span className="gradient-text">Dream Job</span>
          </h1>
          <p className="text-slate-400 text-lg">Only <span className="text-emerald-400 font-bold">verified companies</span> — no fake jobs, ever.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs, skills, companies..."
              className="input pl-10 w-full"
            />
          </div>
          <button type="submit" className="btn btn-primary px-6">Search</button>
        </form>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {JOB_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedType === type
                  ? "bg-indigo-500 border-indigo-500 text-white"
                  : "border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-white"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-500 self-center">{total} jobs found</span>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={40} className="animate-spin text-indigo-400" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-card text-center py-20">
            <Briefcase size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
            <p className="text-slate-400">Try a different search or filter. More jobs are added daily!</p>
            <p className="text-slate-500 text-sm mt-4">Start the backend API to see live jobs: <code className="text-indigo-400">cd api && npm run dev</code></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/jobs/${job.id}`}>
                  <div className="glass-card group hover:border-indigo-500/50 transition-all cursor-pointer h-full">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-indigo-400 text-lg shrink-0">
                          {job.company.companyName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                            {job.company.companyName}
                            {job.company.verificationStatus === "VERIFIED" && (
                              <CheckCircle2 size={14} className="text-emerald-400" />
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={11} /> {job.location}{job.isRemote && " • Remote"}
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-secondary text-xs">{job.jobType.replace("_", " ")}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{job.title}</h3>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.skillsRequired.slice(0, 4).map(skill => (
                        <span key={skill} className="badge badge-primary text-xs">{skill}</span>
                      ))}
                      {job.skillsRequired.length > 4 && (
                        <span className="text-xs text-slate-500">+{job.skillsRequired.length - 4} more</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-700/50">
                      <span className="flex items-center gap-1 font-bold text-emerald-400">
                        <IndianRupee size={14} />{formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock size={13} /> {new Date(job.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
