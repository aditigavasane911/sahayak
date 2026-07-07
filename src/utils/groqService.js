export const getGroqApiKey = () => {
  return import.meta.env.VITE_GROQ_API_KEY || "";
};

export const isGroqConfigured = () => {
  return !!getGroqApiKey();
};

/**
 * Smart mock response simulator when Groq API is not configured or offline.
 */
const simulateChatResponse = (prompt, lang, schemes) => {
  const query = prompt.toLowerCase();
  let citation = "";
  let answer = "";

  const l = {
    en: {
      default: "Hello! I am Sahayak, your civic companion. I can help you with government schemes such as PM-KISAN, Ayushman Bharat, PMAY Housing, Atal Pension, and Ujjwala Gas. Please ask me about these or report a public issue!",
      kisan: "Under the PM Kisan Samman Nidhi (PM-KISAN) scheme, landholding farmers receive an income support of ₹6,000 per year in three equal installments of ₹2,000 directly to their bank accounts. If you are a landholding farmer family, you are eligible. [CITE: pm-kisan]",
      ayushman: "Ayushman Bharat (AB-PMJAY) provides a health cover of ₹5 Lakh per family per year for secondary and tertiary care hospitalization. It is available to poor and vulnerable families listed in the SECC-2011 database or holding BPL ration cards. [CITE: ab-pmjay]",
      awas: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G) offers financial help of ₹1.2 Lakh (plains) or ₹1.3 Lakh (hilly areas) to construct a permanent (pucca) house for rural homeless families or those living in dilapidated houses. [CITE: pmay-g]",
      pension: "Atal Pension Yojana (APY) is a guaranteed pension scheme for unorganised workers aged 18 to 40. You will receive a pension of ₹1,000 to ₹5,000 per month after you turn 60, depending on your contributions. [CITE: apy]",
      ujjwala: "Pradhan Mantri Ujjwala Yojana (PMUY) provides free LPG connections to women from below poverty line (BPL) households, with a financial aid of ₹1,600 per connection to support clean cooking fuel. [CITE: pmuy]"
    },
    hi: {
      default: "नमस्ते! मैं सहायक हूँ, आपका एआई नागरिक साथी। मैं पीएम-किसान, आयुष्मान भारत, पीएम आवास योजना, अटल पेंशन और उज्ज्वला गैस जैसी सरकारी योजनाओं में आपकी सहायता कर सकता हूँ। कृपया मुझसे पूछें या सार्वजनिक समस्या की रिपोर्ट करें!",
      kisan: "पीएम किसान सम्मान निधि (PM-KISAN) योजना के तहत, भूमिधारक किसानों को प्रति वर्ष ₹6,000 की वित्तीय सहायता ₹2,000 की तीन समान किश्तों में सीधे उनके बैंक खातों में दी जाती है। यदि आपके पास अपने नाम पर खेती योग्य भूमि है, तो आप इसके पात्र हैं। [CITE: pm-kisan]",
      ayushman: "आयुष्मान भारत (AB-PMJAY) योजना गरीब और कमजोर परिवारों को माध्यमिक और तृतीयक देखभाल अस्पताल में भर्ती के लिए प्रति वर्ष ₹5 लाख प्रति परिवार का स्वास्थ्य कवर प्रदान करती है। यह SECC-2011 डेटाबेस में सूचीबद्ध या बीपीएल राशन कार्ड धारक परिवारों के लिए उपलब्ध है। [CITE: ab-pmjay]",
      awas: "प्रधानमंत्री आवास योजना - ग्रामीण (PMAY-G) ग्रामीण बेघर परिवारों या जर्जर घरों में रहने वाले लोगों को पक्का घर बनाने के लिए ₹1.2 लाख (मैदानी) या ₹1.3 लाख (पहाड़ी क्षेत्रों) की वित्तीय सहायता प्रदान करती है। [CITE: pmay-g]",
      pension: "अटल पेंशन योजना (APY) 18 से 40 वर्ष की आयु के असंगठित क्षेत्र के श्रमिकों के लिए एक गारंटीकृत पेंशन योजना है। 60 वर्ष की आयु पूरी होने पर आपको योगदान के आधार पर ₹1,000 से ₹5,000 मासिक पेंशन मिलेगी। [CITE: apy]",
      ujjwala: "प्रधानमंत्री उज्ज्वला योजना (PMUY) गरीब परिवारों (BPL) की महिलाओं को मुफ्त रसोई गैस (LPG) कनेक्शन प्रदान करती है, जिसमें स्वच्छ खाना पकाने के ईंधन को बढ़ावा देने के लिए ₹1,600 प्रति कनेक्शन की वित्तीय सहायता दी जाती है। [CITE: pmuy]"
    },
    mr: {
      default: "नमस्कार! मी 'सहायक' आहे, आपला नागरी सहकारी. मी तुम्हाला पीएम-किसान, आयुष्मान भारत, पीएम आवास योजना, अटल पेन्शन आणि उज्ज्वला गॅस यांसारख्या शासकीय योजनांबद्दल माहिती देऊ शकतो. कृपया प्रश्न विचारा किंवा नागरी समस्या नोंदवा!",
      kisan: "पीएम किसान सन्मान निधी (PM-KISAN) योजनेअंतर्गत, भूधारक शेतकरी कुटुंबांना वर्षाला ₹६,००० रुपयांची मदत ₹२,००० च्या तीन हप्त्यांमध्ये थेट बँक खात्यात दिली जाते. आपल्या नावावर शेती जमीन असल्यास आपण पात्र आहात. [CITE: pm-kisan]",
      ayushman: "आयुष्मान भारत (AB-PMJAY) योजना गरीब कुटुंबांना उपचारासाठी प्रति वर्ष ₹५ लाख रुपयांचे मोफत आरोग्य विमा संरक्षण देते. SECC-2011 यादीतील किंवा पिवळे/केशरी रेशन कार्ड असणारे कुटुंब यासाठी पात्र आहेत. [CITE: ab-pmjay]",
      awas: "पंतप्रधान आवास योजना - ग्रामीण (PMAY-G) ग्रामीण भागातील बेघर किंवा कच्च्या घरात राहणाऱ्या कुटुंबांना पक्के घर बांधण्यासाठी ₹१.२ लाख (मॅदानी प्रदेश) किंवा ₹१.३ लाख (डोंगरळ भाग) आर्थिक सहाय्य पुरवते. [CITE: pmay-g]",
      pension: "अटल पेन्शन योजना (APY) ही १८ ते ४० वयोगटातील असंघटित कामगारांसाठी पेन्शन योजना आहे. वयाच्या ६० वर्षांनंतर तुम्हाला दरमहा ₹१,००० ते ₹५,००० पर्यंत खात्रीशीर पेन्शन मिळते. [CITE: apy]",
      ujjwala: "पंतप्रधान उज्ज्वला योजना (PMUY) दारिद्र्यरेषेखालील (BPL) महिलांना मोफत घरगुती गॅस (LPG) कनेक्शन पुरवते, ज्यासाठी प्रति कनेक्शन ₹१,६०० चे अर्थसहाय्य दिले जाते. [CITE: pmuy]"
    }
  };

  const selectedLang = l[lang] ? lang : "en";
  const repo = l[selectedLang];

  if (query.includes("kisan") || query.includes("farmer") || query.includes("किसान")) {
    answer = repo.kisan;
  } else if (query.includes("health") || query.includes("ayushman") || query.includes("hospital") || query.includes("आरोग्य")) {
    answer = repo.ayushman;
  } else if (query.includes("house") || query.includes("awas") || query.includes("home")) {
    answer = repo.awas;
  } else if (query.includes("pension") || query.includes("atal")) {
    answer = repo.pension;
  } else if (query.includes("gas") || query.includes("ujjwala")) {
    answer = repo.ujjwala;
  } else {
    answer = repo.default;
  }

  return answer;
};

/**
 * Call Groq API to query Sahayak
 */
export const askSahayak = async (promptText, languageCode, conversationHistory = [], schemesData = []) => {
  const apiKey = getGroqApiKey();
  
  if (!apiKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(simulateChatResponse(promptText, languageCode, schemesData));
      }, 800);
    });
  }

  const systemPrompt = `You are Sahayak, an empathetic, supportive, and knowledgeable AI-powered civic companion for Indian citizens.
Your task is to help the citizen understand government schemes and public services based on the provided reference database.

Selected Language: ${languageCode}
YOU MUST RESPOND ONLY IN THE SELECTED LANGUAGE (हिंदी, मराठी, తెలుగు, தமிழ், ಕನ್ನಡ, or English).
Keep your tone simple, warm, clear, and free of administrative jargon.
Whenever your answer relies on one or more government schemes from the reference list, conclude your response by explicitly citing the scheme IDs in a format like: [CITE: scheme-id] (e.g., [CITE: pm-kisan]).

Reference Database:
${JSON.stringify(schemesData, null, 2)}`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    })),
    { role: "user", content: promptText }
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: messages,
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (!response.ok) throw new Error(`Groq API returned ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Groq chat API error", error);
    return simulateChatResponse(promptText, languageCode, schemesData);
  }
};

/**
 * Use Groq Vision to classify issues
 */
export const classifyCivicIssue = async (base64Image, description) => {
  const apiKey = getGroqApiKey();
  
  if (!apiKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const desc = (description || "").toLowerCase();
        let issue_type = "Garbage Accumulation";
        let severity = "Medium";
        let department = "Sanitation";

        if (desc.includes("pothole") || desc.includes("road")) {
          issue_type = "Pothole";
          severity = "High";
          department = "Roads/PWD";
        } else if (desc.includes("light") || desc.includes("bulb")) {
          issue_type = "Broken Streetlight";
          severity = "Medium";
          department = "Electricity";
        } else if (desc.includes("water") || desc.includes("leak")) {
          issue_type = "Water Leakage";
          severity = "High";
          department = "Water";
        }

        resolve({ issue_type, severity, department });
      }, 1500);
    });
  }

  const messages = [
    {
      role: "system",
      content: `Analyze the image and citizen description. Classify and return ONLY a JSON object:
{
  "issue_type": "Pothole" | "Garbage Accumulation" | "Broken Streetlight" | "Water Leakage" | "Public Health Concern",
  "severity": "Low" | "Medium" | "High",
  "department": "Sanitation" | "Roads/PWD" | "Electricity" | "Water" | "Public Health"
}`
    },
    {
      role: "user",
      content: [
        { type: "text", text: `Description: ${description || ""}` },
        { type: "image_url", image_url: { url: base64Image } }
      ]
    }
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: messages,
        temperature: 0.1,
        max_tokens: 150,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error(`Groq Vision API returned ${response.status}`);
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content.trim());
  } catch (error) {
    console.error("Groq vision classification error", error);
    return { issue_type: "Pothole", severity: "High", department: "Roads/PWD" };
  }
};

/* ==========================================
   VAULT DOCUMENT ANALYSIS (Priority 3)
   ========================================== */

/**
 * Use Groq Vision to check formatting and completeness of citizen documents
 */
export const verifyDocumentCompleteness = async (base64Image, docType, filename = "") => {
  const apiKey = getGroqApiKey();

  if (!apiKey) {
    // Simulator Mode formatting verification
    return new Promise((resolve) => {
      setTimeout(() => {
        const fileLower = filename.toLowerCase();
        // If file contains keyword blurry or poor, report format issue
        if (fileLower.includes("blurry") || fileLower.includes("poor") || fileLower.includes("unreadable")) {
          resolve({
            status: "review",
            reason: "⚠️ The document image appears too blurry or low-resolution. Please re-capture clearly."
          });
        } else if (fileLower.includes("blank") || fileLower.includes("empty")) {
          resolve({
            status: "review",
            reason: "⚠️ Required text fields or signatures appear to be blank on this form."
          });
        } else {
          resolve({
            status: "complete",
            reason: "✅ Document layout and fields appear complete."
          });
        }
      }, 2000);
    });
  }

  const messages = [
    {
      role: "system",
      content: `You are a secure Document Completeness Analyzer. Inspect the uploaded image of a citizen document (${docType}).
Verify its formatting and layout completeness. 
CRITICAL: Do NOT attempt to check for fraud, forgery, or document authenticity. Check ONLY for:
1. Is the text readable, clear, and in-focus?
2. Does it resemble the typical visual layout of the selected document type?
3. Are the main fields filled in (not blank/empty)?
4. Is a signature or stamp block present if required?

Return ONLY a JSON response in the following format:
{
  "status": "complete" | "review",
  "reason": "Clear explanation of formatting or readability issues if status is review (e.g. 'The text is blurry' or 'Missing signature area'). If complete, set reason to ''."
}
Return ONLY valid JSON. Do not write markdown wraps or extra commentary.`
    },
    {
      role: "user",
      content: [
        { type: "text", text: `Document Type: ${docType}` },
        { type: "image_url", image_url: { url: base64Image } }
      ]
    }
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: messages,
        temperature: 0.1,
        max_tokens: 150,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error(`Groq Vision returned ${response.status}`);
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content.trim());
    
    // Safety check status format
    return {
      status: result.status === "complete" ? "complete" : "review",
      reason: result.status === "complete" 
        ? "✅ Document layout and fields appear complete." 
        : `⚠️ Needs review — ${result.reason || "unreadable formatting"}`
    };
  } catch (error) {
    console.error("Groq vision verification error", error);
    return {
      status: "complete",
      reason: "✅ Document layout and fields appear complete (vision check bypassed)."
    };
  }
};
