import React from "react";
import { GOVERNMENT_SCHEMES } from "../utils/mockData";
import { 
  Sparkles, 
  ArrowRight, 
  Megaphone, 
  CheckCircle, 
  MapPin, 
  Layers, 
  Award,
  ShieldCheck,
  TrendingUp,
  ExternalLink
} from "lucide-react";

export default function HomeFeed({ user, onNavigate, onNavigateToScheme }) {
  // Hardcoded latest government announcements
  const announcements = [
    {
      id: "a-1",
      tag: "Latest Scheme",
      title: "PM Ujjwala Yojana 2.0 Registration Commenced",
      desc: "Eligible BPL families can now apply for free LPG cooking connections directly from the Sahayak portal. Includes structural security guidelines.",
      date: "Today",
      schemeId: "pmuy"
    },
    {
      id: "a-2",
      tag: "Public Works",
      title: "Ward 12 Road Infrastructure Upliftment Schedule",
      desc: "Road repairs on Market Square and Link Road have been scheduled starting July 10th. Citizen Pothole complaints routed to Roads/PWD helped map priorities.",
      date: "Yesterday",
      dept: "Roads/PWD"
    },
    {
      id: "a-3",
      tag: "Health Update",
      title: "Ayushman Bharat Card Generation Drive in Central Ward",
      desc: "Visit the local municipal office on Wednesday between 10 AM to 4 PM for fast-track verification of priority cards. Bring Aadhaar and Ration Card.",
      date: "2 days ago",
      schemeId: "ab-pmjay"
    }
  ];

  // Recently resolved community issues
  const resolvedIssues = [
    {
      id: "r-1",
      type: "Garbage Accumulation",
      ward: "Ward 12 (Central)",
      time: "4 hours ago",
      officer: "Ramesh Kumar (Sanitation)",
      impact: "Cleaned community park gate pile"
    },
    {
      id: "r-2",
      type: "Water Pipe Leakage",
      ward: "Ward 4 (East)",
      time: "1 day ago",
      officer: "Priya Iyer (Water Supply)",
      impact: "Repaired main supply line junction"
    }
  ];

  return (
    <div className="space-y-8 font-sans text-sm pb-10">
      
      {/* Immersive Welcome Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-saffron p-8 rounded-3xl text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute right-[-10%] top-[-20%] w-[350px] h-[350px] bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white bg-opacity-10 border border-white border-opacity-20 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Civic Dashboard Active
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif tracking-tight">
            Namaste, {user?.displayName || "Citizen"}!
          </h2>
          <p className="text-xs text-orange-100 max-w-lg leading-relaxed">
            Welcome to Sahayak Civic Portal. Your demographic profile matches **3 active welfare schemes**. Explore alerts below.
          </p>
        </div>

        <div className="flex gap-3 relative z-10 shrink-0">
          <button
            onClick={() => onNavigate("chat")}
            className="px-5 py-3 bg-white text-saffron-dark font-bold rounded-2xl hover:bg-orange-50 transition shadow-sm flex items-center gap-2"
          >
            Ask AI Companion
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Announcements & Updates */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-serif font-bold text-gray-800 text-lg flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-saffron" /> Latest Government Updates & Services
          </h3>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div 
                key={ann.id}
                className="bg-white border border-gray-100 p-6 rounded-2xl hover:border-saffron hover:shadow-md transition duration-300 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-orange-100 text-saffron-dark font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {ann.tag}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">{ann.date}</span>
                </div>

                <h4 className="font-bold text-gray-900 font-serif text-base">
                  {ann.title}
                </h4>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {ann.desc}
                </p>

                {/* Quick actions for updates */}
                {ann.schemeId && (
                  <button
                    onClick={() => onNavigateToScheme(ann.schemeId)}
                    className="text-xs text-saffron-dark hover:text-saffron font-bold inline-flex items-center gap-1 group"
                  >
                    Check Eligibility & Checklist
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Wards stats & Quick Shortcuts */}
        <div className="space-y-6">
          
          {/* Quick shortcuts */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-gray-800 text-base">
              ⚡ Quick Services
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button 
                onClick={() => onNavigate("finder")}
                className="p-3 bg-gray-50 hover:bg-orange-50 border hover:border-orange-200 rounded-xl font-semibold text-gray-700 text-center transition"
              >
                🔍 Find Schemes
              </button>
              <button 
                onClick={() => onNavigate("report")}
                className="p-3 bg-gray-50 hover:bg-orange-50 border hover:border-orange-200 rounded-xl font-semibold text-gray-700 text-center transition"
              >
                📸 File Issue
              </button>
              <button 
                onClick={() => onNavigate("checklist")}
                className="p-3 bg-gray-50 hover:bg-orange-50 border hover:border-orange-200 rounded-xl font-semibold text-gray-700 text-center transition"
              >
                📋 Checklist
              </button>
              <button 
                onClick={() => onNavigate("tracker")}
                className="p-3 bg-gray-50 hover:bg-orange-50 border hover:border-orange-200 rounded-xl font-semibold text-gray-700 text-center transition"
              >
                📊 Track Reports
              </button>
            </div>
          </div>

          {/* Recently resolved timeline */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-gray-800 text-base flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Resolved in Community
            </h3>

            <div className="space-y-4 text-xs font-sans">
              {resolvedIssues.map((issue) => (
                <div key={issue.id} className="border-l-2 border-emerald-400 pl-3 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {issue.ward}</span>
                    <span>{issue.time}</span>
                  </div>
                  <h5 className="font-bold text-gray-800">{issue.type}</h5>
                  <p className="text-[10px] text-gray-500">{issue.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SLA badge info */}
          <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-100 p-5 rounded-2xl space-y-3">
            <h4 className="font-serif font-bold text-teal-800 text-sm flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> Official Guarantee
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              Under public service standards, all critical sanitation and water leaks are addressed within 
              <strong> 48 Hours</strong>. Track live tickets in the resolution panel.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
