"use client";

import { useState } from "react";
import { User, Bell, Shield, Key, LogOut, CheckCircle, X, AlertTriangle } from "lucide-react";
import { useAuthStore, apiFetch } from "@/store/authStore";
import toast from "react-hot-toast";

type TabType = "profile" | "notifications" | "privacy" | "security";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      const res = await apiFetch("/api/settings/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/settings/account", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");
      
      toast.success("Account deleted successfully");
      logout();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-slate-400 mb-8">Manage your account preferences and security.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${
                activeTab === "profile" 
                  ? "bg-indigo-500/10 text-indigo-400 font-semibold" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <User size={18} /> Profile Info
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${
                activeTab === "notifications" 
                  ? "bg-indigo-500/10 text-indigo-400 font-semibold" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Bell size={18} /> Notifications
            </button>
            <button 
              onClick={() => setActiveTab("privacy")}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${
                activeTab === "privacy" 
                  ? "bg-indigo-500/10 text-indigo-400 font-semibold" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Shield size={18} /> Privacy
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${
                activeTab === "security" 
                  ? "bg-indigo-500/10 text-indigo-400 font-semibold" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Key size={18} /> Security
            </button>
          </div>

          {/* Main Content */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <>
                <div className="glass-card">
                  <h3 className="text-xl font-bold mb-4">Account Information</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-slate-400">Role</label>
                      <p className="font-semibold capitalize text-lg text-white">{user?.role?.toLowerCase() || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-400">Account ID</label>
                      <div className="p-3 bg-slate-900 rounded-lg mt-1 border border-slate-800">
                        <p className="text-sm font-mono text-slate-300 break-all">{user?.id || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card border-red-500/20">
                  <h3 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Once you delete your account, there is no going back. All your data will be permanently wiped.
                  </p>
                  
                  {showDeleteConfirm ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-4">
                      <div className="flex items-start gap-3 text-red-400">
                        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Are you absolutely sure?</p>
                          <p className="text-sm opacity-80">This action cannot be undone. This will permanently delete your account and remove your data from our servers.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={handleDeleteAccount}
                          disabled={loading}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
                        >
                          {loading ? "Deleting..." : "Yes, delete my account"}
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={loading}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => logout()}
                        className="px-6 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium transition-colors flex items-center gap-2"
                      >
                        <LogOut size={18} /> Sign Out
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
                      >
                        Delete Account
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                  <Bell size={28} className="text-slate-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Notification Preferences</h3>
                <p className="text-slate-400 max-w-sm">We are working on bringing you granular control over your email and push notifications. Coming soon!</p>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                  <Shield size={28} className="text-slate-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Privacy Controls</h3>
                <p className="text-slate-400 max-w-sm">Soon you will be able to control who can view your profile and contact information.</p>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="glass-card">
                <h3 className="text-xl font-bold mb-6">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Current Password</label>
                    <input 
                      type="password" 
                      className="input w-full"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
                    <input 
                      type="password" 
                      className="input w-full"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="input w-full"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn btn-primary px-8"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
