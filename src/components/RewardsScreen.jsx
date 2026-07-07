import React, { useState, useEffect } from "react";
import { REWARDS_PERKS } from "../utils/mockData";
import { fetchLeaderboard, updateUserPoints } from "../utils/firebaseService";
import { Award, ShoppingBag, Activity, ShieldAlert, Sparkles, Trophy, Check } from "lucide-react";
import confetti from "canvas-confetti";

export default function RewardsScreen({ user, onUpdateUser }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [redeemedPerk, setRedeemedPerk] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch points safely
  const civicPoints = user.civicPoints !== undefined ? user.civicPoints : (user.points || 0);

  useEffect(() => {
    fetchLeaderboard().then(data => setLeaderboard(data));
  }, [civicPoints]);

  const handleRedeem = async (perk) => {
    if (civicPoints < perk.cost) {
      alert("Insufficient points. Complete more citizen reports to earn civic points!");
      return;
    }

    setLoading(true);
    try {
      // Deduct points in Firestore/Mock db
      const newPoints = await updateUserPoints(user.uid, -perk.cost);
      
      // Update local state with key civicPoints
      onUpdateUser({ ...user, civicPoints: newPoints });

      // Celebratory animation
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 }
      });

      setRedeemedPerk(perk);
      setTimeout(() => setRedeemedPerk(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getPerkIcon = (iconName) => {
    switch (iconName) {
      case "ShoppingBag":
        return <ShoppingBag className="w-5 h-5 text-saffron" />;
      case "Award":
        return <Award className="w-5 h-5 text-saffron" />;
      case "Activity":
        return <Activity className="w-5 h-5 text-saffron" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-saffron" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-2 font-sans text-sm relative">
      
      {/* Redeemed overlay alert */}
      {redeemedPerk && (
        <div className="fixed bottom-10 right-10 bg-emerald-800 text-white p-5 rounded-2xl border border-emerald-700 shadow-xl z-50 flex items-center gap-4 animate-fade-in max-w-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-700 border border-emerald-600 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Reward Redeemed!</h4>
            <p className="text-[10px] text-emerald-200 mt-0.5">
              Code <strong>SHYK-{Math.floor(1000 + Math.random() * 9000)}</strong> generated. Show this at counter.
            </p>
          </div>
        </div>
      )}

      {/* Hero Points Card */}
      <div className="bg-gradient-to-r from-saffron to-saffron-dark p-6 rounded-2xl text-white shadow-md flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs font-semibold uppercase tracking-wider text-orange-100">
            <Sparkles className="w-4 h-4" /> Civic Points Balance
          </div>
          <h3 className="text-4xl font-bold tracking-tight">
            {civicPoints} <span className="text-xl font-normal text-orange-200">Points</span>
          </h3>
          <p className="text-xs text-orange-100 max-w-md leading-relaxed">
            Points are earned by submitting verified municipal issues. Keep our city clean and organized!
          </p>
        </div>

        <div className="px-6 py-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl text-center shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-orange-100 block">Contributor Rank</span>
          <span className="text-xl font-bold font-serif mt-1 block">🏆 Civic Guardian</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Perks Grid */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-serif font-bold text-gray-800 text-lg flex items-center gap-2">
            🎁 Redeemable Perks & Coupons
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REWARDS_PERKS.map((perk) => {
              const canAfford = civicPoints >= perk.cost;
              return (
                <div 
                  key={perk.id}
                  className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-full space-y-4 hover:shadow-md transition duration-300"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 bg-orange-50 rounded-xl shrink-0">
                        {getPerkIcon(perk.icon)}
                      </div>
                      <span className="text-xs font-bold text-saffron-dark bg-orange-50 px-2 py-0.5 rounded-full">
                        {perk.cost} Pts
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-800 font-serif text-sm">
                      {perk.title}
                    </h4>

                    <p className="text-xs text-gray-500 leading-relaxed">
                      {perk.description}
                    </p>
                  </div>

                  <button
                    disabled={!canAfford || loading}
                    onClick={() => handleRedeem(perk)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold shadow-sm transition ${
                      canAfford 
                        ? "bg-saffron text-white hover:bg-saffron-dark" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed border"
                    }`}
                  >
                    {!canAfford ? "Locked" : "Redeem Reward"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Sidebar */}
        <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-gray-800 text-lg flex items-center gap-2 border-b border-gray-50 pb-2.5">
            <Trophy className="w-5 h-5 text-saffron" /> Top Civic Contributors
          </h3>

          <div className="space-y-3 font-sans text-xs">
            {leaderboard.map((leader) => {
              const isCurrentUser = leader.name === user.displayName || leader.rank === 6;
              return (
                <div 
                  key={leader.rank}
                  className={`p-3 rounded-xl border flex items-center justify-between transition duration-200 ${
                    isCurrentUser 
                      ? "bg-orange-50 border-orange-200 font-semibold" 
                      : "bg-white border-gray-100 hover:border-orange-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      leader.rank === 1 
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : leader.rank === 2
                        ? "bg-slate-100 text-slate-800 border border-slate-300"
                        : leader.rank === 3
                        ? "bg-orange-100 text-orange-800 border border-orange-200"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {leader.rank}
                    </span>
                    
                    <span className="text-base select-none shrink-0">{leader.avatar}</span>
                    <span className="font-bold text-gray-800 truncate max-w-[100px]">
                      {leader.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block font-bold text-gray-900">{leader.points} pts</span>
                    <span className="text-[9px] text-gray-400 block">{leader.reports} Reports</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
