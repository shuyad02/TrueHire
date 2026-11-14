"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, Loader2, Save, X, Sparkles } from "lucide-react";
import { useAuthStore, apiFetch } from "@/store/authStore";
import toast from "react-hot-toast";

export default function ProfileEditPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [collegeSuggestions, setCollegeSuggestions] = useState<any[]>([]);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  
  const [profile, setProfile] = useState({
    fullName: "",
    college: "",
    bio: "",
    skills: [] as string[],
    resumeUrl: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load existing profile
    const loadProfile = async () => {
      try {
        const res = await apiFetch("/api/student/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    loadProfile();
  }, []);

  // Debounced Auto-complete for Universities
  useEffect(() => {
    const timer = setTimeout(() => {
      if (profile.college && profile.college.length >= 3) {
        fetch(`http://universities.hipolabs.com/search?name=${encodeURIComponent(profile.college)}`)
          .then(res => res.json())
          .then(data => {
            // Take top 15 results
            setCollegeSuggestions(data.slice(0, 15));
          })
          .catch(err => console.error("University fetch error:", err));
      } else {
        setCollegeSuggestions([]);
      }
    }, 400); // 400ms delay to avoid spamming the API while typing

    return () => clearTimeout(timer);
  }, [profile.college]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErrorMsg("Only PDF files are supported.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await apiFetch("/api/student/resume/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${useAuthStore.getState().token}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload resume");

      setProfile(data.profile);
      const skillCount = data.extractedData?.extracted_skills?.length || 0;
      const msg = skillCount > 0 
        ? `✨ ${skillCount} skills extracted from your resume!` 
        : "Resume uploaded! No skills auto-detected — add them manually.";
      
      setSuccessMsg(msg);
      toast.success(msg);
      alert(msg);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload resume");
      toast.error(err.message || "Failed to upload resume");
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await apiFetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");
      
      const successText = "Profile saved successfully! ✅";
      setSuccessMsg(successText);
      toast.success(successText);
      alert(successText);
    } catch (err: any) {
      const errText = err.message || "Failed to save profile";
      setErrorMsg(errText);
      toast.error(errText);
      alert("Error: " + errText);
    } finally {
      setLoading(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = newSkill.trim();
      if (trimmed && !profile.skills.includes(trimmed)) {
        setProfile({ ...profile, skills: [...profile.skills, trimmed] });
        setNewSkill("");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-slate-400 mb-8">Update your information and upload your resume for AI-powered skill extraction.</p>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-3">
            <CheckCircle size={20} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3">
            <X size={20} /> {errorMsg}
          </div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* AI Resume Upload Section */}
          <div className="col-span-1">
            <div className="glass-card sticky top-24">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                AI Resume Parser
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Upload your PDF resume. AI will automatically extract your skills from the document!
              </p>
              
              <input 
                type="file" 
                accept="application/pdf"
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
              
              <div 
                onClick={() => !loading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                  ${loading ? "border-slate-700 opacity-50" : "border-indigo-500/50 hover:border-indigo-400 hover:bg-indigo-500/5"}
                `}
              >
                {loading ? (
                  <Loader2 size={40} className="mx-auto text-indigo-400 animate-spin mb-3" />
                ) : (
                  <Upload size={40} className="mx-auto text-indigo-400 mb-3" />
                )}
                <div className="font-bold text-white mb-1">
                  {loading ? "Parsing Resume..." : "Upload Resume (PDF)"}
                </div>
                <div className="text-xs text-slate-500">Max size 5MB</div>
              </div>

              {profile.resumeUrl && (
                <div className="mt-6 p-3 bg-slate-900 rounded-lg flex items-center justify-between border border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-pink-400" />
                    <span className="text-sm font-medium text-slate-300">Resume Uploaded</span>
                  </div>
                  <a href={`http://localhost:4000${profile.resumeUrl}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">
                    View
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="col-span-1 md:col-span-2">
            <form onSubmit={handleSaveProfile} className="glass-card space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="input-label">Full Name</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={profile.fullName} 
                    onChange={e => setProfile({...profile, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="relative">
                  <label className="input-label">College / University</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Type to search universities..."
                    value={profile.college || ""} 
                    onChange={e => {
                      setProfile({...profile, college: e.target.value});
                      setShowCollegeDropdown(true);
                    }}
                    onFocus={() => { if (profile.college?.length >= 3) setShowCollegeDropdown(true); }}
                    onBlur={() => setTimeout(() => setShowCollegeDropdown(false), 200)}
                  />
                  
                  {/* Floating Dropdown */}
                  {showCollegeDropdown && collegeSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto overflow-x-hidden">
                      {collegeSuggestions.map((uni, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 hover:bg-indigo-500/20 cursor-pointer border-b border-slate-700/50 last:border-0 transition-all"
                          onClick={() => {
                            setProfile({...profile, college: uni.name});
                            setShowCollegeDropdown(false);
                          }}
                        >
                          <div className="text-slate-200 text-sm font-semibold truncate">{uni.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">{uni.country}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="input-label">Bio</label>
                <textarea 
                  className="input min-h-[100px] py-3" 
                  placeholder="Tell companies a little about yourself..."
                  value={profile.bio || ""}
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                />
              </div>

              <div>
                <label className="input-label">Skills</label>
                <div className="min-h-[60px] p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap gap-2 mb-3">
                  {profile.skills.length === 0 ? (
                    <span className="text-slate-500 text-sm italic">Upload your resume to auto-fill skills, or type below and press Enter.</span>
                  ) : (
                    profile.skills.map(skill => (
                      <span key={skill} className="badge badge-primary flex items-center gap-2">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-300 transition-colors">
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
                
                {/* Manual Skill Addition Input */}
                <input 
                  type="text"
                  className="input text-sm"
                  placeholder="Type a skill and press Enter to add (e.g. React, Python, Marketing)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button type="submit" disabled={loading} className="btn btn-primary px-8">
                  <Save size={18} /> {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
