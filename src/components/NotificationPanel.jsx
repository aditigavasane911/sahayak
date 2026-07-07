import React from "react";
import { markNotificationRead } from "../utils/firebaseService";
import { Bell, Check, X, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";

export default function NotificationPanel({ notifications, onClose }) {
  
  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
  };

  const getIcon = (text) => {
    if (text.includes("Points") || text.includes("earned")) {
      return <Sparkles className="w-4 h-4 text-orange-500" />;
    }
    if (text.includes("filed") || text.includes("lodged")) {
      return <Check className="w-4 h-4 text-emerald-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-saffron" />;
  };

  return (
    <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden font-sans text-xs flex flex-col max-h-[400px]">
      
      {/* Header */}
      <div className="bg-orange-50 bg-opacity-60 px-4 py-3 border-b border-gray-100 flex justify-between items-center shrink-0">
        <h4 className="font-bold text-gray-800 font-serif flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-saffron" /> Notifications
        </h4>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 font-medium text-sm"
        >
          ✕
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No recent updates or alerts.
          </div>
        ) : (
          notifications.map((notif) => {
            const timeAgo = Math.round((Date.now() - notif.timestamp) / 60000); // minutes
            let timeStr = `${timeAgo}m ago`;
            if (timeAgo >= 60) {
              const hours = Math.round(timeAgo / 60);
              timeStr = hours === 1 ? "1 hour ago" : `${hours} hours ago`;
              if (hours >= 24) {
                timeStr = `${Math.round(hours / 24)} days ago`;
              }
            }

            return (
              <div 
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`p-4 flex items-start gap-3 transition cursor-pointer hover:bg-gray-50 ${
                  !notif.read ? "bg-orange-50 bg-opacity-20 font-semibold" : ""
                }`}
              >
                <div className="p-2 bg-white rounded-xl border shadow-sm shrink-0">
                  {getIcon(notif.text)}
                </div>
                
                <div className="space-y-1 flex-1">
                  <p className="text-gray-700 leading-relaxed text-[11px]">{notif.text}</p>
                  <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold">
                    <span>{timeStr}</span>
                    {!notif.read && (
                      <span className="text-saffron hover:underline">Mark read</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
