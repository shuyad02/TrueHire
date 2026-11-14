"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Building2, MapPin, Users, CheckCircle2, Star, Loader2, ExternalLink } from "lucide-react";
import { apiFetch } from "@/store/authStore";

interface Company {
  id: string;
  companyName: string;
  logoUrl: string | null;
  industry: string | null;
  companySize: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
  verificationStatus: string;
  rating: number;
  totalReviews: number;
  website: string | null;
  _count?: { jobs: number };
}

const INDUSTRIES = ["All", "Technology", "Finance", "Healthcare", "Education", "E-Commerce", "Manufacturing", "Media"];

// Demo companies to show when API has no data
const DEMO_COMPANIES: Company[] = [
  { id: "1", companyName: "TechCorp India", industry: "Technology", companySize: "201-500", city: "Bangalore", state: "Karnataka", description: "Leading software company building world-class products.", verificationStatus: "VERIFIED", rating: 4.5, totalReviews: 128, website: "#", logoUrl: null, _count: { jobs: 12 } },
  { id: "2", companyName: "FinEdge Solutions", industry: "Finance", companySize: "51-200", city: "Mumbai", state: "Maharashtra", description: "Fintech startup revolutionizing digital payments.", verificationStatus: "VERIFIED", rating: 4.2, totalReviews: 64, website: "#", logoUrl: null, _count: { jobs: 5 } },
  { id: "3", companyName: "EduVerse", industry: "Education", companySize: "11-50", city: "Pune", state: "Maharashtra", description: "EdTech company making quality education accessible.", verificationStatus: "VERIFIED", rating: 4.7, totalReviews: 89, website: "#", logoUrl: null, _count: { jobs: 8 } },
  { id: "4", companyName: "CloudNine Systems", industry: "Technology", companySize: "501-1000", city: "Hyderabad", state: "Telangana", description: "Enterprise cloud infrastructure and DevOps solutions.", verificationStatus: "VERIFIED", rating: 4.3, totalReviews: 201, website: "#", logoUrl: null, _count: { jobs: 23 } },
  { id: "5", companyName: "HealthPulse", industry: "Healthcare", companySize: "51-200", city: "Chennai", state: "Tamil Nadu", description: "Digital healthcare platform connecting patients to doctors.", verificationStatus: "VERIFIED", rating: 4.6, totalReviews: 45, website: "#", logoUrl: null, _count: { jobs: 6 } },
  { id: "6", companyName: "ShopNow Inc.", industry: "E-Commerce", companySize: "1001+", city: "Delhi", state: "Delhi", description: "India's fastest growing e-commerce marketplace.", verificationStatus: "VERIFIED", rating: 3.9, totalReviews: 312, website: "#", logoUrl: null, _count: { jobs: 31 } },
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/api/companies");
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.companies?.length ? data.companies : DEMO_COMPANIES);
        } else {
          setCompanies(DEMO_COMPANIES);
        }
      } catch {
        setCompanies(DEMO_COMPANIES);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filtered = companies.filter(c => {
    const matchSearch = !search || c.companyName.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = industry === "All" || c.industry === industry;
    return matchSearch && matchIndustry;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Top <span className="gradient-text">Hiring Companies</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Discover <span className="text-emerald-400 font-bold">verified companies</span> actively hiring freshers & experienced talent across India.
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Industry Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                industry === ind
                  ? "bg-indigo-500 border-indigo-500 text-white"
                  : "border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-white"
              }`}
            >
              {ind}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-500 self-center">{filtered.length} companies</span>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={40} className="animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((company, i) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/companies/${company.id}`} className="block h-full">
                  <div className="glass-card group hover:border-indigo-500/40 transition-all h-full flex flex-col">
                    {/* Company Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-xl shrink-0">
                        {company.companyName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-white text-base truncate group-hover:text-indigo-300 transition-colors">
                            {company.companyName}
                          </h3>
                          {company.verificationStatus === "VERIFIED" && (
                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          {company.city && <span className="flex items-center gap-1"><MapPin size={11} />{company.city}</span>}
                          {company.industry && <span className="text-indigo-400">• {company.industry}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">
                      {company.description || "A growing company with exciting opportunities."}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star size={13} className="fill-current" />
                        <span className="font-bold">{company.rating.toFixed(1)}</span>
                        <span className="text-slate-500">({company.totalReviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Users size={13} />
                        <span>{company.companySize || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Building2 size={13} />
                        <span>{company._count?.jobs ?? 0} Jobs</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
