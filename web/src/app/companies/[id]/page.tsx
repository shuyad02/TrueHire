"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Users, CheckCircle2, Star, Loader2, Building2, ExternalLink, Briefcase, IndianRupee, Clock } from "lucide-react";
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
}

interface CompanyDetails {
  id: string;
  companyName: string;
  logoUrl: string | null;
  industry: string | null;
  companySize: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
  verificationStatus: string;
  rating: number;
  totalReviews: number;
  website: string | null;
  foundedYear: number | null;
  jobs: Job[];
}

const formatSalary = (min: number, max: number) => {
  const fmt = (n: number) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : `${(n/1000).toFixed(0)}K`;
  return `₹${fmt(min)} - ₹${fmt(max)}`;
};

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await apiFetch(`/api/companies/${companyId}`);
        if (!res.ok) {
          throw new Error("Company not found or demo company");
        }
        const data = await res.json();
        setCompany(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // For demo company IDs (1-6), we can just show an error or mock data
    // But ideally it should only show if found in DB.
    fetchCompany();
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={48} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <Building2 size={64} className="text-slate-700 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
        <p className="text-slate-400 mb-6 max-w-md text-center">
          {error === "Company not found or demo company" 
            ? "This is a demo company from the preview list. Real companies will load their full profile here when they register!"
            : "The company profile you are looking for does not exist or has been removed."}
        </p>
        <Link href="/companies" className="btn btn-primary px-6">
          Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">
        
        {/* Company Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mb-8 p-6 md:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-pink-500" />
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-4xl shrink-0">
               {company.companyName[0]}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-white">{company.companyName}</h1>
                {company.verificationStatus === "VERIFIED" && (
                  <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <CheckCircle2 size={14} /> Verified Employer
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
                {company.city && <span className="flex items-center gap-1"><MapPin size={16} />{company.city}, {company.state}</span>}
                {company.industry && <span className="flex items-center gap-1"><Briefcase size={16} />{company.industry}</span>}
                <span className="flex items-center gap-1"><Users size={16} />{company.companySize || "N/A"} Employees</span>
                {company.website && (
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                    <ExternalLink size={16} /> Website
                  </a>
                )}
              </div>
              
              <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div>
                  <div className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">Rating</div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-lg">
                    <Star size={18} className="fill-current" /> {company.rating.toFixed(1)} 
                    <span className="text-slate-500 text-sm font-normal">({company.totalReviews})</span>
                  </div>
                </div>
                <div className="w-px h-10 bg-slate-800"></div>
                <div>
                  <div className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">Founded</div>
                  <div className="text-white font-bold text-lg">{company.foundedYear || "N/A"}</div>
                </div>
                <div className="w-px h-10 bg-slate-800"></div>
                <div>
                  <div className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">Active Jobs</div>
                  <div className="text-emerald-400 font-bold text-lg">{company.jobs.length}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* About & Jobs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-2xl font-bold text-white mb-4">About {company.companyName}</h2>
              <div className="glass-card text-slate-300 leading-relaxed whitespace-pre-wrap">
                {company.description || "No description provided by the company."}
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-bold text-white mb-4">Open Positions ({company.jobs.length})</h2>
              
              {company.jobs.length === 0 ? (
                <div className="glass-card text-center py-10">
                  <Briefcase size={32} className="text-slate-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-white mb-1">No active jobs</h3>
                  <p className="text-slate-500 text-sm">This company is not hiring currently.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {company.jobs.map((job) => (
                    <Link href={`/jobs/${job.id}`} key={job.id} className="block">
                      <div className="glass-card group hover:border-indigo-500/50 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                          <span className="badge badge-secondary text-xs">{job.jobType.replace("_", " ")}</span>
                        </div>
                        
                        <div className="text-sm text-slate-400 flex items-center gap-4 mb-4">
                          <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}{job.isRemote && " (Remote)"}</span>
                          <span className="flex items-center gap-1 text-emerald-400 font-medium"><IndianRupee size={14} /> {formatSalary(job.salaryMin, job.salaryMax)}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {job.skillsRequired.slice(0, 5).map(skill => (
                            <span key={skill} className="badge badge-primary text-xs bg-slate-800 text-slate-300 border-slate-700">{skill}</span>
                          ))}
                          {job.skillsRequired.length > 5 && (
                            <span className="text-xs text-slate-500 self-center">+{job.skillsRequired.length - 5} more</span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-800">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock size={13} /> Posted {new Date(job.createdAt).toLocaleDateString("en-IN")}
                          </span>
                          <span className="text-indigo-400 font-medium group-hover:underline flex items-center gap-1">
                            View Details <ExternalLink size={14} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
          
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card sticky top-28">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-400" /> Company Highlights
              </h3>
              
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <Star size={14} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Great Work Culture</div>
                    <div className="text-xs text-slate-500">Based on employee reviews</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <Users size={14} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{company.companySize} Employees</div>
                    <div className="text-xs text-slate-500">Growing team size</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Verified Employer</div>
                    <div className="text-xs text-slate-500">Authentic jobs only</div>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
