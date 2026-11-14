"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, PlayCircle, Clock, Star, Users, BookOpen, Zap, Award, Code2, Cpu, Palette, TrendingUp } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/store/authStore";

const CATEGORIES = ["All", "Web Development", "Backend Development", "Design", "Computer Science", "Cloud", "Machine Learning"];

const CATEGORY_ICONS: Record<string, any> = {
  "Web Development": Code2,
  "Backend Development": Zap,
  "Design": Palette,
  "Computer Science": Cpu,
  "Cloud": TrendingUp,
  "Machine Learning": Award,
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  INTERMEDIATE: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  ADVANCED: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await apiFetch('/api/courses');
        const data = res.ok ? await res.json() : [];
        setCourses(data.length > 0 ? data : []);
      } catch (err) {
        console.error(err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const filtered = courses.filter((c) => {
    const matchesSearch = !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.skillsCovered?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <BookOpen size={20} className="text-pink-400" />
            </div>
            <span className="text-sm font-bold text-pink-400 uppercase tracking-wider">Learning Hub</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Master New <span className="gradient-text">Skills</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Increase your Hire-Ready Score by completing industry-recognized courses. Real projects, top instructors, lifetime access.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, skills..."
            className="input pl-11 py-3 w-full"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? "bg-pink-500/20 text-pink-400 border-pink-500/40"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200"
                }`}
              >
                {Icon && <Icon size={14} />}{cat}
              </button>
            );
          })}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-0 overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen size={48} className="text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-500 mb-2">
              {courses.length === 0 ? "No courses available yet" : "No courses match your search"}
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              {courses.length === 0
                ? "Check back soon or contact admin to seed demo courses."
                : "Try a different search term or category."}
            </p>
            {search && (
              <button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="btn btn-secondary">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-sm mb-4">{filtered.length} course{filtered.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course: any, i: number) => (
                <Link href={`/courses/${course.id}`} key={course.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card p-0 overflow-hidden flex flex-col group cursor-pointer h-full hover:border-pink-500/30 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="h-48 bg-slate-800 relative overflow-hidden">
                      <img
                        src={course.thumbnailUrl || `https://img.youtube.com/vi/${course.previewVideoUrl}/maxresdefault.jpg`}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-course.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <PlayCircle size={30} className="text-white drop-shadow-lg" />
                        </div>
                      </div>
                      {/* Level badge */}
                      <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold border ${LEVEL_COLORS[course.level] || "text-slate-400 bg-slate-800 border-slate-700"}`}>
                        {course.level?.replace("_", " ") || "BEGINNER"}
                      </div>
                      {course.isFree && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/90 text-white">
                          FREE
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="text-xs text-pink-400 font-semibold mb-1">{course.category || "Course"}</div>
                      <h3 className="font-bold text-base mb-2 text-white group-hover:text-pink-400 transition-colors line-clamp-2 flex-1">{course.title}</h3>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>

                      {/* Skills */}
                      {course.skillsCovered?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {course.skillsCovered.slice(0, 3).map((sk: string) => (
                            <span key={sk} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">{sk}</span>
                          ))}
                          {course.skillsCovered.length > 3 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">+{course.skillsCovered.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users size={13} /> {(course.totalStudents || course._count?.enrollments || 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 text-amber-400">
                            <Star size={13} className="fill-amber-400" />
                            {course.rating || "4.8"}
                          </span>
                          {course.durationHours && (
                            <span className="flex items-center gap-1">
                              <Clock size={13} /> {Math.floor(course.durationHours)}h
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-pink-400 text-sm">
                          {course.price === 0 ? "Free" : `₹${course.price}`}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
