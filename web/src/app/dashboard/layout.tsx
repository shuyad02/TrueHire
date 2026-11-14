"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, BookOpen, FileText, UserCircle, Settings } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Jobs & Internships", href: "/dashboard/jobs", icon: <Briefcase size={20} /> },
    { name: "My Courses", href: "/dashboard/courses", icon: <BookOpen size={20} /> },
    { name: "Resume & Profile", href: "/dashboard/profile", icon: <FileText size={20} /> },
    { name: "Mock Interviews", href: "/dashboard/interviews", icon: <UserCircle size={20} /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar hidden md:block">
        <div className="h-16" /> {/* Spacer for Navbar */}
        
        <div className="mb-6 px-3 pt-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student Menu</p>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
            >
              <span className={pathname === link.href ? "text-indigo-400" : "text-slate-400"}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <div className="card-gradient rounded-xl p-4 border border-indigo-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white leading-tight">John Doe</h4>
                <p className="text-xs text-slate-400">Computer Science</p>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1">
              <div className="bg-gradient-to-r from-indigo-500 to-pink-500 h-1.5 rounded-full w-[60%]"></div>
            </div>
            <p className="text-[10px] text-slate-400 text-right">Profile 60% complete</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content bg-slate-950">
        {children}
      </main>
    </div>
  );
}
