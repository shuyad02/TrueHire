"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, IndianRupee, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { apiFetch, useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [profileExists, setProfileExists] = useState(true);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    jobType: "FULL_TIME",
    experienceLevel: "FRESHER",
    location: "",
    isRemote: false,
    salaryMin: "",
    salaryMax: "",
    skillsRequired: ""
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await apiFetch("/api/companies/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.verificationStatus === "VERIFIED") {
            setIsVerified(true);
          }
        } else if (res.status === 404) {
          setProfileExists(false);
        }
      } catch (err) {
        console.error("Failed to check company verification status", err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        salaryMin: parseInt(form.salaryMin),
        salaryMax: parseInt(form.salaryMax),
        skillsRequired: form.skillsRequired.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await apiFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/company/dashboard"), 2000);
      } else {
        const errData = await res.json();
        toast.error(`Failed to post job: ${errData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error posting job.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Job Posted Successfully!</h2>
        <p className="text-slate-400">Taking you back to dashboard...</p>
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileExists) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
          <Building2 size={40} className="text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Incomplete</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-6">You need to set up your company profile before you can post jobs.</p>
        <button onClick={() => router.push("/company/profile/setup")} className="btn btn-primary">Setup Profile Now</button>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
          <Briefcase size={40} className="text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Verification Pending</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-6">Your company profile is currently under review. You will be able to post jobs once our admin team verifies your account.</p>
        <button onClick={() => router.push("/company/dashboard")} className="btn btn-secondary">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center"><Briefcase size={20} className="text-indigo-400"/></div>
            Post a New Job
          </h1>
          <p className="text-slate-400">Reach thousands of verified, hire-ready candidates instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="input-label">Job Title</label>
              <input required type="text" className="input" placeholder="e.g. Senior Frontend Developer" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>

            <div className="col-span-full">
              <label className="input-label">Job Description (min 20 chars)</label>
              <textarea required minLength={20} className="input min-h-[120px]" placeholder="Describe the role, responsibilities..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>

            <div className="col-span-full">
              <label className="input-label">Requirements (min 10 chars)</label>
              <textarea required minLength={10} className="input min-h-[100px]" placeholder="Specific qualifications, degrees, or requirements..." value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} />
            </div>

            <div>
              <label className="input-label">Job Type</label>
              <select className="input" value={form.jobType} onChange={e => setForm({...form, jobType: e.target.value})}>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            <div>
              <label className="input-label">Experience Level</label>
              <select className="input" value={form.experienceLevel} onChange={e => setForm({...form, experienceLevel: e.target.value})}>
                <option value="FRESHER">Fresher (0 years)</option>
                <option value="ZERO_TO_ONE">0-1 Years</option>
                <option value="ONE_TO_THREE">1-3 Years</option>
                <option value="THREE_TO_FIVE">3-5 Years</option>
              </select>
            </div>

            <div>
              <label className="input-label">Location</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="text" className="input pl-10" placeholder="e.g. Bangalore, India" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="input-label">Min Salary (INR / yr)</label>
              <div className="relative">
                <IndianRupee size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="number" className="input pl-10" placeholder="600000" value={form.salaryMin} onChange={e => setForm({...form, salaryMin: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="input-label">Max Salary (INR / yr)</label>
              <div className="relative">
                <IndianRupee size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="number" className="input pl-10" placeholder="1200000" value={form.salaryMax} onChange={e => setForm({...form, salaryMax: e.target.value})} />
              </div>
            </div>

            <div className="col-span-full">
              <label className="input-label">Required Skills (Comma separated)</label>
              <input required type="text" className="input" placeholder="React, Node.js, TypeScript, PostgreSQL" value={form.skillsRequired} onChange={e => setForm({...form, skillsRequired: e.target.value})} />
            </div>
            
            <div className="col-span-full flex items-center gap-3 p-4 bg-slate-900 rounded-xl border border-slate-800">
              <input type="checkbox" id="remote" className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-indigo-500" checked={form.isRemote} onChange={e => setForm({...form, isRemote: e.target.checked})} />
              <label htmlFor="remote" className="text-sm font-medium text-slate-300">This is a fully remote position</label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="btn btn-secondary px-6">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary px-8">
              {loading ? "Posting..." : "Post Job Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
