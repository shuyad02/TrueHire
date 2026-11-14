"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, ChevronDown, Briefcase, BookOpen,
  User, Building2, LogOut, Settings, Sparkles, LayoutDashboard
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const NAV_LINKS = [
  { label: "Jobs", href: "/jobs" },
  { label: "Courses", href: "/courses" },
  { label: "Companies", href: "/companies" },
  { label: "For Colleges", href: "/college" },
];

export default function Navbar({ variant = "transparent" }: { variant?: "transparent" | "solid" }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const getDashboardUrl = (role?: string) => {
    if (role === 'COMPANY') return '/employer/dashboard';
    if (role === 'COLLEGE') return '/college/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/dashboard';
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isScrolled = scrolled || variant === "solid";

  return (
    <>
      <nav className={`navbar transition-all duration-300 ${isScrolled ? "bg-opacity-95 shadow-xl bg-slate-900 border-b border-slate-800" : ""}`}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{
              width: 36, height: 36,
              background: "linear-gradient(135deg, #6366F1, #EC4899)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Sparkles size={18} color="white" />
            </div>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#F1F5F9" }}>
              True<span style={{ background: "linear-gradient(135deg,#6366F1,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Hire</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="hide-mobile">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} style={{
                color: "#94A3B8", fontSize: "0.875rem", fontWeight: 500,
                textDecoration: "none", transition: "color 0.2s"
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "#F1F5F9")}
                onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Auth / CTA Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }} className="hide-mobile">
            {user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all cursor-pointer outline-none">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                      {(user.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-sm font-medium text-slate-200 leading-none mb-1">{user.email ? user.email.split('@')[0] : 'User'}</div>
                      <div className="text-xs text-slate-500 leading-none">{user.role}</div>
                    </div>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[220px] bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-2xl z-50 text-slate-300 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item asChild className="outline-none">
                      <Link href={getDashboardUrl(user.role)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white cursor-pointer transition-colors">
                        <LayoutDashboard size={16} className="text-indigo-400" />
                        Dashboard
                      </Link>
                    </DropdownMenu.Item>
                    
                    {user.role === 'STUDENT' && (
                      <DropdownMenu.Item asChild className="outline-none">
                        <Link href="/student/profile/edit" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white cursor-pointer transition-colors">
                          <User size={16} className="text-emerald-400" />
                          Edit Profile
                        </Link>
                      </DropdownMenu.Item>
                    )}

                    <DropdownMenu.Item asChild className="outline-none">
                      <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white cursor-pointer transition-colors">
                        <Settings size={16} className="text-slate-400" />
                        Account Settings
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px bg-slate-800 my-2" />

                    <DropdownMenu.Item 
                      onSelect={(e) => { e.preventDefault(); logout(); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 cursor-pointer outline-none transition-colors"
                    >
                      <LogOut size={16} />
                      Log out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link href="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "none", border: "none", color: "#F1F5F9", cursor: "pointer", display: "none" }}
            className="show-mobile"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed", top: 64, left: 0, right: 0, zIndex: 45,
              background: "rgba(15,23,42,0.98)", backdropFilter: "blur(20px)",
              borderBottom: "1px solid #334155", padding: "1rem 1.5rem 1.5rem"
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} style={{
                display: "block", padding: "0.75rem 0",
                color: "#94A3B8", textDecoration: "none", fontWeight: 500,
                borderBottom: "1px solid #1E293B"
              }} onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                <Link href={getDashboardUrl(user.role)} className="btn btn-secondary w-full text-center py-2" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="btn w-full text-center py-2 bg-red-500/10 text-red-400 border border-red-500/30 font-medium rounded-lg">
                  Log out
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                <Link href="/login" className="btn btn-secondary" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link href="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
