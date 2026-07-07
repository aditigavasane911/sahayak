import React, { useState, useEffect } from "react";
import { listenToComplaints } from "../utils/firebaseService";
import { 
  FileText, 
  MapPin, 
  User, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Inbox
} from "lucide-react";

export default function TrackingScreen({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Connect Firestore dynamic real-time updates
    const unsubscribe = listenToComplaints(user.uid, (data) => {
      setComplaints(data);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "In Progress":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-2 font-sans text-sm">
      <div className="text-center">
        <h2 className="text-3xl font-semibold font-serif text-gray-900">
          📋 Track Your Complaints
        </h2>
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
          See live status updates of your reported issues. Real-time updates from 
          municipal officers trigger immediately.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-8 h-8 border-3 border-saffron border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400">Syncing with Firestore database...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h4 className="font-serif font-semibold text-lg text-gray-800">No Complaints Found</h4>
          <p className="text-gray-500 text-xs max-w-sm mt-1">
            You haven't filed any complaints yet. Go to the "Report Issue" tab to report municipal concerns!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {complaints.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div 
                key={item.id} 
                className="bg-white border border-gray-100 hover:border-saffron hover:shadow-md rounded-2xl overflow-hidden shadow-sm transition duration-300 flex flex-col h-full"
              >
                {/* Photo container */}
                <div className="relative h-44 bg-gray-50 flex justify-center items-center overflow-hidden shrink-0">
                  <img 
                    src={item.imageUrl} 
                    alt={item.issueType} 
                    className="object-cover w-full h-full"
                  />
                  
                  {/* Status Overlay */}
                  <span className={`absolute top-3 right-3 px-3 py-1 border text-xs font-bold rounded-full shadow-sm uppercase ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                {/* Complaint Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Filed {dateStr}
                      </span>
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono uppercase">
                        ID: {item.id.slice(-6)}
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-800 text-base font-serif">
                      {item.issueType}
                    </h4>

                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {item.description || "No detailed description provided by reporter."}
                    </p>
                  </div>

                  {/* Officer Contact Box */}
                  <div className="bg-orange-50 bg-opacity-40 border border-orange-100 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-saffron-dark tracking-wider uppercase border-b border-orange-100 pb-1 mb-1">
                      <span>Routing & Resolution</span>
                      <span className={`px-1.5 py-0.2 rounded text-[8px] uppercase ${
                        item.severity === "High" 
                          ? "bg-red-50 text-red-700" 
                          : item.severity === "Medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {item.severity} severity
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="line-clamp-1">{item.officerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{item.officerContact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline status tracker */}
                  <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-50 pt-3 mt-1.5">
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Database Synced
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Ward 12 Administration
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
