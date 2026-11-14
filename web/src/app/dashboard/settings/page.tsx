"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Save, Bell, Lock, User, Monitor } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    jobAlerts: true,
    smsNotifications: false,
    theme: "dark",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock save delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast.success("Settings saved successfully!");
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="p-4 md:p-8 pt-24 md:pt-8 w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account preferences and notification settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Account Section */}
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-4 text-indigo-400">
            <User size={20} />
            <h2 className="text-xl font-bold text-white">Account Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="input-label">Email Address</label>
              <input 
                type="email" 
                className="input bg-slate-900/50 text-slate-400 cursor-not-allowed" 
                value={user?.email || ""} 
                disabled 
              />
              <p className="text-xs text-slate-500 mt-2">Your email address cannot be changed right now.</p>
            </div>
            <div>
              <label className="input-label">Role</label>
              <input 
                type="text" 
                className="input bg-slate-900/50 text-slate-400 cursor-not-allowed uppercase" 
                value={user?.role || "STUDENT"} 
                disabled 
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-4 text-pink-400">
            <Bell size={20} />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors">
              <div>
                <div className="font-semibold text-white">Email Notifications</div>
                <div className="text-xs text-slate-400">Receive updates about your applications</div>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-indigo-500 cursor-pointer"
                checked={settings.emailNotifications}
                onChange={e => setSettings({...settings, emailNotifications: e.target.checked})}
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors">
              <div>
                <div className="font-semibold text-white">Job Alerts</div>
                <div className="text-xs text-slate-400">Get notified when AI finds matching jobs</div>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-indigo-500 cursor-pointer"
                checked={settings.jobAlerts}
                onChange={e => setSettings({...settings, jobAlerts: e.target.checked})}
              />
            </label>
          </div>
        </div>

        {/* Password & Security Section */}
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <Lock size={20} />
            <h2 className="text-xl font-bold text-white">Security</h2>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg border border-slate-800">
            <div>
              <div className="font-semibold text-white">Change Password</div>
              <div className="text-xs text-slate-400">Update your account password securely</div>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => toast.success("Password change link sent to your email.")}>
              Reset Password
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button type="submit" disabled={loading} className="btn btn-primary px-8 flex items-center gap-2">
            <Save size={18} />
            {loading ? "Saving..." : success ? "Saved!" : "Save Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}
