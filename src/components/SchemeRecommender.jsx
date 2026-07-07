import React, { useState, useEffect } from "react";
import { fetchSchemes, updateUserProfile } from "../utils/firebaseService";
import { Sparkles, ArrowRight, UserCheck, HelpCircle } from "lucide-react";

export default function SchemeRecommender({ user, onNavigateToScheme, onUpdateUser }) {
  const [occupation, setOccupation] = useState(user?.occupation || "");
  const [income, setIncome] = useState(user?.income || "");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [state, setState] = useState(user?.state || "Maharashtra");

  const [schemes, setSchemes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Load schemes
  useEffect(() => {
    fetchSchemes().then(data => setSchemes(data));
  }, []);

  // Set default form values if user changes
  useEffect(() => {
    if (user) {
      if (user.occupation) setOccupation(user.occupation);
      if (user.income) setIncome(user.income);
      if (user.age) setAge(user.age);
      if (user.gender) setGender(user.gender);
      if (user.state) setState(user.state);
    }
  }, [user]);

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Save to user profile in database
    const profile = {
      occupation,
      income: Number(income),
      age: Number(age),
      gender,
      state
    };
    
    const updatedUser = await updateUserProfile(user.uid, profile);
    if (updatedUser) {
      onUpdateUser(updatedUser);
    }

    // Run matching rules on local grounding data
    setTimeout(() => {
      const matches = [];
      const userIncome = Number(income);
      const userAge = Number(age);

      schemes.forEach(scheme => {
        let score = 0;

        // Rule for PM-KISAN
        if (scheme.id === "pm-kisan") {
          if (occupation === "Farmer") score += 3;
        }

        // Rule for AB-PMJAY (Health Insurance)
        if (scheme.id === "ab-pmjay") {
          if (userIncome && userIncome <= 250000) score += 2;
          if (occupation === "Laborer" || occupation === "Unemployed") score += 1;
        }

        // Rule for PMAY-G (Housing)
        if (scheme.id === "pmay-g") {
          if (userIncome && userIncome <= 180000) score += 2;
          if (occupation === "Laborer" || occupation === "Farmer") score += 1;
        }

        // Rule for APY (Pension)
        if (scheme.id === "apy") {
          if (userAge >= 18 && userAge <= 40) score += 2;
          if (occupation === "Unorganised Sector" || occupation === "Laborer" || occupation === "Farmer") score += 1;
        }

        // Rule for PMUY (Ujjwala Gas)
        if (scheme.id === "pmuy") {
          if (gender === "Female") score += 2;
          if (userIncome && userIncome <= 150000) score += 1;
        }

        if (score >= 2) {
          matches.push({ ...scheme, matchScore: score });
        }
      });

      // Sort by score
      matches.sort((a, b) => b.matchScore - a.matchScore);
      setRecommendations(matches);
      setQuizSubmitted(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-2">
      <div className="text-center">
        <h2 className="text-3xl font-semibold font-serif text-gray-900">
          🎯 Smart Scheme Finder
        </h2>
        <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto font-sans">
          Answer a few quick questions to discover welfare schemes and public services 
          personalized to your demographics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Form panel */}
        <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-gray-800 text-lg flex items-center gap-2 border-b border-gray-50 pb-2.5">
            <UserCheck className="w-5 h-5 text-saffron" /> Your Profile
          </h3>

          <form onSubmit={handleRecommend} className="space-y-4 font-sans text-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Occupation</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
              >
                <option value="">Select Occupation...</option>
                <option value="Farmer">Farmer / Agriculture</option>
                <option value="Laborer">Daily Wage Laborer</option>
                <option value="Unorganised Sector">Unorganised sector worker</option>
                <option value="Salaried">Salaried / Private employee</option>
                <option value="Business">Business owner / Self-employed</option>
                <option value="Retired">Retired / Senior Citizen</option>
                <option value="Unemployed">Unemployed / Homemaker</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
              >
                <option value="">Select Gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Age (Years)</label>
              <input
                type="number"
                placeholder="e.g. 28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min="1"
                max="120"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Annual Household Income (₹)</label>
              <input
                type="number"
                placeholder="e.g. 150000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">State of Residence</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
              >
                <option value="Maharashtra">Maharashtra</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-saffron text-white rounded-xl font-semibold hover:bg-saffron-dark transition shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  Find Matching Schemes
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results panel */}
        <div className="md:col-span-2 space-y-4">
          {!quizSubmitted ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[350px]">
              <div className="w-16 h-16 bg-orange-50 text-saffron rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-semibold text-lg text-gray-800">Pending Profile Input</h4>
              <p className="text-gray-500 text-sm max-w-sm mt-2">
                Fill in the questionnaire on the left to analyze matching central & state government schemes.
              </p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[350px]">
              <h4 className="font-serif font-semibold text-lg text-gray-800">No Direct Matches Found</h4>
              <p className="text-gray-500 text-sm max-w-sm mt-2">
                We couldn't find precise matches for the demographics entered. Try adjusting the income range or occupation.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-serif font-bold text-gray-800 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-saffron" /> Recommended Schemes For You
              </h3>

              <div className="space-y-4">
                {recommendations.map((scheme) => (
                  <div 
                    key={scheme.id}
                    className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-saffron hover:shadow-md transition duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          High Match
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {scheme.officialLink ? "Central Gov Initiative" : "State Initiative"}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 font-serif text-base">
                        {scheme.name}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 max-w-xl">
                        {scheme.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigateToScheme(scheme.id)}
                      className="px-4 py-2 bg-gradient-to-r from-saffron to-saffron-dark text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow-sm shrink-0 flex items-center gap-1.5"
                    >
                      Check Documents
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
