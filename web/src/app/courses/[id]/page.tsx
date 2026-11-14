"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Star, Users, CheckCircle2, Shield, Award, Loader2, BookOpen } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { apiFetch } from "@/store/authStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Extract YouTube video ID from URL or raw ID
function extractVideoId(input: string): string {
  if (!input || input === "undefined") return "w7ejDZ8SWv8";
  // Already a plain video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  // YouTube URL formats
  const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : input;
}

// Fallback static map for demo slugs
const STATIC_COURSES: Record<string, any> = {
  c1: { title: "React JS Crash Course 2024", price: 0, rating: 4.8, totalStudents: 1240, durationHours: 4.5, level: "BEGINNER", description: "Learn to build scalable and modern web applications from scratch using React 18, Next.js App Router, and Tailwind CSS.", previewVideoUrl: "w7ejDZ8SWv8", skillsCovered: ["React", "JSX", "Hooks", "State Management"] },
  c2: { title: "Node.js and Express.js - Full Course", price: 0, rating: 4.8, totalStudents: 850, durationHours: 8.25, level: "INTERMEDIATE", description: "Master backend development with Node.js, Express, PostgreSQL, Prisma, and RESTful API design patterns.", previewVideoUrl: "Oe421EPjeBE", skillsCovered: ["Node.js", "Express", "REST API", "MongoDB"] },
  c3: { title: "UI/UX Design Full Course for Beginners", price: 0, rating: 4.9, totalStudents: 3200, durationHours: 11.33, level: "BEGINNER", description: "Start your journey in product design. Learn Figma, wireframing, prototyping, and modern design principles.", previewVideoUrl: "c9Wg6Cb_YlU", skillsCovered: ["Figma", "UI Design", "UX Research", "Prototyping"] },
  c4: { title: "Data Structures and Algorithms in Python", price: 0, rating: 4.7, totalStudents: 450, durationHours: 14, level: "INTERMEDIATE", description: "Ace your coding interviews. Covers Arrays, Linked Lists, Trees, Graphs, and Dynamic Programming with Python.", previewVideoUrl: "8hly31xKli0", skillsCovered: ["Python", "DSA", "Algorithms", "Problem Solving"] },
  c5: { title: "AWS Certified Solutions Architect", price: 0, rating: 4.9, totalStudents: 120, durationHours: 24.83, level: "ADVANCED", description: "Prepare for the AWS Solutions Architect Certification. Hands-on labs with EC2, S3, RDS, Lambda, and more.", previewVideoUrl: "k1RI5locZE4", skillsCovered: ["AWS", "EC2", "S3", "Lambda", "Cloud"] },
  c6: { title: "Python Machine Learning Tutorial", price: 0, rating: 4.8, totalStudents: 2100, durationHours: 12.17, level: "INTERMEDIATE", description: "Learn Python, Scikit-Learn, TensorFlow, and build real-world ML models.", previewVideoUrl: "7eh4d6sabA0", skillsCovered: ["Python", "Scikit-Learn", "TensorFlow", "ML"] },
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced",
};

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuthStore();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState("");

  const courseId = resolvedParams.id;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        } else {
          // Fallback to static map
          setCourse(STATIC_COURSES[courseId] || STATIC_COURSES["c1"]);
        }
      } catch {
        setCourse(STATIC_COURSES[courseId] || STATIC_COURSES["c1"]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  // Check if already enrolled
  useEffect(() => {
    if (!user || user.role !== 'STUDENT') return;
    const checkEnrollment = async () => {
      try {
        const res = await apiFetch('/api/courses/my/enrollments');
        if (res.ok) {
          const data = await res.json();
          const isEnrolled = data.some((e: any) => e.courseId === courseId || e.course?.id === courseId);
          if (isEnrolled) setEnrolled(true);
        }
      } catch { /* ignore */ }
    };
    checkEnrollment();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login to enroll.");
      router.push('/login');
      return;
    }
    if (user.role !== 'STUDENT') {
      toast.error("Only students can enroll in courses.");
      return;
    }
    setEnrolling(true);
    try {
      const res = await apiFetch(`/api/courses/${courseId}/enroll`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setEnrolled(true);
        toast.success("🎉 Successfully enrolled! Happy learning!");
      } else if (res.status === 409) {
        setEnrolled(true);
        toast("You are already enrolled in this course.", { icon: "ℹ️" });
      } else {
        toast.error(data.error || "Enrollment failed. Please try again.");
      }
    } catch {
      toast.error("Enrollment failed. Please check your connection.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={40} className="text-pink-400 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Course not found.</p>
          <Link href="/courses" className="btn btn-primary">Back to Courses</Link>
        </div>
      </div>
    );
  }

  // Determine video ID: check searchParams first, then DB field, then fallback
  const rawVideoId = searchParams.get("videoId");
  const videoId = extractVideoId(
    (rawVideoId && rawVideoId !== "undefined") ? rawVideoId : (course.previewVideoUrl || "w7ejDZ8SWv8")
  );

  const durationDisplay = course.durationHours
    ? `${Math.floor(course.durationHours)}h ${Math.round((course.durationHours % 1) * 60)}m`
    : "Self-paced";

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* YouTube Video Player */}
            <div className="rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 aspect-video relative">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={course.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  {course.category || "Course"}
                </span>
                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {LEVEL_LABELS[course.level] || course.level}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{course.title}</h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 border-b border-slate-800 pb-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-200">{course.rating || 4.8}</span>
                  <span>({(course.totalReviews || 0) > 0 ? course.totalReviews : "1.2k"} ratings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{(course.totalStudents || course._count?.enrollments || 0).toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{durationDisplay}</span>
                </div>
              </div>

              {/* Enrollment message */}
              {enrollMsg && (
                <div className={`mb-4 text-sm px-4 py-3 rounded-lg border ${enrolled ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                  {enrollMsg}
                </div>
              )}

              {/* Course Tabs */}
              <Tabs.Root defaultValue="overview">
                <Tabs.List className="flex border-b border-slate-800 mb-6">
                  {["overview", "curriculum", "reviews"].map((tab) => (
                    <Tabs.Trigger
                      key={tab}
                      value={tab}
                      className="px-6 py-3 text-sm font-medium text-slate-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-pink-500 capitalize transition-colors"
                    >
                      {tab}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                <Tabs.Content value="overview" className="text-slate-300 space-y-6 leading-relaxed">
                  <p>{course.description || "A comprehensive course designed to take you from beginner to professional."}</p>
                  {course.skillsCovered?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><BookOpen size={18} className="text-pink-400"/> Skills You'll Learn</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.skillsCovered.map((sk: string) => (
                          <span key={sk} className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm border border-slate-700">{sk}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">What you'll learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Build real-world, enterprise-level applications",
                        "Master the core fundamentals and advanced concepts",
                        "Learn best practices used by top engineers",
                        "Gain a certificate to boost your resume",
                        "Access to private community and mentor support",
                        "Lifetime access to all future updates"
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="curriculum" className="text-slate-300">
                  <div className="space-y-3">
                    {["Introduction & Setup", "Core Fundamentals", "Advanced Concepts & Architecture", "Real-world Project Building", "Deployment & Best Practices"].map((title, i) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex justify-between items-center hover:bg-slate-800 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-sm">{i + 1}</div>
                          <span className="font-medium text-slate-200">{title}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{[5, 12, 8, 15, 4][i]} videos</span>
                      </div>
                    ))}
                  </div>
                </Tabs.Content>

                <Tabs.Content value="reviews" className="text-slate-300">
                  <p className="text-center py-10 text-slate-500 italic">Student reviews coming soon! Be the first to enroll and share your experience.</p>
                </Tabs.Content>
              </Tabs.Root>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="glass-card sticky top-28 p-6">
              <div className="text-3xl font-black text-white mb-6">
                {course.price === 0 ? <span className="text-emerald-400">Free</span> : `₹${course.price}`}
              </div>

              <button
                onClick={handleEnroll}
                disabled={enrolling || enrolled}
                className="btn w-full bg-pink-500 hover:bg-pink-600 text-white border-none py-3 mb-3 shadow-lg shadow-pink-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {enrolling ? <><Loader2 size={16} className="animate-spin mr-2"/>Enrolling...</> : enrolled ? "✅ Enrolled!" : "Enroll Now — Free"}
              </button>

              <div className="space-y-3 text-sm text-slate-300 mt-5">
                {[
                  ["Level", LEVEL_LABELS[course.level] || course.level],
                  ["Duration", durationDisplay],
                  ["Language", course.language || "Hindi + English"],
                  ["Certificate", "Yes ✅"],
                  ["Access", "Lifetime"],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-medium text-white">{val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2 justify-center text-xs text-slate-500">
                <Shield size={14} /> 100% Free · No Credit Card Required
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
