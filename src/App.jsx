import React, { useState, useEffect } from "react";
import { 
  getFirebaseAuth,
  syncUserProfileDoc,
  listenToNotifications, 
  logoutUser 
} from "./utils/firebaseService";
import { onAuthStateChanged } from "firebase/auth";
import AuthPortal from "./components/AuthPortal";
import OnboardingQuiz from "./components/OnboardingQuiz";
import HomeFeed from "./components/HomeFeed";
import ChatScreen from "./components/ChatScreen";
import SchemeRecommender from "./components/SchemeRecommender";
import ChecklistScreen from "./components/ChecklistScreen";
import ReportIssueScreen from "./components/ReportIssueScreen";
import TrackingScreen from "./components/TrackingScreen";
import RewardsScreen from "./components/RewardsScreen";
import TransparencyFeed from "./components/TransparencyFeed";
import OfficialDashboard from "./components/OfficialDashboard";
// SettingsPanel UI removed
import NotificationPanel from "./components/NotificationPanel";
import DocumentVault from "./components/DocumentVault";

import { 
  Sparkles, 
  Eye, 
  MessageSquare, 
  Search, 
  ClipboardCheck, 
  Camera, 
  Layers, 
  CheckSquare,
  Award,
  Building,
  Home,
  LogOut,
  Bell,
  Menu,
  X,
  FolderOpen
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  
  // Accessibility state
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("normal"); // normal, large, xl

  // Modals & panels
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [targetSchemeId, setTargetSchemeId] = useState(null);

  // Mobile sidebar menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication State Monitor
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const profile = await syncUserProfileDoc(firebaseUser);
            setUser(profile);
            if (profile && profile.language) {
              setSelectedLanguage(profile.language);
            }
          } catch (error) {
            console.error("Failed to sync user profile", error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoadingUser(false);
      });
      return () => unsubscribe();
    } else {
      // Simulator mode fallback
      const mockSessionStr = localStorage.getItem("sahayak_mock_session");
      if (mockSessionStr) {
        try {
          const mockSession = JSON.parse(mockSessionStr);
          setUser(mockSession);
          if (mockSession && mockSession.language) {
            setSelectedLanguage(mockSession.language);
          }
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoadingUser(false);
    }
  }, []);

  // Listen to notifications
  useEffect(() => {
    if (!user || !user.uid) return;
    const unsubscribe = listenToNotifications(user.uid, (list) => {
      setNotifications(list);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Sync font size
  useEffect(() => {
    const html = document.documentElement;
    if (fontSize === "large") {
      html.style.fontSize = "18px";
    } else if (fontSize === "xl") {
      html.style.fontSize = "20px";
    } else {
      html.style.fontSize = "16px";
    }
  }, [fontSize]);

  // Sync dark mode
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    if (userData.language) setSelectedLanguage(userData.language);
  };

  const handleOnboardingComplete = (userData) => {
    setUser(userData);
    setActiveTab("feed");
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setActiveTab("feed");
    window.location.reload();
  };

  const handleNavigateToSchemeChecklist = (schemeId) => {
    setTargetSchemeId(schemeId);
    setActiveTab("checklist");
  };

  // Notification counts
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  if (loadingUser) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FAF7F2] space-y-3">
        <div className="w-10 h-10 border-4 border-saffron border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 font-serif">Configuring Secure Citizen Connection...</p>
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    return (
      <AuthPortal 
        onAuthSuccess={handleAuthSuccess} 
        selectedLang={selectedLanguage} 
      />
    );
  }

  // Profile Incomplete
  if (user && !user.onboarded) {
    return (
      <OnboardingQuiz 
        user={user} 
        onOnboardingComplete={handleOnboardingComplete} 
      />
    );
  }

  // Priority 2: Sidebar collapses at md breakpoint (768px) instead of lg breakpoint (1024px)
  const navItems = [
    { id: "feed", label: "Home Feed", icon: <Home className="w-4 h-4" /> },
    { id: "chat", label: "Multilingual Chat", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "finder", label: "Scheme Finder", icon: <Search className="w-4 h-4" /> },
    { id: "checklist", label: "Checklists", icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: "vault", label: "Document Vault", icon: <FolderOpen className="w-4 h-4" /> }, // Priority 3 Flagship Feature
    { id: "report", label: "Report Issue", icon: <Camera className="w-4 h-4" /> },
    { id: "tracker", label: "Track Reports", icon: <CheckSquare className="w-4 h-4" /> },
    { id: "rewards", label: "Civic Perks", icon: <Award className="w-4 h-4" /> },
    { id: "transparency", label: "Transparency Feed", icon: <Layers className="w-4 h-4" /> },
    { id: "admin", label: "Admin Portal", icon: <Building className="w-4 h-4" /> }
  ];

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[#FAF7F2]">
      <canvas id="confetti-canvas"></canvas>

      {/* ----------------- DESKTOP SIDEBAR (collapses on <768px / md) ----------------- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-5 justify-between shrink-0 h-full relative z-30">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setActiveTab("feed")}>
            <span className="text-2xl">🤝</span>
            <div>
              <h1 className="text-lg font-bold font-serif text-gray-900 tracking-tight leading-none">Sahayak</h1>
              <span className="text-[9px] text-saffron-dark font-semibold font-serif uppercase tracking-wide">AI Civic Companion</span>
            </div>
          </div>

          {/* User Profile Info */}
          <div className="p-4 bg-orange-50 bg-opacity-40 border border-orange-100 rounded-2xl space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl select-none">👤</span>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-gray-800 text-xs truncate">{user.displayName}</h4>
                <span className="text-[10px] text-gray-400 block font-medium truncate">{user.email || "Guest User"}</span>
              </div>
            </div>
            
            {/* Points bar */}
            <div 
              onClick={() => setActiveTab("rewards")}
              className="mt-1 flex items-center justify-between p-2 bg-white rounded-xl border border-orange-100 hover:border-saffron hover:shadow-sm cursor-pointer select-none transition"
            >
              <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-saffron" /> Points
              </span>
              <span className="text-xs font-bold text-saffron-dark">{user.civicPoints !== undefined ? user.civicPoints : (user.points || 0)} Pts</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 font-sans text-xs font-bold text-gray-600">
            {navItems.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition ${
                    isSelected 
                      ? "bg-orange-50 text-saffron-dark border-l-4 border-saffron shadow-sm" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Logout */}
        <div className="pt-4 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-red-50 text-red-600 font-bold text-xs flex items-center gap-3 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ----------------- MOBILE TOP BAR (visible on <768px / md) ----------------- */}
      <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 shrink-0 flex justify-between items-center z-30 shadow-sm relative">
        <div className="flex items-center gap-2" onClick={() => setActiveTab("feed")}>
          <span className="text-xl">🤝</span>
          <h1 className="text-base font-bold font-serif text-gray-900 tracking-tight leading-none">Sahayak</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-xl border border-gray-200 hover:border-saffron text-gray-500 hover:text-saffron transition shadow-sm bg-white"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-saffron text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationPanel 
                notifications={notifications} 
                onClose={() => setShowNotifications(false)} 
              />
            )}
          </div>

          {/* Menu Trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl border border-gray-200 hover:border-saffron text-gray-500 hover:text-saffron transition shadow-sm bg-white"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-100 p-4 shadow-xl z-50 flex flex-col gap-1 font-sans text-xs font-bold text-gray-600 animate-fade-in">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 ${
                  activeTab === item.id ? "bg-orange-50 text-saffron" : "hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left p-3 rounded-xl hover:bg-red-50 text-red-600 flex items-center gap-3 mt-2 border-t pt-3"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* ----------------- MAIN PORTAL BODY ----------------- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Desktop Top Header Control Bar */}
        <header className="hidden md:flex justify-between items-center bg-white border-b border-gray-100 py-3.5 px-8 shrink-0 relative z-20">
          <h2 className="font-serif font-bold text-gray-800 text-lg capitalize tracking-tight select-none">
            {activeTab === "vault" ? "Document Vault" : activeTab.replace("-", " ")}
          </h2>

          <div className="flex items-center gap-4">
            {/* Accessibility scale */}
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 font-sans">
              <span className="mr-1 hidden xl:inline">Text Size:</span>
              <button 
                onClick={() => setFontSize("normal")} 
                className={`px-2 py-0.5 rounded font-bold border transition ${fontSize === "normal" ? "bg-saffron text-white border-saffron" : "bg-white text-gray-400 border-gray-200 hover:border-saffron"}`}
              >
                A
              </button>
              <button 
                onClick={() => setFontSize("large")} 
                className={`px-2 py-0.5 rounded font-bold border transition ${fontSize === "large" ? "bg-saffron text-white border-saffron" : "bg-white text-gray-400 border-gray-200 hover:border-saffron"}`}
              >
                A+
              </button>
              <button 
                onClick={() => setFontSize("xl")} 
                className={`px-2 py-0.5 rounded font-bold border transition ${fontSize === "xl" ? "bg-saffron text-white border-saffron" : "bg-white text-gray-400 border-gray-200 hover:border-saffron"}`}
              >
                A++
              </button>
            </div>

            <span className="border-l border-gray-100 h-4"></span>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold transition flex items-center gap-1 ${
                darkMode 
                  ? "bg-slate-800 text-white border-slate-700" 
                  : "bg-white text-gray-500 border-gray-200 hover:border-saffron"
              }`}
              title="Toggle dark theme"
            >
              <Eye className="w-3.5 h-3.5" /> Dark Theme
            </button>

            <span className="border-l border-gray-100 h-4"></span>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl border border-gray-200 hover:border-saffron text-gray-500 hover:text-saffron transition shadow-sm bg-white relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-saffron text-white rounded-full flex items-center justify-center text-[8px] font-bold border border-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationPanel 
                  notifications={notifications} 
                  onClose={() => setShowNotifications(false)} 
                />
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#FAF7F2]">
          {activeTab === "feed" && (
            <HomeFeed 
              user={user}
              onNavigate={setActiveTab}
              onNavigateToScheme={handleNavigateToSchemeChecklist}
            />
          )}
          {activeTab === "chat" && (
            <ChatScreen 
              language={selectedLanguage} 
              onNavigateToScheme={handleNavigateToSchemeChecklist}
            />
          )}
          {activeTab === "finder" && (
            <SchemeRecommender 
              user={user}
              onUpdateUser={setUser}
              onNavigateToScheme={handleNavigateToSchemeChecklist}
            />
          )}
          {activeTab === "checklist" && (
            <ChecklistScreen defaultSchemeId={targetSchemeId} />
          )}
          {activeTab === "vault" && ( // Document Vault screen viewport
            <DocumentVault user={user} />
          )}
          {activeTab === "report" && (
            <ReportIssueScreen 
              user={user}
              onUpdateUser={setUser}
              onReportSuccess={() => setActiveTab("tracker")}
            />
          )}
          {activeTab === "tracker" && (
            <TrackingScreen user={user} />
          )}
          {activeTab === "rewards" && (
            <RewardsScreen user={user} onUpdateUser={setUser} />
          )}
          {activeTab === "transparency" && (
            <TransparencyFeed />
          )}
          {activeTab === "admin" && (
            <OfficialDashboard user={user} />
          )}
        </div>
      </div>

      {/* Mobile Bottom navigation bar (Sticky bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2.5 px-3 shadow-lg flex justify-around items-center z-40 text-[9px] font-bold text-gray-500 shrink-0">
        <button 
          onClick={() => setActiveTab("feed")}
          className={`flex flex-col items-center gap-1 transition ${activeTab === "feed" ? "text-saffron" : ""}`}
        >
          <Home className="w-4 h-4" /> Home
        </button>
        <button 
          onClick={() => setActiveTab("chat")}
          className={`flex flex-col items-center gap-1 transition ${activeTab === "chat" ? "text-saffron" : ""}`}
        >
          <MessageSquare className="w-4 h-4" /> Chat
        </button>
        <button 
          onClick={() => setActiveTab("report")}
          className={`flex flex-col items-center gap-1 transition ${activeTab === "report" ? "text-saffron" : ""}`}
        >
          <Camera className="w-4 h-4" /> Report
        </button>
        <button 
          onClick={() => setActiveTab("tracker")}
          className={`flex flex-col items-center gap-1 transition ${activeTab === "tracker" ? "text-saffron" : ""}`}
        >
          <CheckSquare className="w-4 h-4" /> Track
        </button>
        <button 
          onClick={() => setActiveTab("rewards")}
          className={`flex flex-col items-center gap-1 transition ${activeTab === "rewards" ? "text-saffron" : ""}`}
        >
          <Award className="w-4 h-4" /> Perks
        </button>
      </div>
    </div>
  );
}
