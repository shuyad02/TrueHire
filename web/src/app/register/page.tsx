"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Mail, Lock, User, Building2, Sparkles, AlertCircle } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [sName, setSName] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPassword, setSPassword] = useState("");

  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");

  const handleRegister = async (role: "STUDENT" | "COMPANY") => {
    setLoading(true);
    setError("");

    const payload = role === "STUDENT"
      ? { email: sEmail, password: sPassword, role: "STUDENT", name: sName }
      : { email: cEmail, password: cPassword, role: "COMPANY", name: cName };

    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setAuth(data.token, data.user);

      if (role === "COMPANY") router.push("/employer/dashboard");
      else router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center py-24 px-4">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse-glow" style={{ animationDelay: "2s" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            True<span className="gradient-text">Hire</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2 mt-4">Create an account</h1>
          <p className="text-slate-400 text-sm">Join the ecosystem of verified talent & companies</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-2"
          >
            <AlertCircle size={16} className="shrink-0" />{error}
          </motion.div>
        )}

        <Tabs.Root defaultValue="student" className="w-full">
          <Tabs.List className="flex gap-1 w-full mb-6 p-1 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <Tabs.Trigger value="student" className="flex-1 py-2 text-sm font-medium rounded-lg text-slate-400 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30 transition-all flex items-center justify-center gap-2">
              <User size={16} /> Student
            </Tabs.Trigger>
            <Tabs.Trigger value="company" className="flex-1 py-2 text-sm font-medium rounded-lg text-slate-400 data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 data-[state=active]:border data-[state=active]:border-pink-500/30 transition-all flex items-center justify-center gap-2">
              <Building2 size={16} /> Company
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="student" className="outline-none">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleRegister("STUDENT"); }}>
              {[
                { label: "Full Name", icon: <User size={18} />, value: sName, onChange: setSName, type: "text", placeholder: "John Doe" },
                { label: "Email address", icon: <Mail size={18} />, value: sEmail, onChange: setSEmail, type: "email", placeholder: "student@college.edu" },
                { label: "Password (min 6 chars)", icon: <Lock size={18} />, value: sPassword, onChange: setSPassword, type: "password", placeholder: "••••••••" },
              ].map(field => (
                <div key={field.label}>
                  <label className="input-label">{field.label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">{field.icon}</div>
                    <input type={field.type} required value={field.value} onChange={e => field.onChange(e.target.value)} className="input pl-10" placeholder={field.placeholder} />
                  </div>
                </div>
              ))}
              <button disabled={loading} className="btn btn-primary w-full justify-center py-3 mt-2 disabled:opacity-50">
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</span> : <><span>Create Student Account</span><ArrowRight size={18} /></>}
              </button>
            </form>
          </Tabs.Content>

          <Tabs.Content value="company" className="outline-none">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleRegister("COMPANY"); }}>
              {[
                { label: "Company Name", icon: <Building2 size={18} />, value: cName, onChange: setCName, type: "text", placeholder: "TechCorp India" },
                { label: "Work Email", icon: <Mail size={18} />, value: cEmail, onChange: setCEmail, type: "email", placeholder: "hr@techcorp.com" },
                { label: "Password (min 6 chars)", icon: <Lock size={18} />, value: cPassword, onChange: setCPassword, type: "password", placeholder: "••••••••" },
              ].map(field => (
                <div key={field.label}>
                  <label className="input-label">{field.label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">{field.icon}</div>
                    <input type={field.type} required value={field.value} onChange={e => field.onChange(e.target.value)} className="input pl-10" placeholder={field.placeholder} />
                  </div>
                </div>
              ))}
              <button disabled={loading} className="btn w-full justify-center py-3 mt-2 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #EC4899, #DB2777)", color: "white", borderRadius: 10 }}>
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</span> : <><span>Create Employer Account</span><ArrowRight size={18} /></>}
              </button>
            </form>
          </Tabs.Content>
        </Tabs.Root>

        {/* OAuth Section */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/50 text-slate-400 backdrop-blur-sm">Or sign up with</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              href="http://localhost:4000/api/auth/google"
              className="btn btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2 hover:bg-white/5"
            >
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Google
            </a>
            <a
              href="http://localhost:4000/api/auth/github"
              className="btn btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2 hover:bg-white/5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
