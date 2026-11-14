"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap, BarChart3, Users, Star, CheckCircle2, ArrowRight,
  Building2, Trophy, Lightbulb, BookOpen, TrendingUp, Shield
} from "lucide-react";

const FEATURES = [
  {
    icon: <BarChart3 size={28} className="text-indigo-400" />,
    title: "Placement Analytics Dashboard",
    description: "Track your college's placement statistics, top hiring companies, average salaries, and year-on-year improvement in real-time.",
  },
  {
    icon: <Users size={28} className="text-pink-400" />,
    title: "Student Progress Tracking",
    description: "Monitor individual student profiles, skill readiness, mock interview scores, and application status from one centralized dashboard.",
  },
  {
    icon: <Building2 size={28} className="text-emerald-400" />,
    title: "Direct Company Connect",
    description: "Get your students in front of 500+ verified companies actively hiring freshers. No middlemen, no fake jobs.",
  },
  {
    icon: <BookOpen size={28} className="text-amber-400" />,
    title: "AI-Powered Skill Gap Analysis",
    description: "Identify which skills your students are lacking based on real market demand and recommend targeted courses automatically.",
  },
  {
    icon: <Trophy size={28} className="text-indigo-400" />,
    title: "College Ranking & Recognition",
    description: "Get your institution recognized with a TrueHire Placement Excellence badge visible to all top companies on our platform.",
  },
  {
    icon: <Shield size={28} className="text-pink-400" />,
    title: "NAAC Compliance Reports",
    description: "Generate ready-to-submit placement reports aligned with NAAC, NBA, and other accreditation body requirements.",
  },
];

const STATS = [
  { value: "2,500+", label: "Colleges Enrolled" },
  { value: "1.2L+", label: "Students Placed" },
  { value: "₹6.8 LPA", label: "Avg. Package" },
  { value: "500+", label: "Hiring Companies" },
];

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    desc: "For small colleges getting started",
    features: ["Up to 200 students", "Basic placement dashboard", "Student profile management", "Email support"],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Professional",
    price: "₹4,999/mo",
    desc: "For growing institutions",
    features: ["Up to 2,000 students", "Advanced analytics & reports", "AI skill gap analysis", "Direct company connections", "NAAC-ready reports", "Priority support"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For universities & large groups",
    features: ["Unlimited students", "Multi-campus support", "Custom branding", "API access", "Dedicated account manager", "SLA guarantee"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function ForCollegePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Hero */}
      <div className="pt-28 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-sm text-indigo-400 font-medium mb-6">
            <GraduationCap size={16} />
            Trusted by 2,500+ Colleges across India
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Transform Your College's<br />
            <span className="gradient-text">Placement Cell</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-10">
            Give your students a real edge in the job market. TrueHire's AI-powered platform helps placement officers track, train, and connect students with verified top employers — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn btn-primary px-8 py-4 text-lg">
              Register Your College <ArrowRight size={20} />
            </Link>
            <a href="mailto:colleges@truehire.in" className="btn btn-secondary px-8 py-4 text-lg">
              Talk to Sales
            </a>
          </div>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-slate-800 bg-slate-900/50 py-10">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="text-3xl font-black gradient-text mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything Your Placement Cell Needs
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From student onboarding to final placement reports — TrueHire handles it all.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="glass-card h-full hover:border-indigo-500/40 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="py-20 px-4 bg-slate-900/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className={`glass-card h-full flex flex-col relative ${plan.highlight ? "border-indigo-500 bg-indigo-500/5" : ""}`}>
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{plan.desc}</p>
                  <div className="text-3xl font-black gradient-text mb-6">{plan.price}</div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={`btn w-full justify-center py-3 ${plan.highlight ? "btn-primary" : "btn-secondary"}`}>
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Supercharge Your Placements?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join 2,500+ colleges already using TrueHire. Get started in under 5 minutes.
          </p>
          <Link href="/register" className="btn btn-primary px-10 py-4 text-lg">
            Register Your College for Free <ArrowRight size={20} />
          </Link>
        </div>
      </div>

    </div>
  );
}
