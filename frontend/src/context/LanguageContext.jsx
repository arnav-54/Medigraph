import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', region: 'Global / All India' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'North / Central India' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'West Bengal / Tripura' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'Andhra Pradesh / Telangana' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu / Puducherry' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', region: 'Maharashtra' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', region: 'Gujarat' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'Kerala' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'Punjab' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'Odisha' },
];

export const TRANSLATIONS = {
  en: {
    brandName: 'MediGraph AI',
    brandTagline: 'Personal Health Intelligence & Report Tracker',
    languageName: 'English',
    changeLanguage: 'Language / भाषा',

    // Navigation
    navDashboard: 'Health Overview',
    navUpload: 'Upload Lab Report',
    navDocuments: 'My Medical Records',
    navTimeline: 'Health Timeline',
    navAnalytics: 'Biomarker Trends & Graphs',
    navAssistant: 'AI Health Assistant',
    navSummaries: 'Doctor Summary Report',
    navPrivacy: 'Privacy & Data Export',
    navDictionary: 'Lab Test Guide & Dictionary',

    // Common
    normal: 'Normal',
    elevated: 'Elevated / High',
    low: 'Low',
    critical: 'Critical Alert',
    verified: 'Verified',
    pending: 'Needs Review',
    refresh: 'Refresh',
    upload: 'Upload Report',
    download: 'Download',
    save: 'Save Changes',
    search: 'Search test or report...',
    viewDetails: 'View Details',
    consultDoctor: 'Always consult a licensed medical doctor for clinical advice.',
    learnMore: 'Learn About Test',

    // Login
    loginTitle: 'Welcome to MediGraph AI',
    loginSubtitle: 'Your trusted personal health document organizer and tracker.',
    enterDemo: 'Enter Instant Demo (Jane Doe)',
    demoDesc: 'Explore verified health records, 27 extracted lab tests, and live graphs instantly.',
    orSignIn: 'Or Sign In with Email',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    signInBtn: 'Sign In',
    needAccount: 'Need a new account?',
    createAccount: 'Create account',
    privacyFooter: 'HIPAA & GDPR Compliant · Local Encrypted Storage · Non-Diagnostic Intelligence',

    // Dashboard
    patientDossier: 'Patient Health Profile',
    verifiedRecord: 'Verified Health Record',
    vitalityScore: 'Overall Health Index',
    vitalityDesc: 'Calculated across all verified lab reports',
    statusMatrixTitle: 'Key Body Health Indicators',
    statusMatrixSubtitle: 'Latest readings across your primary health systems',
    criticalAlertTitle: 'Attention: Values Outside Safe Range',
    criticalAlertMessage: 'The following test readings are in an elevated or critical range. We recommend discussing them with your physician at your earliest convenience:',
    deltaVsBaseline: 'Change vs Previous:',
    viewAllTrends: 'Open All Trend Graphs →',
    recentReports: 'Recent Lab Reports',
    recentTimeline: 'Recent Medical Visits & Milestones',

    // Upload
    uploadTitle: 'Upload Medical Report',
    uploadSubtitle: 'Upload your lab reports (PDF, PNG, JPG) from any diagnostic lab (Dr Lal, Thyrocare, SRL, Apollo, Hospital, etc.).',
    dragDropText: 'Click to select report or drag and drop file here',
    supportedFormats: 'Supported formats: PDF, PNG, JPEG (Up to 15MB)',
    uploadButton: 'Extract & Analyze Report →',
    sampleButton: 'Load Sample Lab Report',
    howItWorksTitle: 'How It Works in 3 Simple Steps:',
    step1Title: '1. Select Your Report',
    step1Desc: 'Upload a PDF or clear picture of your blood test, thyroid panel, lipid check, or full checkup.',
    step2Title: '2. Automatic AI Reading',
    step2Desc: 'MediGraph automatically reads values, safe reference ranges, and test dates with 98%+ precision.',
    step3Title: '3. Lifetime Health Graph',
    step3Desc: 'Track your health trajectory over time and ask questions to the clinical assistant.',

    // Verification Deck
    reviewTitle: 'Verify Extracted Lab Readings',
    reviewSubtitle: 'Review the values read from your report before they are permanently added to your health graphs.',
    verifyAll: 'Verify All Records',
    confidenceScore: 'OCR Accuracy',
    referenceRange: 'Safe Reference Range',
    opticalConfidence: 'Optical Clarity',
    editReading: 'Edit Value',

    // Analytics
    analyticsTitle: 'Biomarker Trends & Trajectories',
    analyticsSubtitle: 'Compare your blood test results across multiple years to see if values are improving.',
    selectBiomarker: 'Select a Lab Test to Graph:',
    compareMode: 'Compare Two Biomarkers (e.g., HDL vs LDL)',
    normalBand: 'Green Shaded Zone = Healthy Reference Range',
    latestReading: 'Latest Reading',
    baselineReading: 'First Recorded Baseline',
    netTrajectory: 'Overall Trend Trajectory',

    // Assistant
    assistantTitle: 'AI Health Assistant',
    assistantSubtitle: 'Ask any questions about your lab results, diet, or doctor consultation in simple everyday words.',
    askPlaceholder: 'Ask a health question (e.g. "What does my high cholesterol mean?")...',
    send: 'Ask',
    suggestionsTitle: 'Common Questions to Ask:',
    suggestion1: 'What are my abnormal lab values?',
    suggestion2: 'What should I ask my doctor on my next visit?',
    suggestion3: 'Explain my Hemoglobin and Vitamin D in simple words.',
    suggestion4: 'What diet changes can help improve my lipid cholesterol?',
    citationsLabel: 'Verified Report Citations:',

    // Documents
    docsTitle: 'My Medical Records & Lab Reports',
    docsSubtitle: 'All your uploaded lab reports, blood panels, and checkup PDFs in one safe place.',
    searchDocs: 'Search reports by file name...',
    allStatus: 'All Statuses',
    docName: 'Report Name',
    uploadDate: 'Upload Date',
    pagesCount: 'Pages',
    extractedTests: 'Extracted Tests',
    docStatus: 'Status',
    docActions: 'Actions',
    inspectTests: 'Inspect Tests',

    // Summaries
    summariesTitle: 'Doctor-Ready Health Summaries',
    summariesSubtitle: 'Plain-language medical summary across all your tests to show your physician or family.',
    generateSummary: '+ Generate New Health Summary',
    generatingSummary: 'Analyzing medical trends and generating summary...',
    noSummariesYet: 'No summaries generated yet. Click "Generate New Health Summary" to synthesize your records.',
    saveSummary: 'Save Corrections',
    summaryDisclaimer: 'This summary is synthesized from your verified records to assist communication with your doctor.',

    // Privacy
    privacyTitle: 'Privacy, Consent & Data Ownership',
    privacySubtitle: 'You own 100% of your health data. Download your full medical archive or delete your data at any time.',
    patientProfile: 'Patient Profile Information',
    fullNameLabel: 'Full Legal Name',
    emailAddressLabel: 'Primary Email',
    accountRoleLabel: 'Account Role',
    storageEnvLabel: 'Storage Protection',
    localStorageMsg: 'Local Cryptographic Vault (Zero Third-Party Cloud Transit)',
    dataPortabilityTitle: 'Download Complete Health Archive (GDPR Art. 20)',
    dataPortabilityDesc: 'Download your entire medical record history including lab values, unit conversions, and dates in JSON format.',
    downloadBtn: 'Download Complete Health Archive',
    dangerZoneTitle: 'Danger Zone: Permanently Delete Account',
    dangerZoneDesc: 'Permanently deletes all your uploaded reports, extracted lab values, and account history from disk. This cannot be undone.',
    confirmPasswordLabel: 'Confirm Password to Authorize Deletion',
    deleteBtn: 'Permanently Delete Account & Medical Records',

    // Timeline
    timelineTitle: 'Chronological Health Journey',
    timelineSubtitle: 'A complete timeline of your lab tests, doctor consultations, and health milestones.'
  },

  hi: {
    brandName: 'MediGraph AI',
    brandTagline: 'आपका व्यक्तिगत स्वास्थ्य रिकॉर्ड व लैब रिपोर्ट ट्रैकर',
    languageName: 'हिन्दी',
    changeLanguage: 'भाषा चुनें (Language)',

    navDashboard: 'स्वास्थ्य अवलोकन',
    navUpload: 'रिपोर्ट अपलोड करें',
    navDocuments: 'मेरी मेडिकल रिपोर्ट्स',
    navTimeline: 'स्वास्थ्य टाइमलाइन',
    navAnalytics: 'ग्राफ व ट्रेंड्स',
    navAssistant: 'एआई स्वास्थ्य सहायक',
    navSummaries: 'डॉक्टर सारांश',
    navPrivacy: 'डेटा व गोपनीयता',
    navDictionary: 'लैब टेस्ट डिक्शनरी',

    normal: 'सामान्य (Normal)',
    elevated: 'बढ़ा हुआ (Elevated)',
    low: 'कम (Low)',
    critical: 'अति-आवश्यक चेतावनी (Critical)',
    verified: 'सत्यापित',
    pending: 'जांच बाकी',
    refresh: 'ताज़ा करें',
    upload: 'रिपोर्ट अपलोड',
    download: 'डाउनलोड',
    save: 'सहेजें',
    search: 'टेस्ट या रिपोर्ट खोजें...',
    viewDetails: 'विवरण देखें',
    consultDoctor: 'कृपया किसी भी दवा या इलाज के लिए हमेशा अपने डॉक्टर से परामर्श लें।',
    learnMore: 'टेस्ट के बारे में जानें',

    loginTitle: 'मेडीग्राफ एआई में आपका स्वागत है',
    loginSubtitle: 'आपके और आपके परिवार के स्वास्थ्य रिकॉर्ड को सुरक्षित व सरल रखने का साथी।',
    enterDemo: '⚡ तुरंत डेमो देखें (Jane Doe)',
    demoDesc: 'पूरे मेडिकल रिकॉर्ड्स, 27 टेस्ट रिपोर्ट्स और लाइव ट्रेंड ग्राफ बिना लॉगिन के देखें।',
    orSignIn: 'या ईमेल से साइन इन करें',
    emailLabel: 'ईमेल पता',
    passwordLabel: 'पासवर्ड',
    signInBtn: 'साइन इन करें',
    needAccount: 'नया खाता चाहिए?',
    createAccount: 'खाता बनाएं',
    privacyFooter: 'HIPAA व GDPR सुरक्षा मानक · सुरक्षित लोकल एन्क्रिप्शन · केवल सूचनात्मक उपयोग',

    patientDossier: 'रोगी स्वास्थ्य प्रोफ़ाइल',
    verifiedRecord: 'प्रमाणित मेडिकल रिकॉर्ड',
    vitalityScore: 'ओवरऑल हेल्थ स्कोर',
    vitalityDesc: 'आपकी सभी सत्यापित लैब रिपोर्ट्स के आधार पर',
    statusMatrixTitle: 'मुख्य शारीरिक स्वास्थ्य सूचक',
    statusMatrixSubtitle: 'प्रमुख अंगों और खून की जांच का ताज़ा स्टेटस',
    criticalAlertTitle: '⚠️ ध्यान दें: सुरक्षित सीमा से बाहर के टेस्ट परिणाम',
    criticalAlertMessage: 'नीचे दिए गए टेस्ट परिणाम सामान्य सुरक्षित सीमा से काफी बाहर हैं। हमारी सलाह है कि जल्द से जल्द अपने डॉक्टर से मिलें:',
    deltaVsBaseline: 'पिछली रिपोर्ट से बदलाव:',
    viewAllTrends: 'सभी स्वास्थ्य ग्राफ देखें →',
    recentReports: 'हालिया लैब रिपोर्ट्स',
    recentTimeline: 'हाल की डॉक्टर विज़िट व टेस्ट',

    uploadTitle: 'मेडिकल रिपोर्ट अपलोड करें',
    uploadSubtitle: 'किसी भी लैब (Dr Lal, Thyrocare, SRL, Apollo, Hospital आदि) की ब्लड टेस्ट या चेकअप PDF/फोटो अपलोड करें।',
    dragDropText: 'रिपोर्ट चुनने के लिए यहां क्लिक करें या फाइल ड्रैग करें',
    supportedFormats: 'समर्थित प्रारूप: PDF, PNG, JPEG (अधिकतम 15MB)',
    uploadButton: 'रिपोर्ट पढ़ें व विश्लेषण करें →',
    sampleButton: 'सैंपल टेस्ट रिपोर्ट लोड करें',
    howItWorksTitle: 'यह कैसे काम करता है (3 आसान चरण):',
    step1Title: '1. रिपोर्ट चुनें',
    step1Desc: 'ब्लड टेस्ट, थायराइड, शुगर या फुल बॉडी चेकअप की PDF या साफ़ फोटो अपलोड करें।',
    step2Title: '2. स्वचालित एआई रीडिंग',
    step2Desc: 'MediGraph 98%+ सटीकता से हर टेस्ट का नाम, वैल्यू और सुरक्षित रेंज अपने-आप निकाल लेता है।',
    step3Title: '3. लाइफ-लॉन्ग हेल्थ ग्राफ',
    step3Desc: 'देखें कि आपकी सेहत समय के साथ सुधर रही है या नहीं, और एआई से अपनी भाषा में सवाल पूछें।',

    reviewTitle: 'निकाले गए टेस्ट परिणामों की जांच करें',
    reviewSubtitle: 'ग्राफ में जुड़ने से पहले रिपोर्ट से पढ़ी गई वैल्यूज को एक बार देख लें या सुधारें।',
    verifyAll: 'सभी रिकॉर्ड सत्यापित करें',
    confidenceScore: 'रीडिंग शुद्धता',
    referenceRange: 'सुरक्षित सामान्य सीमा',
    opticalConfidence: 'अक्षर स्पष्टता',
    editReading: 'वैल्यू बदलें',

    analyticsTitle: 'बायोमार्कर्स ट्रेंड्स व ग्राफ',
    analyticsSubtitle: 'सालों-साल अपने टेस्ट परिणामों की तुलना करें और देखें कि सुधार हो रहा है या नहीं।',
    selectBiomarker: 'ग्राफ देखने के लिए लैब टेस्ट चुनें:',
    compareMode: 'दो टेस्ट की तुलना करें (जैसे HDL बनाम LDL)',
    normalBand: 'हरा क्षेत्र = स्वस्थ सुरक्षित स्तर',
    latestReading: 'ताज़ा रीडिंग',
    baselineReading: 'शुरुआती बेसलाइन',
    netTrajectory: 'कुल स्वास्थ्य दिशा',

    assistantTitle: 'एआई स्वास्थ्य सहायक',
    assistantSubtitle: 'अपनी रिपोर्ट्स, डाइट या डॉक्टर विज़िट के बारे में आसान भाषा में सवाल पूछें।',
    askPlaceholder: 'स्वास्थ्य संबंधी सवाल पूछें (उदा. "मेरा कोलेस्ट्रॉल कितना है?")...',
    send: 'पूछें',
    suggestionsTitle: 'सुझाए गए सवाल:',
    suggestion1: 'मेरी कौन-कौन सी वैल्यूज असामान्य (Abnormal) हैं?',
    suggestion2: 'डॉक्टर से अगली मुलाकात में मुझे क्या पूछना चाहिए?',
    suggestion3: 'हीमोग्लोबिन और विटामिन डी का क्या मतलब है आसान भाषा में समझाएं।',
    suggestion4: 'कोलेस्ट्रॉल कम करने के लिए मुझे खाने में क्या बदलाव करना चाहिए?',
    citationsLabel: 'रिपोर्ट से सत्यापित स्रोत:',

    docsTitle: 'मेरी मेडिकल रिपोर्ट्स व टेस्ट रिकॉर्ड्स',
    docsSubtitle: 'आपके सभी लैब रिपोर्ट्स, ब्लड टेस्ट और चेकअप की पीडीएफ फाइलें एक सुरक्षित जगह पर।',
    searchDocs: 'फाइल नाम से रिपोर्ट खोजें...',
    allStatus: 'सभी स्टेटस',
    docName: 'रिपोर्ट का नाम',
    uploadDate: 'अपलोड की तारीख',
    pagesCount: 'पेज संख्या',
    extractedTests: 'निकाले गए टेस्ट',
    docStatus: 'स्थिति',
    docActions: 'कार्यवाही',
    inspectTests: 'टेस्ट देखें',

    summariesTitle: 'डॉक्टर सारांश रिपोर्ट',
    summariesSubtitle: 'सभी पुरानी रिपोर्ट्स का आसान भाषा में समग्र सारांश, जिसे आप डॉक्टर को दिखा सकते हैं।',
    generateSummary: '+ नया हेल्थ सारांश तैयार करें',
    generatingSummary: 'स्वास्थ्य रिपोर्ट्स का विश्लेषण कर सारांश तैयार हो रहा है...',
    noSummariesYet: 'अभी तक कोई सारांश तैयार नहीं हुआ है। नया सारांश तैयार करने के लिए ऊपर क्लिक करें।',
    saveSummary: 'सुधार सहेजें',
    summaryDisclaimer: 'यह सारांश आपकी सत्यापित रिपोर्ट्स से बनाया गया है ताकि डॉक्टर से बातचीत आसान हो सके।',

    privacyTitle: 'गोपनीयता, सहमति व डेटा स्वामित्व',
    privacySubtitle: 'आपका स्वास्थ्य डेटा 100% आपका है। आप कभी भी अपना पूरा डेटा डाउनलोड या डिलीट कर सकते हैं।',
    patientProfile: 'रोगी प्रोफ़ाइल जानकारी',
    fullNameLabel: 'पूरा कानूनी नाम',
    emailAddressLabel: 'मुख्य ईमेल',
    accountRoleLabel: 'खाता प्रकार',
    storageEnvLabel: 'स्टोरेज सुरक्षा',
    localStorageMsg: 'लोकल एन्क्रिप्टेड स्टोरेज (कोई थर्ड-पार्टी क्लाउड शेयरिंग नहीं)',
    dataPortabilityTitle: 'पूरा मेडिकल रिकॉर्ड डाउनलोड करें',
    dataPortabilityDesc: 'अपनी सभी टेस्ट वैल्यूज, यूनिट्स और तारीखों का एक पूरा JSON बैकअप डाउनलोड करें।',
    downloadBtn: '📥 पूरा हेल्थ आर्काइव डाउनलोड करें',
    dangerZoneTitle: 'खतरे का क्षेत्र: खाता व रिकॉर्ड स्थायी रूप से हटाएं',
    dangerZoneDesc: 'यह क्रिया आपके सभी अपलोड किए गए दस्तावेज़ों, लैब परिणामों और इतिहास को हमेशा के लिए मिटा देगी।',
    confirmPasswordLabel: 'हटाने की पुष्टि के लिए पासवर्ड दर्ज करें',
    deleteBtn: 'खाता और सभी मेडिकल रिकॉर्ड हमेशा के लिए मिटाएं',

    timelineTitle: 'स्वास्थ्य यात्रा और टाइमलाइन',
    timelineSubtitle: 'आपके सभी लैब टेस्ट, डॉक्टर की सलाह और महत्वपूर्ण स्वास्थ्य पड़ावों का समयवार विवरण।'
  },

  bn: {
    brandName: 'MediGraph AI',
    brandTagline: 'আপনার ব্যক্তিগত স্বাস্থ্য রেকর্ড ও ল্যাব রিপোর্ট ট্র্যাকার',
    languageName: 'বাংলা',
    changeLanguage: 'ভাষা নির্বাচন করুন',
    navDashboard: 'স্বাস্থ্য পর্যালোচনা',
    navUpload: 'রিপোর্ট আপলোড করুন',
    navDocuments: 'আমার মেডিকেল রিপোর্ট',
    navTimeline: 'স্বাস্থ্য টাইমলাইন',
    navAnalytics: 'গ্রাফ ও ট্রেন্ডস',
    navAssistant: 'এআই স্বাস্থ্য সহকারী',
    navSummaries: 'ডাক্তার সারাংশ',
    navPrivacy: 'তথ্য ও গোপনীয়তা',
    navDictionary: 'ল্যাব টেস্ট গাইড',
    normal: 'স্বাভাবিক (Normal)',
    elevated: 'উচ্চ (High)',
    low: 'কম (Low)',
    critical: 'জরুরি সতর্কতা (Critical)',
    verified: 'যাচাইকৃত',
    pending: 'পর্যালোচনা বাকি',
    refresh: 'রিফ্রেশ',
    upload: 'আপলোড',
    download: 'ডাউনলোড',
    save: 'সংরক্ষণ',
    search: 'অনুসন্ধান করুন...',
    learnMore: 'টেস্ট সম্পর্কে জানুন',
    consultDoctor: 'চিকিৎসা সংক্রান্ত সিদ্ধান্তের জন্য সর্বদা একজন ডাক্তারের পরামর্শ নিন।'
  },

  te: {
    brandName: 'MediGraph AI',
    brandTagline: 'మీ వ్యక్తిగత ఆరోగ్య రికార్డు మరియు ల్యాబ్ రిపోర్ట్ ట్రాకర్',
    languageName: 'తెలుగు',
    changeLanguage: 'భాషను ఎంచుకోండి',
    navDashboard: 'ఆరోగ్య సమాచారం',
    navUpload: 'రిపోర్ట్ అప్‌లోడ్ చేయండి',
    navDocuments: 'నా మెడికల్ రికార్డులు',
    navTimeline: 'ఆరోగ్య కాలక్రమం',
    navAnalytics: 'గ్రాఫ్‌లు & పోకడలు',
    navAssistant: 'ఏఐ ఆరోగ్య సహాయకుడు',
    navSummaries: 'డాక్టర్ సారాంశం',
    navPrivacy: 'గోప్యత & డేటా',
    navDictionary: 'ల్యాబ్ టెస్ట్ గైడ్',
    normal: 'సాధారణం (Normal)',
    elevated: 'ఎక్కువ (High)',
    low: 'తక్కువ (Low)',
    critical: 'అత్యవసర హెచ్చరిక (Critical)',
    verified: 'ధృవీకరించబడింది',
    pending: 'సమీక్ష పెండింగ్',
    refresh: 'రిఫ్రెష్',
    upload: 'అప్‌లోడ్',
    download: 'డౌన్‌లోడ్',
    save: 'సేవ్ చేయండి',
    search: 'శోధించండి...',
    learnMore: 'టెస్ట్ వివరాలు తెలుసుకోండి',
    consultDoctor: 'వైద్య చికిత్స కోసం ఎల్లప్పుడూ వైద్యుడిని సంప్రదించండి.'
  },

  ta: {
    brandName: 'MediGraph AI',
    brandTagline: 'உங்கள் தனிப்பட்ட சுகாதார அறிக்கை கண்காணிப்பாளர்',
    languageName: 'தமிழ்',
    changeLanguage: 'மொழியை மாற்றவும்',
    navDashboard: 'சுகாதார கண்ணோட்டம்',
    navUpload: 'அறிக்கையை பதிவேற்றுக',
    navDocuments: 'மருத்துவ ஆவணங்கள்',
    navTimeline: 'சுகாதார காலவரிசை',
    navAnalytics: 'வரைபடங்கள் & போக்குகள்',
    navAssistant: 'AI மருத்துவ உதவியாளர்',
    navSummaries: 'மருத்துவர் சுருக்கம்',
    navPrivacy: 'தனியுரிமை & பாதுகாப்பு',
    navDictionary: 'பரிசோதனை வழிகாட்டி',
    normal: 'இயல்பானது (Normal)',
    elevated: 'அதிகம் (High)',
    low: 'குறைவு (Low)',
    critical: 'அவசர எச்சரிக்கை (Critical)',
    verified: 'சரிபார்க்கப்பட்டது',
    pending: 'மதிப்பாய்வு தேவை',
    refresh: 'புதுப்பி',
    upload: 'பதிவேற்று',
    download: 'பதிவிறக்கு',
    save: 'சேமிக்க',
    search: 'தேடுக...',
    learnMore: 'சோதனை பற்றி அறியவும்',
    consultDoctor: 'மருத்துவ முடிவுகளுக்கு எப்போதும் மருத்துவரை அணுகவும்.'
  },

  mr: {
    brandName: 'MediGraph AI',
    brandTagline: 'तुमचा वैयक्तिक आरोग्य अहवाल ट्रॅकर',
    languageName: 'मराठी',
    changeLanguage: 'भाषा निवडा',
    navDashboard: 'आरोग्य आढावा',
    navUpload: 'अहवाल अपलोड करा',
    navDocuments: 'वैद्यकीय नोंदी',
    navTimeline: 'आरोग्य टाइमलाइन',
    navAnalytics: 'आलेख आणि ट्रेंड',
    navAssistant: 'एआय आरोग्य सहाय्यक',
    navSummaries: 'डॉक्टर सारांश',
    navPrivacy: 'गोपनीयता आणि डेटा',
    navDictionary: 'लॅब चाचणी मार्गदर्शक',
    normal: 'सामान्य (Normal)',
    elevated: 'वाढलेले (High)',
    low: 'कमी (Low)',
    critical: 'गंभीर इशारा (Critical)',
    verified: 'पडताळलेले',
    pending: 'तपासणी बाकी',
    refresh: 'ताजे करा',
    upload: 'अपलोड करा',
    download: 'डाउनलोड',
    save: 'जतन करा',
    search: 'शोधा...',
    learnMore: 'चाचणीबद्दल जाणून घ्या',
    consultDoctor: 'वैद्यकीय सल्ल्यासाठी नेहमी डॉक्टरांचा सल्ला घ्या.'
  },

  gu: {
    brandName: 'MediGraph AI',
    brandTagline: 'તમારું વ્યક્તિગત આરોગ્ય રેકોર્ડ ટ્રેકર',
    languageName: 'ગુજરાતી',
    changeLanguage: 'ભાષા પસંદ કરો',
    navDashboard: 'આરોગ્ય ઝાંખી',
    navUpload: 'રિપોર્ટ અપલોડ કરો',
    navDocuments: 'મેડિકલ રેકોર્ડ્સ',
    navTimeline: 'આરોગ્ય સમયરેખા',
    navAnalytics: 'આલેખ અને વલણો',
    navAssistant: 'એઆઈ આરોગ્ય સહાયક',
    navSummaries: 'ડૉક્ટર સારાંશ',
    navPrivacy: 'ગોપનીયતા અને ડેટા',
    navDictionary: 'લેબ ટેસ્ટ માર્ગદર્શિકા',
    normal: 'સામાન્ય (Normal)',
    elevated: 'વધારે (High)',
    low: 'ઓછું (Low)',
    critical: 'તાકીદની ચેતવણી (Critical)',
    verified: 'ચકાસાયેલ',
    pending: 'સમીક્ષા બાકી',
    refresh: 'તાજું કરો',
    upload: 'અપલોડ',
    download: 'ડાઉનલોડ',
    save: 'સાચવો',
    search: 'શોધો...',
    learnMore: 'ટેસ્ટ વિશે જાણો',
    consultDoctor: 'તબીબી સલાહ માટે હંમેશા તમારા ડૉક્ટરની સલાહ લો.'
  },

  kn: {
    brandName: 'MediGraph AI',
    brandTagline: 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ದಾಖಲೆ ಟ್ರ್ಯಾಕರ್',
    languageName: 'ಕನ್ನಡ',
    changeLanguage: 'ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಿ',
    navDashboard: 'ಆರೋಗ್ಯ ಅವಲೋಕನ',
    navUpload: 'ವರದಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    navDocuments: 'ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು',
    navTimeline: 'ಆರೋಗ್ಯ ಟೈಮ್‌ಲೈನ್',
    navAnalytics: 'ಗ್ರಾಫ್‌ಗಳು & ಪ್ರವೃತ್ತಿಗಳು',
    navAssistant: 'AI ಆರೋಗ್ಯ ಸಹಾಯಕ',
    navSummaries: 'ವೈದ್ಯರ ಸಾರಾಂಶ',
    navPrivacy: 'ಗೌಪ್ಯತೆ & ಡೇಟಾ',
    navDictionary: 'ಲ್ಯಾಬ್ ಪರೀಕ್ಷಾ ಮಾರ್ಗದರ್ಶಿ',
    normal: 'ಸಾಮಾನ್ಯ (Normal)',
    elevated: 'ಹೆಚ್ಚಾಗಿದೆ (High)',
    low: 'ಕಡಿಮೆ (Low)',
    critical: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ (Critical)',
    verified: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    pending: 'ಪರಿಶೀಲನೆ ಬಾಕಿ',
    refresh: 'ರಿಫ್ರೆಶ್',
    upload: 'ಅಪ್‌ಲೋಡ್',
    download: 'ಡೌನ್‌ಲೋಡ್',
    save: 'ಉಳಿಸಿ',
    search: 'ಹುಡುಕಿ...',
    learnMore: 'ಪರೀಕ್ಷೆಯ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ',
    consultDoctor: 'ಯಾವಾಗಲೂ ನಿಮ್ಮ ವೈದ್ಯರ ಸಲಹೆಯನ್ನು ಪಡೆಯಿರಿ.'
  },

  ml: {
    brandName: 'MediGraph AI',
    brandTagline: 'നിങ്ങളുടെ വ്യക്തിഗത ആരോഗ്യ റെക്കോർഡ് ട്രാക്കർ',
    languageName: 'മലയാളം',
    changeLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    navDashboard: 'ആരോഗ്യ വിവരങ്ങൾ',
    navUpload: 'റിപ്പോർട്ട് അപ്‌ലോഡ് ചെയ്യുക',
    navDocuments: 'മെഡിക്കൽ രേഖകൾ',
    navTimeline: 'ആരോഗ്യ സമയരേഖ',
    navAnalytics: 'ഗ്രാഫുകളും ട്രെൻഡുകളും',
    navAssistant: 'AI ആരോഗ്യ സഹായി',
    navSummaries: 'ഡോക്ടർ സംഗ്രഹം',
    navPrivacy: 'സ്വകാര്യത & ഡാറ്റ',
    navDictionary: 'ലാബ് ടെസ്റ്റ് ഗൈഡ്',
    normal: 'സാധാരണ (Normal)',
    elevated: 'കൂടുതൽ (High)',
    low: 'കുറവ് (Low)',
    critical: 'അടിയന്തര മുന്നറിയിപ്പ് (Critical)',
    verified: 'സ്ഥിരീകരിച്ചു',
    pending: 'പരിശോധന ബാക്കി',
    refresh: 'പുതുക്കുക',
    upload: 'അപ്‌ലോഡ്',
    download: 'ഡൗൺലോഡ്',
    save: 'സേവ് ചെയ്യുക',
    search: 'തിരയുക...',
    learnMore: 'ടെസ്റ്റിനെക്കുറിച്ച് അറിയുക',
    consultDoctor: 'ചികിത്സയ്ക്കായി എപ്പോഴും ഡോക്ടറെ സമീപിക്കുക.'
  },

  pa: {
    brandName: 'MediGraph AI',
    brandTagline: 'ਤੁਹਾਡਾ ਨਿੱਜੀ ਸਿਹਤ ਰਿਕਾਰਡ ਟਰੈਕਰ',
    languageName: 'ਪੰਜਾਬੀ',
    changeLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    navDashboard: 'ਸਿਹਤ ਸੰਖੇਪ',
    navUpload: 'ਰਿਪੋਰਟ ਅਪਲੋਡ ਕਰੋ',
    navDocuments: 'ਮੈਡੀਕਲ ਰਿਕਾਰਡ',
    navTimeline: 'ਸਿਹਤ ਟਾਈਮਲਾਈਨ',
    navAnalytics: 'ਗ੍ਰਾਫ ਅਤੇ ਰੁਝਾਨ',
    navAssistant: 'ਏਆਈ ਸਿਹਤ ਸਹਾਇਕ',
    navSummaries: 'ਡਾਕਟਰ ਸਾਰਾਂਸ਼',
    navPrivacy: 'ਗੋਪਨੀਯਤਾ ਅਤੇ ਡਾਟਾ',
    navDictionary: 'ਲੈਬ ਟੈਸਟ ਗਾਈਡ',
    normal: 'ਸਧਾਰਣ (Normal)',
    elevated: 'ਵੱਧ (High)',
    low: 'ਘੱਟ (Low)',
    critical: 'ਜ਼ਰੂਰੀ ਚੇਤਾਵਨੀ (Critical)',
    verified: 'ਪ੍ਰਮਾਣਿਤ',
    pending: 'ਜਾਂਚ ਬਾਕੀ',
    refresh: 'ਤਾਜ਼ਾ ਕਰੋ',
    upload: 'ਅਪਲੋਡ',
    download: 'ਡਾਊਨਲੋਡ',
    save: 'ਸੰਭਾਲੋ',
    search: 'ਖੋਜੋ...',
    learnMore: 'ਟੈਸਟ ਬਾਰੇ ਜਾਣੋ',
    consultDoctor: 'ਕਿਸੇ ਵੀ ਡਾਕਟਰੀ ਫੈਸਲੇ ਲਈ ਹਮੇਸ਼ਾਂ ਡਾਕਟਰ ਦੀ ਸਲਾਹ ਲਓ।'
  },

  or: {
    brandName: 'MediGraph AI',
    brandTagline: 'ଆପଣଙ୍କ ବ୍ୟକ୍ତିଗତ ସ୍ୱାସ୍ଥ୍ୟ ରେକର୍ଡ ଟ୍ରାକର୍',
    languageName: 'ଓଡ଼ିଆ',
    changeLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
    navDashboard: 'ସ୍ୱାସ୍ଥ୍ୟ ସମୀକ୍ଷା',
    navUpload: 'ରିପୋର୍ଟ ଅପଲୋଡ୍ କରନ୍ତୁ',
    navDocuments: 'ମୋର ମେଡିକାଲ ରିପୋର୍ଟ',
    navTimeline: 'ସ୍ୱାସ୍ଥ୍ୟ ଟାଇମଲାଇନ',
    navAnalytics: 'ଗ୍ରାଫ୍ ଏବଂ ଟ୍ରେଣ୍ଡ୍',
    navAssistant: 'ଏଆଇ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ',
    navSummaries: 'ଡାକ୍ତର ସାରାଂଶ',
    navPrivacy: 'ଗୋପନୀୟତା ଓ ଡାଟା',
    navDictionary: 'ଲ୍ୟାବ୍ ଟେଷ୍ଟ ଗାଇଡ୍',
    normal: 'ସ୍ୱାଭାବିକ (Normal)',
    elevated: 'ଅଧିକ (High)',
    low: 'କମ୍ (Low)',
    critical: 'ଜରୁରୀ ସତର୍କତା (Critical)',
    verified: 'ଯାଞ୍ଚ ହୋଇଛି',
    pending: 'ସମୀକ୍ଷା ବାକି',
    refresh: 'ରିଫ୍ରେଶ୍',
    upload: 'ଅପଲୋଡ୍',
    download: 'ଡାଉନଲୋଡ୍',
    save: 'ସାଇତନ୍ତୁ',
    search: 'ଖୋଜନ୍ତୁ...',
    learnMore: 'ଟେଷ୍ଟ ବିଷୟରେ ଜାଣନ୍ତୁ',
    consultDoctor: 'ଚିକିତ୍ସା ପାଇଁ ସର୍ବଦା ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('medigraph_lang') || 'en';
    }
    return 'en';
  });

  const selectLanguage = (newLang) => {
    if (TRANSLATIONS[newLang]) {
      setLang(newLang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('medigraph_lang', newLang);
      }
    }
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    selectLanguage(nextLang);
  };

  // Fallback translation resolver: checks selected lang, then en
  const activeDict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const t = new Proxy(activeDict, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop in TRANSLATIONS.en) return TRANSLATIONS.en[prop];
      return prop;
    }
  });

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang: selectLanguage,
      toggleLanguage,
      selectLanguage,
      t,
      languages: SUPPORTED_LANGUAGES
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: 'en',
      setLang: () => {},
      toggleLanguage: () => {},
      selectLanguage: () => {},
      t: TRANSLATIONS.en,
      languages: SUPPORTED_LANGUAGES
    };
  }
  return ctx;
}
