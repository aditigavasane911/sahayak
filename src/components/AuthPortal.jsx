import React, { useState } from "react";
import { registerWithEmail, loginWithEmail, loginWithGoogle, loginWithApple, loginAsGuest } from "../utils/firebaseService";
import { Mail, Lock, User, Sparkles, AlertTriangle, ArrowRight, UserCheck, ArrowLeft } from "lucide-react";

export default function AuthPortal({ onAuthSuccess, selectedLang, initialScreen, onBack }) {
  const [isSignUp, setIsSignUp] = useState(initialScreen === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const t = {
    en: {
      title: "Welcome to Sahayak Portal",
      desc: "Sign in to securely access personalized scheme recommendations, report issues, and track municipal updates.",
      email: "Email Address",
      pwd: "Password",
      name: "Your Name",
      loginBtn: "Sign In",
      signUpBtn: "Create Account",
      guestBtn: "Continue as Guest / Anonymous",
      googleBtn: "Continue with Google",
      appleBtn: "Continue with Apple",
      toggleRegister: "Don't have an account? Sign Up",
      toggleLogin: "Already have an account? Sign In",
      divider: "or continue with"
    },
    hi: {
      title: "सहायक पोर्टल में आपका स्वागत है",
      desc: "व्यक्तिगत सरकारी योजनाओं की सिफारिशें प्राप्त करने, मुद्दों की रिपोर्ट करने और अपडेट ट्रैक करने के लिए साइन इन करें।",
      email: "ईमेल पता",
      pwd: "पासवर्ड",
      name: "आपका नाम",
      loginBtn: "साइन इन करें",
      signUpBtn: "खाता बनाएं",
      guestBtn: "अतिथि के रूप में जारी रखें (बिना लॉगिन)",
      googleBtn: "गूगल के साथ जारी रखें",
      appleBtn: "एप्पल के साथ जारी रखें",
      toggleRegister: "खाता नहीं है? साइन अप करें",
      toggleLogin: "पहले से खाता है? साइन इन करें",
      divider: "या इनके साथ जारी रखें"
    },
    mr: {
      title: "सहायक पोर्टलवर आपले स्वागत आहे",
      desc: "शासकीय योजनांचा लाभ मिळवण्यासाठी, तक्रार नोंदवण्यासाठी आणि अपडेट्स ट्रॅक करण्यासाठी साइन इन करा.",
      email: "ईमेल पत्ता",
      pwd: "पासवर्ड",
      name: "आपले नाव",
      loginBtn: "साइन इन करा",
      signUpBtn: "खाते तयार करा",
      guestBtn: "अतिथी म्हणून सुरू ठेवा (लॉगिनशिवाय)",
      googleBtn: "गुगलने सुरू ठेवा",
      appleBtn: "Apple ने सुरू ठेवा",
      toggleRegister: "खाते नाही का? साइन अप करा",
      toggleLogin: "आधीच खाते आहे? साइन इन करा",
      divider: "किंवा याद्वारे सुरू ठेवा"
    }
  };

  const l = t[selectedLang] || t.en;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let userData;
      if (isSignUp) {
        if (!displayName.trim()) throw new Error("Please enter your name.");
        userData = await registerWithEmail(email, password, displayName);
      } else {
        userData = await loginWithEmail(email, password);
      }
      onAuthSuccess(userData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const userData = await loginAsGuest();
      onAuthSuccess(userData);
    } catch (err) {
      setError("Guest login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const userData = await loginWithGoogle();
      onAuthSuccess(userData);
    } catch (err) {
      setError("Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const userData = await loginWithApple();
      onAuthSuccess(userData);
    } catch (err) {
      setError("Apple Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#FAF7F2]">
      {/* Mesh gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200 opacity-20 filter blur-[80px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-100 opacity-30 filter blur-[80px]"></div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl w-full max-w-md p-8 relative z-10 space-y-6">
        {/* Back Button */}
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="text-3xl justify-center flex select-none">🤝</div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 leading-tight">
            {l.title}
          </h2>
          <p className="text-xs text-gray-400 font-sans px-4">
            {l.desc}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-start gap-2 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-500">{l.name}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-500">{l.email}</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="citizen@sahayak.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-500">{l.pwd}</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-saffron text-white font-bold rounded-xl hover:bg-saffron-dark transition shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {isSignUp ? l.signUpBtn : l.loginBtn}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest Fallback Button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 hover:border-gray-300 transition flex items-center justify-center gap-2 text-xs font-sans shadow-sm"
        >
          <UserCheck className="w-4 h-4 text-gray-500" />
          {l.guestBtn}
        </button>

        {/* Divider */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-wider font-bold">
          <span className="h-[1px] bg-gray-100 flex-1"></span>
          <span className="px-3">{l.divider}</span>
          <span className="h-[1px] bg-gray-100 flex-1"></span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-2 text-xs font-sans">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="py-2.5 border border-gray-200 rounded-xl hover:border-saffron hover:bg-orange-50 bg-opacity-30 transition flex items-center justify-center gap-2 font-semibold text-gray-700"
          >
            <span className="text-sm select-none">🌐</span> Google
          </button>

          <button
            onClick={handleAppleSignIn}
            disabled={loading}
            className="py-2.5 border border-gray-200 rounded-xl hover:border-saffron hover:bg-orange-50 bg-opacity-30 transition flex items-center justify-center gap-2 font-semibold text-gray-700"
          >
            <span className="text-sm select-none">🍎</span> Apple
          </button>
        </div>

        {/* Toggle */}
        <div className="text-center pt-2">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-saffron-dark hover:underline font-semibold"
          >
            {isSignUp ? l.toggleLogin : l.toggleRegister}
          </button>
        </div>
      </div>
    </div>
  );
}
