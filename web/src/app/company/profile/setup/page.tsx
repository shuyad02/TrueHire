"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Save, MapPin, Loader2, CheckCircle, X } from "lucide-react";
import { apiFetch, useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function CompanyProfileSetupPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [form, setForm] = useState({
    companyName: "",
    website: "",
    description: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    gstNumber: "",
    cinNumber: "",
    city: "",
    state: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch("/api/companies/profile");
        if (res.ok) {
          const data = await res.json();
          setForm({
            companyName: data.companyName || "",
            website: data.website || "",
            description: data.description || "",
            industry: data.industry || "",
            companySize: data.companySize || "",
            foundedYear: data.foundedYear?.toString() || "",
            gstNumber: data.gstNumber || "",
            cinNumber: data.cinNumber || "",
            city: data.city || "",
            state: data.state || ""
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await apiFetch("/api/companies/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => {
        router.push("/company/dashboard");
      }, 2000);
      
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 px-4 pb-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Building2 size={20} className="text-indigo-400" />
          </div>
          Company Profile Setup
        </h1>
        <p className="text-slate-400 mb-8">Complete your company profile to get verified and start posting jobs.</p>

        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-3">
            <CheckCircle size={20} /> {successMsg}
          </motion.div>
        )}

        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3">
            <X size={20} /> {errorMsg}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="glass-card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full md:col-span-1">
              <label className="input-label">Company Name *</label>
              <input required type="text" className="input" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} />
            </div>
            
            <div className="col-span-full md:col-span-1">
              <label className="input-label">Website</label>
              <input type="url" className="input" placeholder="https://example.com" value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
            </div>

            <div className="col-span-full">
              <label className="input-label">Company Description *</label>
              <textarea required minLength={20} className="input min-h-[100px]" placeholder="What does your company do?" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>

            <div>
              <label className="input-label">Industry *</label>
              <select required className="input" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})}>
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="input-label">Company Size *</label>
              <select required className="input" value={form.companySize} onChange={e => setForm({...form, companySize: e.target.value})}>
                <option value="">Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div>
              <label className="input-label">Founded Year</label>
              <input type="number" min="1800" max={new Date().getFullYear()} className="input" placeholder="e.g. 2010" value={form.foundedYear} onChange={e => setForm({...form, foundedYear: e.target.value})} />
            </div>

            <div>
              <label className="input-label">GST Number</label>
              <input type="text" className="input" placeholder="22AAAAA0000A1Z5" pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$" title="Enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5)" value={form.gstNumber} onChange={e => setForm({...form, gstNumber: e.target.value.toUpperCase()})} />
            </div>

            <div>
              <label className="input-label">CIN Number</label>
              <input type="text" className="input" placeholder="U12345MH2000PTC123456" pattern="^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$" title="Enter a valid 21-character CIN (e.g. U12345MH2000PTC123456)" value={form.cinNumber} onChange={e => setForm({...form, cinNumber: e.target.value.toUpperCase()})} />
            </div>

            <div>
              <label className="input-label">City *</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="text" className="input pl-10" placeholder="Mumbai" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="input-label">State *</label>
              <input required type="text" className="input" placeholder="Maharashtra" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
            <button type="submit" disabled={loading} className="btn btn-primary px-8">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Save Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
