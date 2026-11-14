"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sparkles, AlertCircle } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const err = searchParams.get("error");

    if (err) {
      const messages: Record<string, string> = {
        google_failed: "Google se login karne mein problem aayi. Dobara koshish karein.",
        github_failed: "GitHub se login karne mein problem aayi. Dobara koshish karein.",
        no_email: "Aapke account mein koi email nahi mili. Kripya email/password se login karein.",
      };
      setError(messages[err] || "Login failed. Please try again.");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    if (!token || !role) {
      setError("Token nahi mila. Wapas login page par ja rahe hain...");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    // Fetch full user info from backend using the token
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((user) => {
        if (!user || user.error) throw new Error("User not found");
        setAuth(token, user);
        if (role === "COMPANY") {
          router.push("/employer/dashboard");
        } else if (role === "COLLEGE") {
          router.push("/college/dashboard");
        } else if (role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      })
      .catch(() => {
        setError("User info fetch nahi ho saki. Wapas login page par ja rahe hain...");
        setTimeout(() => router.push("/login"), 2000);
      });
  }, [searchParams, router, setAuth, API_URL]);

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="glass-card max-w-md mx-auto p-8">
            <div className="flex items-center justify-center gap-3 mb-4 text-red-400">
              <AlertCircle size={32} />
              <span className="text-lg font-semibold">Login Failed</span>
            </div>
            <p className="text-slate-300 text-sm">{error}</p>
            <p className="text-slate-500 text-xs mt-2">Login page par redirect ho rahe hain...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Spinner */}
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} className="text-indigo-400" />
              </div>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Login ho raha hai...</p>
              <p className="text-slate-400 text-sm mt-1">Aapko dashboard par le ja rahe hain</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen hero-gradient flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
