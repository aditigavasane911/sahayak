import React, { useState } from "react";
import { updateUserProfile } from "../utils/firebaseService";
import { Sparkles, ArrowRight, User, Award, ShieldCheck } from "lucide-react";

export default function OnboardingQuiz({ user, onOnboardingComplete }) {
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [state, setState] = useState("Maharashtra");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gender || !age || !state) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const profile = {
        gender,
        age: Number(age),
        state,
        civicPoints: 100, // Award 100 civicPoints on successful onboarding profile completion
        onboarded: true
      };

      const updatedUser = await updateUserProfile(user.uid, profile);
      onOnboardingComplete(updatedUser);
    } catch (e) {
      console.error(e);
      alert("Profile onboarding failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#FAF7F2]">
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-100 opacity-20 filter blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-50 opacity-30 filter blur-[80px]"></div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl w-full max-w-lg p-8 relative z-10 space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Quick Profile Setup
          </div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 leading-tight">
            Personalize Your Companion
          </h2>
          <p className="text-xs text-gray-400 font-sans max-w-sm mx-auto">
            We use these demographics to customize your AI responses and suggest matched government welfare schemes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          

          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-500">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
              >
                <option value="">Select Gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-500">Age (Years)</label>
              <input
                type="number"
                placeholder="e.g. 35"
                min="1"
                max="125"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* State */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-500">State of Residence</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
              >
                <option value="Maharashtra">Maharashtra</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>
          </div>

          {/* Privacy statement */}
          <div className="bg-emerald-50 bg-opacity-40 border border-emerald-100 p-3.5 rounded-xl space-y-1 text-emerald-800 text-[10px]">
            <span className="flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Data Privacy Safeguard
            </span>
            <p className="font-sans leading-relaxed text-gray-500">
              Your profile is stored securely in Firestore and is only referenced to ground local RAG prompts and filter matching welfare programs.
            </p>
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
                Unlock Sahayak Portal (+100 Points)
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
