import React from "react";
import { LANGUAGES } from "../utils/mockData";
import { ShieldCheck, MessageSquare, ClipboardCheck, Sparkles } from "lucide-react";

export default function LandingHero({ selectedLang, onSelectLang, onStart, loadingUser }) {
  
  const translations = {
    en: {
      title: "Sahayak",
      tagline: "Your AI-Powered Civic Companion",
      subText: "Empowering citizens with multilingual assistance, secure issue reporting, and proactive welfare scheme discovery.",
      startBtn: "Get Started",
      features: "Core Features",
      feature1: "Multilingual AI Support",
      feature2: "Private Issue Reporting",
      feature3: "Civic Point Rewards"
    },
    hi: {
      title: "सहायक",
      tagline: "आपका एआई-संचालित नागरिक साथी",
      subText: "बहुभाषी सहायता, सुरक्षित समस्या रिपोर्टिंग और कल्याणकारी योजनाओं की खोज के साथ नागरिकों को सशक्त बनाना।",
      startBtn: "शुरू करें",
      features: "मुख्य विशेषताएं",
      feature1: "बहुभाषी एआई सहायता",
      feature2: "सुरक्षित शिकायत पंजीकरण",
      feature3: "नागरिक पुरस्कार प्रणाली"
    },
    mr: {
      title: "सहायक",
      tagline: "आपला एआय-आधारित नागरी सहकारी",
      subText: "नागरिकांना बहुभाषिक सहाय्य, सुरक्षित तक्रार नोंदणी आणि शासकीय लोककल्याणकारी योजनांचा लाभ मिळवून देण्यास सक्षम व्यासपीठ.",
      startBtn: "सुरू करा",
      features: "मुख्य वैशिष्ट्ये",
      feature1: "बहुभाषिक एआय सहाय्य",
      feature2: "सुरक्षित तक्रार नोंदणी",
      feature3: "नागरी पुरस्कार प्रणाली"
    },
    te: {
      title: "సహాయక్",
      tagline: "మీ AI-ఆధారిత పౌర సహచరుడు",
      subText: "బహుభాషా సహాయం, సురక్షితమైన సమస్యల నివేదిక మరియు సంక్షేమ పథకాలను సులభంగా తెలుసుకోవడం ద్వారా పౌరులను శక్తివంతం చేయడం.",
      startBtn: "ప్రారంభించండి",
      features: "ప్రధాన ఫీచర్లు",
      feature1: "బహుభాషా AI సహాయం",
      feature2: "సురక్షిత ఫిర్యాదు నివేదిక",
      feature3: "పౌర పాయింట్లు & బహుమతులు"
    },
    ta: {
      title: "சகாயக்",
      tagline: "உங்கள் AI-ஆற்றல் கொண்ட குடிமைத் தோழன்",
      subText: "பல்மொழி உதவி, பாதுகாப்பான குறை தீர்க்கும் பதிவு மற்றும் மக்கள் நலத்திட்டங்களை கண்டறிவதில் குடிமக்களை மேம்படுத்துதல்.",
      startBtn: "தொடங்கவும்",
      features: "முக்கிய அம்சங்கள்",
      feature1: "பல்மொழி AI உதவி",
      feature2: "பாதுகாப்பான குறை பதிவு",
      feature3: "குடிமை புள்ளிகள் & வெகுமதி"
    },
    kn: {
      title: "ಸಹಾಯಕ್",
      tagline: "ನಿಮ್ಮ AI-ಚಾಲಿತ ನಾಗರಿಕ ಒಡನಾಡಿ",
      subText: "ಬಹುಭಾಷಾ ನೆರವು, ಸುರಕ್ಷಿತ ದೂರು ಸಲ್ಲಿಕೆ ಮತ್ತು ಜನಕಲ್ಯಾಣ ಯೋಜನೆಗಳ ತ್ವರಿತ ಶೋಧನೆಯೊಂದಿಗೆ ನಾಗರಿಕರ ಸಬಲೀಕರಣ.",
      startBtn: "ಪ್ರಾರಂಭಿಸಿ",
      features: "ಮುಖ್ಯ ವೈಶಿಷ್ಟ್ಯಗಳು",
      feature1: "ಬಹುಭಾಷಾ AI ಸಹಾಯ",
      feature2: "ಸುರಕ್ಷಿತ ದೂರು ಸಲ್ಲಿಕೆ",
      feature3: "ನಾಗರಿಕ ಪಾಯಿಂಟ್ಸ್ ಮತ್ತು ಬಹುಮಾನ"
    }
  };

  const t = translations[selectedLang] || translations.en;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8 text-center max-w-4xl mx-auto px-4">
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 bg-opacity-70 border border-orange-200 text-orange-800 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
        <Sparkles className="w-3.5 h-3.5" /> Hackathon Demo
      </div>

      {/* Main Title */}
      <h1 className="text-6xl md:text-7xl font-bold font-serif text-gray-900 tracking-tight mb-3">
        {t.title}
      </h1>
      
      {/* Tagline */}
      <p className="text-xl md:text-2xl font-serif text-saffron-dark font-medium mb-6">
        {t.tagline}
      </p>

      {/* Description */}
      <p className="text-gray-600 text-md md:text-lg max-w-2xl mb-8 leading-relaxed font-sans">
        {t.subText}
      </p>

      {/* Native Language Selector Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm w-full max-w-lg mb-10">
        <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider mb-3">
          Select Communication Language / भाषा निवडा / भाषा चुनें
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => onSelectLang(lang.code)}
                className={`py-2 px-3 rounded-xl border text-sm font-medium transition duration-200 flex flex-col items-center justify-center ${
                  isSelected
                    ? "bg-saffron text-white border-saffron shadow-sm"
                    : "bg-white border-gray-200 text-gray-700 hover:border-saffron hover:bg-orange-50 bg-opacity-40"
                }`}
              >
                <span className="text-xs text-gray-400 font-normal block mb-0.5" style={{ color: isSelected ? '#FFEEDB' : '#9CA3AF' }}>
                  {lang.label}
                </span>
                <span className="text-base font-semibold">{lang.native}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onStart}
        disabled={loadingUser}
        className="px-10 py-4 bg-saffron text-white hover:bg-saffron-dark rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-3 disabled:opacity-50"
      >
        {loadingUser ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Connecting...
          </>
        ) : (
          <>
            {t.startBtn}
            <span className="text-xl">➔</span>
          </>
        )}
      </button>

      {/* Core features listing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left w-full">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-orange-50 text-saffron">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold font-serif text-gray-800 text-md">{t.feature1}</h4>
            <p className="text-xs text-gray-500 mt-1">
              Ask civic Qs, get cited government scheme details in your native language.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-teal-50 text-mint">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold font-serif text-gray-800 text-md">{t.feature2}</h4>
            <p className="text-xs text-gray-500 mt-1">
              Upload photos with EXIF metadata stripped. Dynamic vision routing.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-teal-50 text-mint">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold font-serif text-gray-800 text-md">{t.feature3}</h4>
            <p className="text-xs text-gray-500 mt-1">
              Earn redeemable tokens by filing verified public complaint reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
