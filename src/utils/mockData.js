export const GOVERNMENT_SCHEMES = [
  {
    id: "pm-kisan",
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    category: "Agriculture", // Priority 4 Category
    nativeNames: {
      en: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
      hi: "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
      mr: "पंतप्रधान किसान सन्मान निधी (PM-KISAN)",
      te: "ప్రధానమంత్రి కిసాన్ సమ్మాన్ నిధి (PM-KISAN)",
      ta: "பிரதம மந்திரி கிசான் சம்மான் நிதி (PM-KISAN)",
      kn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ (PM-KISAN)"
    },
    description: "An initiative by the Government of India that provides up to ₹6,000 per year in three equal installments of ₹2,000 directly into the bank accounts of all landholding farmer families, offering them income support for agricultural inputs and domestic needs.",
    eligibility: {
      occupation: "Farmer",
      maxIncome: null,
      minAge: 18,
      states: ["All"],
      criteria: "Landholding farmer families with cultivable land holdings in their names. Excludes institutional landholders and family members holding constitutional posts or paying income tax."
    },
    documents: [
      { id: "aadhaar", name: "Aadhaar Card", required: true },
      { id: "land_record", name: "Land Ownership Documents (Khatauni/Patta)", required: true },
      { id: "bank_passbook", name: "Bank Account Passbook (linked with Aadhaar)", required: true },
      { id: "photo", name: "Passport Size Photograph", required: false }
    ],
    officialLink: "https://pmkisan.gov.in"
  },
  {
    id: "ab-pmjay",
    name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
    category: "Health", // Priority 4 Category
    nativeNames: {
      en: "Ayushman Bharat PM Jan Arogya Yojana (AB-PMJAY)",
      hi: "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना (AB-PMJAY)",
      mr: "आयुष्मान भारत पंतप्रधान जन आरोग्य योजना (AB-PMJAY)",
      te: "ఆయుష్మాన్ భారత్ ప్రధానమంత్రి జన ఆరోగ్య యోజన (AB-PMJAY)",
      ta: "ஆயுஷ்மான் பாரத் பிரதம மந்திரி ஜன ஆரோக்கிய யோஜனா (AB-PMJAY)",
      kn: "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಪ್ರಧಾನ ಮಂತ್ರಿ जन आरोग्य ಯೋಜನೆ (AB-PMJAY)"
    },
    description: "The largest health assurance scheme in the world, providing a health cover of ₹5 Lakh per family per year for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families.",
    eligibility: {
      occupation: "Any",
      maxIncome: 250000,
      minAge: 0,
      states: ["All"],
      criteria: "Families listed in the SECC-2011 (Socio-Economic Caste Census) database under deprivation criteria, or holding a valid BPL/Ration Card. Includes laborers, ragpickers, domestic workers, and rural households."
    },
    documents: [
      { id: "aadhaar", name: "Aadhaar Card of all family members", required: true },
      { id: "ration_card", name: "Ration Card (BPL or Priority Household)", required: true },
      { id: "income_cert", name: "Income Certificate (proving annual income < ₹2.5 Lakh)", required: true },
      { id: "address_proof", name: "Address Proof (Voter ID/Electricity Bill)", required: false }
    ],
    officialLink: "https://pmjay.gov.in"
  },
  {
    id: "pmay-g",
    name: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
    category: "Construction/Housing", // Priority 4 Category
    nativeNames: {
      en: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
      hi: "प्रधानमंत्री आवास योजना - ग्रामीण (PMAY-G)",
      mr: "पंतप्रधान आवास योजना - ग्रामीण (PMAY-G)",
      te: "ప్రధానమంత్రి ఆవాస్ యోజన - గ్రామీణ (PMAY-G)",
      ta: "பிரதம மந்திரி அவாஸ் யோஜனா - கிராமப்புறம் (PMAY-G)",
      kn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ - ಗ್ರಾಮೀಣ (PMAY-G)"
    },
    description: "Provides financial assistance of ₹1.2 Lakh in plains and ₹1.3 Lakh in hilly, difficult areas and Integrated Action Plan (IAP) districts for construction of a permanent, hygienic pucca house for rural homeless or families living in dilapidated houses.",
    eligibility: {
      occupation: "Any / Rural Worker",
      maxIncome: 180000,
      minAge: 18,
      states: ["All"],
      criteria: "Homeless households, families living in houses with zero, one or two rooms with kutcha walls and kutcha roof in rural areas."
    },
    documents: [
      { id: "aadhaar", name: "Aadhaar Card", required: true },
      { id: "bank_passbook", name: "Bank Account Details", required: true },
      { id: "mgnrega_card", name: "MGNREGA Job Card Number", required: true },
      { id: "land_proof", name: "Land Ownership / House Site Document", required: true },
      { id: "swachh_bharat", name: "Swachh Bharat Mission (SBM) registration number", required: false }
    ],
    officialLink: "https://pmayg.nic.in"
  },
  {
    id: "apy",
    name: "Atal Pension Yojana (APY)",
    category: "Employment", // Priority 4 Category
    nativeNames: {
      en: "Atal Pension Yojana (APY)",
      hi: "अटल पेंशन योजना (APY)",
      mr: "अटल पेन्शन योजना (APY)",
      te: "అటల్ పెన్షన్ యోజన (APY)",
      ta: "அடல் பென்ஷன் யோஜனா (APY)",
      kn: "ಅಟಲ್ ಪಿಂಚಣಿ ಯೋಜನೆ (APY)"
    },
    description: "A pension scheme targeted towards the unorganised sector workers, offering a guaranteed minimum pension of ₹1,000 to ₹5,000 per month after attaining the age of 60 years, depending on the contributions made starting between the age of 18 and 40.",
    eligibility: {
      occupation: "Unorganised Sector",
      maxIncome: null,
      minAge: 18,
      maxAge: 40,
      states: ["All"],
      criteria: "Any citizen of India between 18 and 40 years of age having a savings bank account and not being a member of any social security scheme or paying income tax."
    },
    documents: [
      { id: "aadhaar", name: "Aadhaar Card", required: true },
      { id: "savings_bank", name: "Savings Bank Account details (with IFSC)", required: true },
      { id: "mobile", name: "Active Mobile Number", required: true },
      { id: "consent_form", name: "Auto-Debit Consent Form", required: true }
    ],
    officialLink: "https://www.npscra.nsdl.co.in"
  },
  {
    id: "pmuy",
    name: "Pradhan Mantri Ujjwala Yojana (PMUY)",
    category: "Loans", // Priority 4 Category
    nativeNames: {
      en: "Pradhan Mantri Ujjwala Yojana (PMUY)",
      hi: "प्रधानमंत्री उज्ज्वला योजना (PMUY)",
      mr: "पंतप्रधान उज्ज्वला योजना (PMUY)",
      te: "ప్రధానమంత్రి ఉజ్వల యోజన (PMUY)",
      ta: "பிரதம மந்திரி உஜ்வாலா யோஜனா (PMUY)",
      kn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಉಜ್ವಲ ಯೋಜನೆ (PMUY)"
    },
    description: "Launched to safeguard the health of women and children by providing clean cooking fuel (LPG connections) to poor households, offering financial support of ₹1,600 per connection to women from BPL families.",
    eligibility: {
      occupation: "Any / Rural Woman",
      maxIncome: 150000,
      minAge: 18,
      gender: "Female",
      states: ["All"],
      criteria: "Adult woman belonging to a poor household (BPL, SC/ST, forest dwellers, most backward classes, tea tribe, etc.) which does not have an active LPG connection."
    },
    documents: [
      { id: "aadhaar_applicant", name: "Aadhaar Card of Applicant (Woman)", required: true },
      { id: "aadhaar_family", name: "Aadhaar Card of all adult family members", required: true },
      { id: "ration_card_bpl", name: "BPL Ration Card or State Govt Certificate", required: true },
      { id: "bank_passbook", name: "Bank Account Passbook (Jan Dhan or Savings)", required: true },
      { id: "kyc_form", name: "PMUY KYC Application Form", required: true }
    ],
    officialLink: "https://www.pmuy.gov.in"
  }
];

export const DEPARTMENTS = {
  Sanitation: {
    officer: "Ramesh Kumar",
    contact: "+91 98765 43210",
    designation: "Chief Sanitation Inspector",
    ward: "Ward 12 (Central)"
  },
  "Roads/PWD": {
    officer: "Sneha Patil",
    contact: "+91 98765 43211",
    designation: "Assistant Executive Engineer (PWD)",
    ward: "Ward 12 (Central)"
  },
  Electricity: {
    officer: "Amit Sharma",
    contact: "+91 98765 43212",
    designation: "Sub-Divisional Engineer (MSEDCL)",
    ward: "Ward 12 (Central)"
  },
  Water: {
    officer: "Priya Iyer",
    contact: "+91 98765 43213",
    designation: "Water Supply Superintendent",
    ward: "Ward 12 (Central)"
  },
  "Public Health": {
    officer: "Dr. Suresh Nair",
    contact: "+91 98765 43214",
    designation: "Medical Officer of Health",
    ward: "Ward 12 (Central)"
  }
};

export const REWARDS_PERKS = [
  {
    id: "partner-shop",
    title: "10% off at Local Organic Mandi",
    cost: 100,
    icon: "ShoppingBag",
    description: "Get 10% discount on vegetables and groceries at our partnered local farmer cooperative outlet."
  },
  {
    id: "priority-badge",
    title: "Priority Certification Badge",
    cost: 200,
    icon: "Award",
    description: "Fast-track processing for one local municipal certificate (Birth, Caste, or Residence)."
  },
  {
    id: "sports-complex",
    title: "Free Sports Complex Entry",
    cost: 150,
    icon: "Activity",
    description: "1-month pass to the municipal swimming pool and sports stadium facilities."
  },
  {
    id: "fast-track-verify",
    title: "Zero-Fee Fast-Track Verification",
    cost: 300,
    icon: "ShieldAlert",
    description: "Waive verification fees on land record copy processing or house plan submissions."
  }
];

export const MOCK_LEADERBOARD = [
  { rank: 1, name: "Rajesh Mohanty", points: 850, reports: 17, avatar: "👨" },
  { rank: 2, name: "Kavita S. Rao", points: 700, reports: 14, avatar: "👩" },
  { rank: 3, name: "Vikram Adiga", points: 650, reports: 13, avatar: "👨" },
  { rank: 4, name: "Sunita Deshmukh", points: 500, reports: 10, avatar: "👩" },
  { rank: 5, name: "Arjun Paul", points: 450, reports: 9, avatar: "👨" }
];

export const MOCK_TRANSPARENCY_STATS = {
  resolvedThisMonth: 342,
  avgResolutionDays: 4,
  totalReported: 1845,
  satisfactionRate: 94.2,
  departmentBreakdown: [
    { name: "Sanitation", resolved: 145, active: 12 },
    { name: "Roads/PWD", resolved: 98, active: 24 },
    { name: "Electricity", resolved: 54, active: 5 },
    { name: "Water", resolved: 45, active: 8 }
  ],
  recentPublicComplaints: [
    { id: "c-101", issue_type: "Pothole", severity: "High", department: "Roads/PWD", status: "Resolved", ward: "Ward 4", timeAgo: "2 hours ago" },
    { id: "c-102", issue_type: "Garbage Pile", severity: "Medium", department: "Sanitation", status: "In Progress", ward: "Ward 12", timeAgo: "4 hours ago" },
    { id: "c-103", issue_type: "Broken Streetlight", severity: "Low", department: "Electricity", status: "Submitted", ward: "Ward 7", timeAgo: "1 day ago" },
    { id: "c-104", issue_type: "Water Pipe Leak", severity: "High", department: "Water", status: "Resolved", ward: "Ward 12", timeAgo: "2 days ago" }
  ]
};

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" }
];
