import React, { useState, useEffect } from "react";
import { fetchCommunityStats } from "../utils/firebaseService";
import { BarChart3, Clock, CheckCircle2, ShieldCheck, Heart, Radio } from "lucide-react";

export default function TransparencyFeed() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetches aggregate calculations from Firestore / mock database
    fetchCommunityStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-100 text-emerald-800";
      case "In Progress":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-2 font-sans text-sm">
      <div className="text-center">
        <h2 className="text-3xl font-semibold font-serif text-gray-900">
          📢 Public Transparency Feed
        </h2>
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
          Anonymized municipal metrics and live complaint tracking, promoting open 
          governance and administrative trust.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-8 h-8 border-3 border-saffron border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400">Loading aggregate stats...</p>
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Key Stat Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-fit mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-bold font-serif text-gray-800">{stats.resolvedThisMonth}</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Issues Resolved</p>
              <p className="text-[9px] text-gray-400 mt-0.5">This calendar month</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="p-3 bg-orange-50 text-saffron rounded-full w-fit mx-auto mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-bold font-serif text-gray-800">{stats.avgResolutionDays} Days</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Avg Resolution Speed</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Faster than national avg</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="p-3 bg-sky-50 text-sky-500 rounded-full w-fit mx-auto mb-2">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-bold font-serif text-gray-800">{stats.totalReported}</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Total Submissions</p>
              <p className="text-[9px] text-gray-400 mt-0.5">All wards aggregated</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="p-3 bg-red-50 text-red-500 rounded-full w-fit mx-auto mb-2">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-bold font-serif text-gray-800">{stats.satisfactionRate}%</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Public Trust Index</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Based on feedback polls</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Department Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-gray-800 text-base border-b border-gray-50 pb-2 flex items-center gap-1.5">
                📊 Department Distribution
              </h3>

              <div className="space-y-4">
                {stats.departmentBreakdown.map((dept, i) => {
                  const total = dept.resolved + dept.active;
                  const percent = Math.round((dept.resolved / total) * 100);
                  return (
                    <div key={i} className="space-y-1.5 font-sans">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>{dept.name}</span>
                        <span>{dept.resolved} / {total} Done</span>
                      </div>
                      
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-saffron h-2 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Public Live Feed */}
            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-gray-800 text-base border-b border-gray-50 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-saffron animate-pulse" /> Live Anonymized Reports
                </span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> PII Stripped
                </span>
              </h3>

              <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto pr-1">
                {stats.recentPublicComplaints.map((item, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center text-xs gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{item.issue_type || item.issueType}</span>
                        <span className="text-[9px] text-gray-400">({item.ward || "Ward 12"})</span>
                      </div>
                      <p className="text-[10px] text-gray-400">Routed to {item.department}</p>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span className="text-[9px] text-gray-400 block shrink-0">{item.timeAgo || "Just now"}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
