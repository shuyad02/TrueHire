"use client";

import { useEffect, useState } from "react";
import { apiFetch, useAuthStore } from "@/store/authStore";
import { CheckCircle, XCircle, Clock, ShieldAlert, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await apiFetch("/api/admin/dashboard-stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleVerify = async (companyId: string, status: 'VERIFIED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to mark this company as ${status}?`)) return;

    try {
      const res = await apiFetch(`/api/admin/verify-company/${companyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        toast.success(`Company ${status.toLowerCase()} successfully!`);
        fetchDashboard(); // Refresh data
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
      </div>
    );
  }

  if (!data) return <div className="text-center text-white pt-32">Failed to load admin data.</div>;

  const { stats, pendingCompanies } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="w-8 h-8 text-indigo-500" />
          <h1 className="text-3xl font-bold">Admin Portal</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="glass-card flex flex-col items-center justify-center py-6">
            <span className="text-4xl font-bold text-yellow-400">{stats.pendingCount}</span>
            <span className="text-sm text-slate-400 mt-2">Pending Companies</span>
          </div>
          <div className="glass-card flex flex-col items-center justify-center py-6">
            <span className="text-4xl font-bold text-emerald-400">{stats.verifiedCount}</span>
            <span className="text-sm text-slate-400 mt-2">Verified Companies</span>
          </div>
          <div className="glass-card flex flex-col items-center justify-center py-6">
            <span className="text-4xl font-bold text-indigo-400">{stats.totalStudents}</span>
            <span className="text-sm text-slate-400 mt-2">Total Students</span>
          </div>
          <div className="glass-card flex flex-col items-center justify-center py-6">
            <span className="text-4xl font-bold text-blue-400">{stats.totalJobs}</span>
            <span className="text-sm text-slate-400 mt-2">Active Jobs</span>
          </div>
        </div>

        {/* Pending Verification Table */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" /> Action Required: Company Verifications
          </h2>

          {pendingCompanies.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <CheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
              All caught up! No pending companies to verify.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-800 text-slate-400 text-sm">
                  <tr>
                    <th className="pb-3 font-medium">Company Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Industry</th>
                    <th className="pb-3 font-medium">Location</th>
                    <th className="pb-3 font-medium">Registered Date</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {pendingCompanies.map((company: any) => (
                    <tr key={company.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 font-semibold">{company.companyName}</td>
                      <td className="py-4 text-slate-400">{company.user.email}</td>
                      <td className="py-4"><span className="badge badge-secondary">{company.industry || 'N/A'}</span></td>
                      <td className="py-4 text-slate-300">{company.location || 'N/A'}</td>
                      <td className="py-4 text-slate-400">{new Date(company.user.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleVerify(company.id, 'VERIFIED')}
                            className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
                            title="Approve Company"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleVerify(company.id, 'REJECTED')}
                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                            title="Reject Company"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
