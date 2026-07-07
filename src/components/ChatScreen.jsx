import React, { useState, useRef, useEffect } from "react";
import { askSahayak } from "../utils/groqService";
import { fetchSchemes } from "../utils/firebaseService";
import { sanitizeInput } from "../utils/securityUtils";
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  BookOpen, 
  Info, 
  ShieldAlert,
  Sparkles
} from "lucide-react";

export default function ChatScreen({ language, onNavigateToScheme }) {
  const [messages, setMessages] = useState([
    {
      id: "initial",
      sender: "bot",
      text: getGreetingMessage(language),
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [sanitizationAlert, setSanitizationAlert] = useState(false);
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load schemes for grounding and matching citations
  useEffect(() => {
    fetchSchemes().then(data => setSchemes(data));
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Set up Speech Recognition (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = getSpeechLangCode(language);
      
      rec.onstart = () => setIsListening(true);
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? " " : "") + transcript);
      };
      rec.onerror = (err) => {
        console.error("Speech Recognition Error", err);
        setIsListening(false);
      };
      rec.onend = () => setIsListening(false);
      
      recognitionRef.current = rec;
    }
  }, [language]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please try Chrome or Edge.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel(); // Stop any speaking
        setSpeakingMsgId(null);
      }
      recognitionRef.current.start();
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const rawInput = input;
    setInput("");

    // Privacy & Security Check: Client-side dynamic Prompt Injection sanitization
    const { cleanedText, flagged } = sanitizeInput(rawInput);
    if (flagged) {
      setSanitizationAlert(true);
      setTimeout(() => setSanitizationAlert(false), 5000);
    }

    const userMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: cleanedText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // API request with scheme grounding data
      const botResponse = await askSahayak(
        cleanedText, 
        language, 
        messages.slice(-6), // context window of last 6 messages
        schemes
      );
      
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: botResponse,
        timestamp: Date.now()
      }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Web Speech Text-to-Speech (TTS) playback
  const handleToggleSpeak = (msgId, text) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    } else {
      window.speechSynthesis.cancel();
      
      // Strip markdown tags and citation bracket markers for cleaner pronunciation
      const speakText = text
        .replace(/\*\*([^*]+)\*\*/g, "$1") // strip bold
        .replace(/\[CITE:\s*([^\]]+)\]/g, ""); // strip citations

      const utterance = new SpeechSynthesisUtterance(speakText);
      utterance.lang = getSpeechLangCode(language);
      
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      
      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Helper to extract and format scheme citation links
  const renderMessageContent = (text) => {
    const citationRegex = /\[CITE:\s*([^\]]+)\]/g;
    
    // Split text by citations to render inline content or cards below
    const parts = text.split(citationRegex);
    const matches = [...text.matchAll(citationRegex)].map(m => m[1].trim());

    // Highlight text segments (e.g. bold markdown formatting)
    const renderStyledText = (segment) => {
      const boldRegex = /\*\*([^*]+)\*\*/g;
      const subparts = segment.split(boldRegex);
      return subparts.map((p, i) => {
        if (i % 2 === 1) return <strong key={i} className="font-semibold text-gray-900">{p}</strong>;
        return p;
      });
    };

    return (
      <div className="space-y-4 font-sans">
        <p className="leading-relaxed whitespace-pre-wrap">{renderStyledText(parts[0])}</p>
        
        {/* Render citation reference cards */}
        {matches.length > 0 && (
          <div className="mt-3 pt-3 border-t border-orange-100 flex flex-col gap-2">
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-saffron" /> Grounded References Cited
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matches.map((citeId, idx) => {
                const scheme = schemes.find(s => s.id === citeId);
                if (!scheme) return null;
                return (
                  <div 
                    key={idx} 
                    className="p-3 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl hover:border-saffron hover:shadow-sm transition cursor-pointer flex justify-between items-center group"
                    onClick={() => onNavigateToScheme(scheme.id)}
                  >
                    <div>
                      <h5 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-saffron transition">
                        {scheme.nativeNames[language] || scheme.name}
                      </h5>
                      <p className="text-[10px] text-gray-500 mt-0.5">Click for Document Checklist</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-saffron transition shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[75vh] bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
      {/* Header Info */}
      <div className="bg-orange-50 bg-opacity-60 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-gray-600 font-serif">
            Sahayak Multilingual Chatbot
          </span>
        </div>
        <div className="text-[10px] text-gray-400 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
          <Info className="w-3.5 h-3.5 text-saffron" /> Grounded to official schemes
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div 
              key={msg.id} 
              className={`flex items-start gap-2.5 max-w-[85%] ${
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              } animate-fade-in`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm select-none shrink-0 ${
                isUser ? "bg-saffron text-white" : "bg-orange-100"
              }`}>
                {isUser ? "👤" : "🤖"}
              </div>

              {/* Message bubble */}
              <div className={`p-4 rounded-2xl relative ${
                isUser 
                  ? "bg-saffron bg-opacity-10 text-gray-800 border border-orange-100 rounded-tr-none" 
                  : "bg-white border border-gray-100 rounded-tl-none shadow-sm"
              }`}>
                {isUser ? (
                  <p className="font-sans whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>
                ) : (
                  renderMessageContent(msg.text)
                )}

                {/* Speech Playback Trigger */}
                {!isUser && (
                  <button 
                    onClick={() => handleToggleSpeak(msg.id, msg.text)}
                    className={`absolute right-2 top-2 p-1.5 rounded-lg border hover:bg-gray-50 transition ${
                      speakingMsgId === msg.id 
                        ? "border-saffron bg-orange-50 text-saffron" 
                        : "border-gray-200 text-gray-400"
                    }`}
                    title="Text to Speech Playback"
                  >
                    {speakingMsgId === msg.id ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2.5 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm">
              🤖
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-saffron rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-saffron rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-saffron rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Sanitization overlay / alert banner */}
      {sanitizationAlert && (
        <div className="absolute bottom-16 left-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in shadow-md">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span>Security Alert: Attempted prompt injection override sanitized automatically.</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center">
        {/* Voice Dictation Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-3 rounded-xl border transition shrink-0 ${
            isListening 
              ? "border-red-500 bg-red-50 text-red-600 animate-pulse-voice" 
              : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-saffron"
          }`}
          title="Speak to dictate"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={isListening ? "Listening to speak..." : getPlaceholder(language)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-saffron text-sm"
          />
          <div className="absolute right-3 top-3.5 flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 bg-gray-50 border px-1.5 py-0.5 rounded cursor-help font-semibold" title="Strictly sanitizes inputs and blocks prompt injection to protect privacy">
              🛡️ Sanitized
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 bg-saffron text-white rounded-xl hover:bg-saffron-dark transition disabled:opacity-50 shrink-0 shadow-sm"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

// Helpers for native scripts translations and language settings
function getSpeechLangCode(lang) {
  const codes = {
    en: "en-IN",
    hi: "hi-IN",
    mr: "mr-IN",
    te: "te-IN",
    ta: "ta-IN",
    kn: "kn-IN"
  };
  return codes[lang] || "en-IN";
}

function getGreetingMessage(lang) {
  const greetings = {
    en: "Namaste! I am Sahayak, your AI Civic Companion. Ask me about government welfare schemes or state services. (Example: 'Tell me about PM-KISAN eligibility' or 'How can I get free gas connection?')",
    hi: "नमस्ते! मैं सहायक हूँ, आपका एआई नागरिक साथी। मुझसे सरकारी कल्याणकारी योजनाओं या राज्य की सेवाओं के बारे में पूछें। (उदाहरण: 'पीएम-किसान पात्रता के बारे में बताएं' या 'मुफ्त गैस कनेक्शन कैसे प्राप्त करें?')",
    mr: "नमस्कार! मी 'सहायक' आहे, आपला एआय नागरी सहकारी. शासकीय कल्याणकारी योजना किंवा राज्य सेवांबद्दल मला विचारा. (उदा: 'पीएम-किसान पात्रतेबद्दल सांगा' किंवा 'मोफत गॅस कनेक्शन कसे मिळवायचे?')",
    te: "నమస్తే! నేను సహాయక్, మీ AI పౌర సహచరుడిని. ప్రభుత్వ సంక్షేమ పథకాలు లేదా రాష్ట్ర సేవల గురించి నన్ను అడగండి. (ఉదాహరణ: 'PM-KISAN అర్హత గురించి చెప్పండి' లేదా 'ఉచిత గ్యాస్ కనెక్షన్ ఎలా పొందాలి?')",
    ta: "வணக்கம்! நான் சகாயக், உங்கள் AI குடிமைத் தோழன். அரசு நலத்திட்டங்கள் அல்லது மாநில சேவைகளைப் பற்றி என்னிடம் கேளுங்கள். (உதாரணம்: 'பிஎம்-கிசான் தகுதி பற்றி கூறுங்கள்' அல்லது 'இலவச கேஸ் இணைப்பு எவ்வாறு பெறுவது?')",
    kn: "ನಮಸ್ಕಾರ! ನಾನು ಸಹಾಯಕ್, ನಿಮ್ಮ ಎಐ ನಾಗರಿಕ ಒಡನಾಡಿ. ಸರ್ಕಾರಿ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು ಅಥವಾ ರಾಜ್ಯ ಸೇವೆಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ. (ಉದಾಹರಣೆಗೆ: 'ಪಿಎಂ-ಕಿಸಾನ್ ಅರ್ಹತೆಯ ಬಗ್ಗೆ ತಿಳಿಸಿ' ಅಥವಾ 'ಉಚಿತ ಅಡುಗೆ ಅನಿಲ ಸಂಪರ್ಕ ಪಡೆಯುವುದು ಹೇಗೆ?')"
  };
  return greetings[lang] || greetings.en;
}

function getPlaceholder(lang) {
  const placeholders = {
    en: "Type your query about schemes here...",
    hi: "योजनाओं के बारे में अपना प्रश्न यहाँ टाइप करें...",
    mr: "योजनांबद्दल आपला प्रश्न येथे टाईप करा...",
    te: "పథకాల గురించి మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...",
    ta: "திட்டங்களைப் பற்றிய உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...",
    kn: "ಯೋಜನೆಗಳ ಬಗ್ಗೆ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
  };
  return placeholders[lang] || placeholders.en;
}
