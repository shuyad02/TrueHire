"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, PlayCircle, Briefcase, GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pink-500/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-50" />
        
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-300">India's First Verified Job + Training Platform</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            College Se Career Tak<br />
            <span className="gradient-text">Ek Hi Platform.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Get verified jobs, upskill with top-tier courses, and track your "Hire-Ready" score. No fake jobs, no ghosting—just real career growth.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="btn btn-primary px-8 py-4 text-lg w-full sm:w-auto flex items-center justify-center gap-2 group">
              Start as Student <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register" className="btn btn-secondary px-8 py-4 text-lg w-full sm:w-auto flex items-center justify-center gap-2">
              <Briefcase size={20} /> Post a Job (For Employers)
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 bg-slate-900 border-y border-slate-800">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why TrueHire?</h2>
            <p className="text-slate-400">Everything you need to land your dream job.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Verified Jobs Only", desc: "Every company is vetted. No scams, no fake listings. Just real opportunities.", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { title: "AI-Powered Parsing", desc: "Upload your resume, and our AI instantly extracts your skills and calculates your Hire-Ready Score.", icon: Sparkles, color: "text-indigo-400", bg: "bg-indigo-500/10" },
              { title: "Learn & Upskill", desc: "Access high-quality video courses. Complete them to boost your profile and get noticed.", icon: PlayCircle, color: "text-pink-400", bg: "bg-pink-500/10" },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card hover:-translate-y-2 transition-transform duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                  <feature.icon size={28} className={feature.color} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 text-center text-slate-500 border-t border-slate-800">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles size={16} className="text-indigo-400" />
          <span className="font-bold text-white">TrueHire Ecosystem</span>
        </div>
        <p>© {new Date().getFullYear()} TrueHire. All rights reserved.</p>
      </footer>

    </div>
  );
}
