import React, { useState, useEffect } from "react";
import { listenToComplaints, setComplaintStatus } from "../utils/firebaseService";
import { 
  Building2, 
  Map, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Eye, 
  Sliders
} from "lucide-react";

export default function OfficialDashboard({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    // Listen to ALL complaints in database for the administration dashboard view
    const unsubscribe = listenToComplaints(user.uid, (data) => {
      setComplaints(data);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const handleUpdateStatus = async (id, currentStatus) => {
    let nextStatus = "In Progress";
    if (currentStatus === "Submitted") {
      nextStatus = "In Progress";
    } else if (currentStatus === "In Progress") {
      nextStatus = "Resolved";
    } else {
      nextStatus = "Submitted";
    }

    setUpdatingId(id);
    try {
      // Updates in Firestore or Mock DB, which triggers real-time listen snapshots in citizen view!
      await setComplaintStatus(id, nextStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(false);
    }
  };

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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs font-semibold mb-2">
          <Building2 className="w-3.5 h-3.5" /> Official Dashboard Preview
        </div>
        <h2 className="text-3xl font-semibold font-serif text-gray-900">
          🏢 Administrator Resolution Portal
        </h2>
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
          Preview of the administrative dashboard. Update complaint states here to test the real-time 
          Firestore synchronization instantly!
        </p>
      </div>

      {/* Stats and Heatmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Ward Heatmap Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 md:col-span-2">
          <h3 className="font-serif font-bold text-gray-800 text-base flex items-center gap-1.5">
            <Map className="w-4 h-4 text-saffron" /> Ward-Level Complaint Heatmap
          </h3>
          
          <div className="bg-orange-50 bg-opacity-30 border border-orange-100 p-4 rounded-xl text-xs flex justify-between items-center text-orange-800 mb-2">
            <span>🔴 High Issue Densities flagged in red</span>
            <span className="font-semibold">Last updated: Just now</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5 pt-1">
            <div className="p-4 rounded-xl bg-red-100 border border-red-200 text-center font-bold">
              <span className="block text-red-800">Ward 1</span>
              <span className="text-[10px] text-red-600 block mt-1">24 Active</span>
            </div>
            <div className="p-4 rounded-xl bg-orange-100 border border-orange-200 text-center font-bold">
              <span className="block text-orange-800">Ward 2</span>
              <span className="text-[10px] text-orange-600 block mt-1">12 Active</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center font-bold">
              <span className="block text-emerald-800">Ward 3</span>
              <span className="text-[10px] text-emerald-600 block mt-1">2 Active</span>
            </div>
            <div className="p-4 rounded-xl bg-red-100 border border-red-200 text-center font-bold">
              <span className="block text-red-800">Ward 4</span>
              <span className="text-[10px] text-red-600 block mt-1">36 Active</span>
            </div>
            <div className="p-4 rounded-xl bg-orange-100 border border-orange-200 text-center font-bold">
              <span className="block text-orange-800">Ward 9</span>
              <span className="text-[10px] text-orange-600 block mt-1">15 Active</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center font-bold bg-opacity-40">
              <span className="block text-emerald-800">Ward 10</span>
              <span className="text-[10px] text-emerald-600 block mt-1">0 Active</span>
            </div>
            <div className="p-4 rounded-xl bg-orange-100 border border-orange-200 text-center font-bold bg-opacity-80">
              <span className="block text-orange-800">Ward 11</span>
              <span className="text-[10px] text-orange-600 block mt-1">8 Active</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center font-bold">
              <span className="block text-emerald-800">Ward 12</span>
              <span className="text-[10px] text-emerald-600 block mt-1">4 Active</span>
            </div>
          </div>
        </div>

        {/* Phase 2 Metrics Preview */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-gray-800 text-base flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-saffron" /> Administrative Controls
          </h3>

          <div className="space-y-3 font-sans text-xs">
            <div className="p-3 bg-gray-50 border rounded-xl space-y-1">
              <span className="font-bold text-gray-700 block">SLA Compliance Rate</span>
              <span className="text-lg font-bold text-emerald-600">89.4%</span>
              <span className="text-[9px] text-gray-400 block">Required SLA response: &lt; 24 Hrs</span>
            </div>
            <div className="p-3 bg-gray-50 border rounded-xl space-y-1">
              <span className="font-bold text-gray-700 block">Avg Inspection Dispatch</span>
              <span className="text-lg font-bold text-gray-800">2.1 Hours</span>
              <span className="text-[9px] text-gray-400 block">Includes camera site check</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive resolver simulator */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-gray-800 text-base border-b border-gray-50 pb-2">
          🛠️ Live Interactive Complaint Resolver (Developer Feature)
        </h3>
        
        <p className="text-xs text-gray-500">
          Clicking the "Simulate Status Step" buttons will update the status field in Firestore. 
          If you have the "Track Complaints" screen open in another tab or view, you will see it update in real-time.
        </p>

        {loading ? (
          <div className="py-8 flex justify-center items-center">
            <div className="w-6 h-6 border-2 border-saffron border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-center py-6 text-xs text-gray-400">No active complaints submitted to resolve.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5">ID</th>
                  <th className="py-2.5">Type</th>
                  <th className="py-2.5">Severity</th>
                  <th className="py-2.5">Current Status</th>
                  <th className="py-2.5 text-right">Developer Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {complaints.map((item) => (
                  <tr key={item.id} className="text-gray-700">
                    <td className="py-3 font-mono font-bold text-[10px]">#{item.id.slice(-6)}</td>
                    <td className="py-3 font-semibold">{item.issueType}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.severity === "High" 
                          ? "bg-red-50 text-red-700" 
                          : item.severity === "Medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleUpdateStatus(item.id, item.status)}
                        disabled={updatingId === item.id}
                        className="px-3.5 py-1.5 bg-saffron text-white rounded-lg hover:bg-saffron-dark transition text-[10px] font-semibold inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        {updatingId === item.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sliders className="w-3 h-3" />
                        )}
                        Simulate Status Step
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
