import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Modal, Input, Badge, Button, EmptyState } from './ui';

export const BIOMARKER_KNOWLEDGE = {
  HEMOGLOBIN: {
    name: 'Hemoglobin (Hb)',
    category: 'Hematology (Blood)',
    normalRangeMale: '13.5 — 17.5 g/dL',
    normalRangeFemale: '12.0 — 15.5 g/dL',
    whatIsItEn: 'Hemoglobin is the iron-rich protein in red blood cells that carries oxygen from your lungs to the rest of your body.',
    whatIsItHi: 'हीमोग्लोबिन लाल रक्त कोशिकाओं (RBC) में मौजूद आयरन युक्त प्रोटीन है जो फेफड़ों से पूरे शरीर में ऑक्सीजन पहुंचाता है।',
    whyTestedEn: 'Checked to screen for anemia, fatigue, nutritional deficiencies, and general vitality.',
    whyTestedHi: 'खून की कमी (एनीमिया), थकान, कमज़ोरी, और शरीर में पोषण की जांच के लिए कराया जाता है।',
    lowImpactEn: 'Fatigue, dizziness, pale skin, shortness of breath, low energy (Anemia).',
    lowImpactHi: 'थकान, चक्कर आना, सांस फूलना, चेहरे का पीलापन, कमज़ोरी (खून की कमी/एनीमिया)।',
    highImpactEn: 'Dehydration, smoking, living at high altitudes, or excess red blood cell production.',
    highImpactHi: 'डिहाइड्रेशन (पानी की कमी), धूम्रपान, या अत्यधिक लाल रक्त कोशिकाओं का बनना।',
    dietTipsEn: 'Spinach, pomegranate, beetroot, jaggery (gud), legumes, eggs, and Vitamin C (helps iron absorption).',
    dietTipsHi: 'पालक, अनार, चुकंदर, गुड़, चना, दालें, अंडे और नींबू/आंवला (विटामिन सी आयरन सोखने में मदद करता है)।'
  },
  FASTING_GLUCOSE: {
    name: 'Fasting Blood Glucose (Sugar)',
    category: 'Metabolic (Diabetes)',
    normalRangeMale: '70 — 99 mg/dL',
    normalRangeFemale: '70 — 99 mg/dL',
    whatIsItEn: 'Measures blood sugar concentration after an overnight 8 to 12-hour fast.',
    whatIsItHi: 'रातभर (8 से 12 घंटे) भूखे पेट रहने के बाद खून में शुगर (ग्लूकोज) की मात्रा मापता है।',
    whyTestedEn: 'Detects prediabetes, diabetes, insulin resistance, and metabolic health.',
    whyTestedHi: 'डायबिटीज (मधुमेह), प्रीडायबिटीज और इंसुलिन की कार्यक्षमता का पता लगाने के लिए।',
    lowImpactEn: 'Trembling, sweating, hunger, confusion, dizziness (Hypoglycemia).',
    lowImpactHi: 'कंपकंपी, पसीना आना, घबराहट, अचानक चक्कर आना (लो शुगर)।',
    highImpactEn: 'Excessive thirst, frequent urination, fatigue, risk of diabetes and vascular damage.',
    highImpactHi: 'बार-बार पेशाब आना, ज्यादा प्यास लगना, घाव देर से भरना, डायबिटीज का खतरा।',
    dietTipsEn: 'Reduce refined sugar, maida, and sweet beverages; increase fiber (fenugreek, oats, green vegetables, salads). Walk 30 mins daily.',
    dietTipsHi: 'सफेद चीनी, मैदा, कोल्ड ड्रिंक्स बंद करें; मेथी दाना, ओट्स, हरी सब्जियां, सलाद बढ़ाएं। रोजाना 30 मिनट टहलें।'
  },
  HBA1C: {
    name: 'HbA1c (Glycated Hemoglobin)',
    category: 'Metabolic (Diabetes)',
    normalRangeMale: '< 5.7 % (Normal), 5.7-6.4% (Prediabetic)',
    normalRangeFemale: '< 5.7 % (Normal), 5.7-6.4% (Prediabetic)',
    whatIsItEn: 'Reflects your average blood sugar levels over the past 2 to 3 months (90 days).',
    whatIsItHi: 'यह पिछले 3 महीनों (90 दिनों) का आपका औसत ब्लड शुगर स्तर बताता है।',
    whyTestedEn: 'Gold standard test to diagnose and monitor long-term diabetes control.',
    whyTestedHi: 'डायबिटीज की पुष्टि करने और पिछले 3 महीने के शुगर कंट्रोल को परखने का सबसे विश्वसनीय टेस्ट।',
    lowImpactEn: 'Generally safe, but very low values may occur with hemolytic anemia or liver disease.',
    lowImpactHi: 'आमतौर पर सुरक्षित, अत्यधिक कम होना कुछ खून संबंधी बीमारियों में देखा जाता है।',
    highImpactEn: 'Sustained high blood sugar damaging eyes, kidneys, nerves, and heart.',
    highImpactHi: 'लगातार शुगर बढ़ा रहना, जिससे आंखें, किडनी, नसें और दिल प्रभावित हो सकते हैं।',
    dietTipsEn: 'Portion control, low glycemic index foods, strength training, regular sleep, and stress reduction.',
    dietTipsHi: 'मीठा और तली चीजें नियंत्रित करें, कम जीआई वाले अनाज (जौ, चना, रागी), अच्छी नींद और व्यायाम।'
  },
  TOTAL_CHOLESTEROL: {
    name: 'Total Cholesterol',
    category: 'Lipid Panel (Heart)',
    normalRangeMale: '< 200 mg/dL',
    normalRangeFemale: '< 200 mg/dL',
    whatIsItEn: 'Total amount of circulating fatty lipids in your bloodstream, including HDL, LDL, and VLDL.',
    whatIsItHi: 'खून में मौजूद कुल फैट (वसा) की मात्रा, जिसमें अच्छा और बुरा दोनों कोलेस्ट्रॉल शामिल होते हैं।',
    whyTestedEn: 'Screens for cardiovascular risk, arterial plaque buildup, and stroke prevention.',
    whyTestedHi: 'दिल की बीमारियों, नसों में रुकावट (ब्लॉकेज) और हार्ट अटैक के खतरे को जांचने के लिए।',
    lowImpactEn: 'Rare; can occur with severe malnutrition, hyperthyroidism, or liver impairment.',
    lowImpactHi: 'बहुत कम होना दुर्लभ है, कुपोषण या लिवर की गंभीर समस्या में हो सकता है।',
    highImpactEn: 'Atherosclerosis (artery narrowing), high blood pressure, and elevated risk of heart attack.',
    highImpactHi: 'नसों में चर्बी जमना, ब्लड प्रेशर बढ़ना और हार्ट अटैक का खतरा बढ़ना।',
    dietTipsEn: 'Avoid trans fats, deep fried snacks, and palm oil; use mustard/olive oil, eat garlic, walnuts, almonds, and flaxseeds.',
    dietTipsHi: 'तली-भुनी चीजें, डालडा, रिफाइंड तेल छोड़ें; लहसुन, अखरोट, बादाम, अलसी (Flaxseed) और हरी सब्जियां खाएं।'
  },
  HDL_CHOLESTEROL: {
    name: 'HDL Cholesterol (Good Cholesterol)',
    category: 'Lipid Panel (Heart)',
    normalRangeMale: '> 40 mg/dL (Ideal: 50+)',
    normalRangeFemale: '> 50 mg/dL (Ideal: 60+)',
    whatIsItEn: 'High-Density Lipoprotein: "Good cholesterol" that scrubs plaque from artery walls and transports it to the liver.',
    whatIsItHi: 'एचडीएल यानी "अच्छा कोलेस्ट्रॉल"। यह नसों से फालतू चर्बी समेट कर लिवर तक ले जाता है और दिल की रक्षा करता है।',
    whyTestedEn: 'A higher number protects your heart from arterial blockages.',
    whyTestedHi: 'यह जितना अच्छा (ज्यादा) होगा, दिल की बीमारियों का खतरा उतना ही कम होगा।',
    lowImpactEn: 'Higher vulnerability to arterial inflammation and cardiovascular disease.',
    lowImpactHi: 'कम होने पर दिल की नसों में ब्लॉकेज होने का जोखिम बढ़ जाता है।',
    highImpactEn: 'Protective for heart health.',
    highImpactHi: 'दिल के लिए बेहद सुरक्षित और फायदेमंद।',
    dietTipsEn: 'Regular aerobic exercise (brisk walking, jogging), chia seeds, walnuts, fatty fish, and olive oil.',
    dietTipsHi: 'रोजाना 30-40 मिनट तेज चाल से टहलना, अखरोट, अलसी, चिया सीड्स और वजन नियंत्रित रखना।'
  },
  LDL_CHOLESTEROL: {
    name: 'LDL Cholesterol (Bad Cholesterol)',
    category: 'Lipid Panel (Heart)',
    normalRangeMale: '< 100 mg/dL (Optimal: < 70 for heart patients)',
    normalRangeFemale: '< 100 mg/dL',
    whatIsItEn: 'Low-Density Lipoprotein: "Bad cholesterol" that deposits sticky plaque on arterial walls.',
    whatIsItHi: 'एलडीएल यानी "बुरा कोलेस्ट्रॉल"। यह नसों की दीवारों में चिपक कर ब्लॉकेज पैदा करता है।',
    whyTestedEn: 'Primary target in preventing coronary heart disease.',
    whyTestedHi: 'हार्ट अटैक और नसों की रुकावट से बचने के लिए इसे नियंत्रित रखना सबसे जरूरी है।',
    lowImpactEn: 'Generally desirable.',
    lowImpactHi: 'आमतौर पर सुरक्षित और अच्छा।',
    highImpactEn: 'Plaque accumulation, coronary artery disease, angina, heart attack risk.',
    highImpactHi: 'नसों में ब्लॉकेज, छाती में दर्द (एंजाइना) और हार्ट अटैक का खतरा।',
    dietTipsEn: 'Cut red meat, full cream dairy, and bakery items; increase soluble fiber (oats, isabgol, apple, beans).',
    dietTipsHi: 'रेड मीट, मलाईदार दूध-घी, बेकरी बिस्कुट छोड़ें; ओट्स, इसबगोल, सेब और रेशेदार दालें खाएं।'
  },
  TRIGLYCERIDES: {
    name: 'Triglycerides',
    category: 'Lipid Panel (Heart)',
    normalRangeMale: '< 150 mg/dL',
    normalRangeFemale: '< 150 mg/dL',
    whatIsItEn: 'The most common type of fat in your body, created from excess calorie and carbohydrate consumption.',
    whatIsItHi: 'शरीर में सबसे आम फैट जो ज्यादा मीठा, तली चीजें या शराब लेने से तेजी से बढ़ता है।',
    whyTestedEn: 'Indicates cardiovascular risk, fatty liver disease, and metabolic syndrome.',
    whyTestedHi: 'फैटी लिवर (Fatty Liver), मोटापा और दिल की बीमारी की जांच के लिए।',
    lowImpactEn: 'Extremely rare, usually harmless.',
    lowImpactHi: 'कम होना दुर्लभ और आम तौर पर कोई नुकसान नहीं।',
    highImpactEn: 'Pancreatitis (at > 500 mg/dL), fatty liver, insulin resistance, and heart disease.',
    highImpactHi: 'फैटी लिवर, पैंक्रियाज में सूजन (Pancreatitis) और दिल की नसों में रुकावट।',
    dietTipsEn: 'Completely eliminate alcohol, sugary drinks, and excess sweets; reduce rice/roti quantity and do regular cardio.',
    dietTipsHi: 'शराब और कोल्ड ड्रिंक्स पूरी तरह बंद करें; चीनी और मैदे से बचें; रोजाना कार्डियो/दौड़ लगाएं।'
  },
  SERUM_CREATININE: {
    name: 'Serum Creatinine',
    category: 'Renal (Kidney)',
    normalRangeMale: '0.70 — 1.30 mg/dL',
    normalRangeFemale: '0.55 — 1.10 mg/dL',
    whatIsItEn: 'Waste byproduct from normal muscle breakdown, filtered entirely by healthy kidneys.',
    whatIsItHi: 'मांसपेशियों के काम करने से बनने वाला वेस्ट प्रोडक्ट, जिसे स्वस्थ किडनियां छानकर पेशाब के रास्ते निकाल देती हैं।',
    whyTestedEn: 'The primary blood marker to evaluate kidney filtration capacity (eGFR).',
    whyTestedHi: 'किडनी की कार्यक्षमता (गुर्दे सही काम कर रहे हैं या नहीं) परखने का मुख्य टेस्ट।',
    lowImpactEn: 'Low muscle mass, severe liver disease, or malnutrition.',
    lowImpactHi: 'मांसपेशियों की कमजोरी या कुपोषण में कम हो सकता है।',
    highImpactEn: 'Reduced kidney filtration, dehydration, kidney disease, or urinary blockage.',
    highImpactHi: 'किडनी की कार्यक्षमता में कमी, पानी की भारी कमी (डिहाइड्रेशन) या गुर्दे की बीमारी का संकेत।',
    dietTipsEn: 'Drink adequate water; avoid excessive protein supplements and painkiller abuse (NSAIDs); consult nephrologist if elevated.',
    dietTipsHi: 'पर्याप्त पानी पिएं; बिना डॉक्टर पूछे दर्द निवारक (पेनकिलर) गोलियां न खाएं; ज्यादा प्रोटीन सप्लीमेंट से बचें।'
  },
  BLOOD_UREA: {
    name: 'Blood Urea Nitrogen (BUN)',
    category: 'Renal (Kidney)',
    normalRangeMale: '15 — 40 mg/dL (BUN: 7 — 20 mg/dL)',
    normalRangeFemale: '15 — 40 mg/dL',
    whatIsItEn: 'Waste product formed in the liver when protein is metabolized, removed by the kidneys.',
    whatIsItHi: 'प्रोटीन के पचने से बनने वाला अपशिष्ट पदार्थ, जिसे किडनियां खून से साफ़ करती हैं।',
    whyTestedEn: 'Used with creatinine to diagnose dehydration, high protein intake, or kidney failure.',
    whyTestedHi: 'किडनी के काम और शरीर में पानी की स्थिति (डिहाइड्रेशन) को परखने के लिए।',
    lowImpactEn: 'Low protein diet or severe liver illness.',
    lowImpactHi: 'डाइट में प्रोटीन की बहुत कमी या लिवर रोग।',
    highImpactEn: 'Dehydration, high protein diet, heart failure, or kidney dysfunction.',
    highImpactHi: 'पानी की कमी, किडनी की परेशानी या अत्यधिक प्रोटीन का सेवन।',
    dietTipsEn: 'Ensure good hydration (2.5-3L water daily); balance protein consumption.',
    dietTipsHi: 'दिनभर में 8-10 गिलास पानी पिएं; खानपान में संतुलन रखें।'
  },
  URIC_ACID: {
    name: 'Uric Acid',
    category: 'Renal / Joints',
    normalRangeMale: '3.5 — 7.2 mg/dL',
    normalRangeFemale: '2.6 — 6.0 mg/dL',
    whatIsItEn: 'A chemical produced when your body breaks down substances called purines found in food and cells.',
    whatIsItHi: 'प्यूरीन (Purines) नामक तत्व के पचने से बनने वाला एसिड। ज्यादा होने पर यह जोड़ों में क्रिस्टल बना देता है।',
    whyTestedEn: 'Screens for gout (severe joint pain in big toe), arthritis, and kidney stones.',
    whyTestedHi: 'गठिया (Gout/जोड़ों में दर्द), पैरों के अंगूठे में सूजन और किडनी में पथरी की जांच के लिए।',
    lowImpactEn: 'Rare, usually not clinically significant.',
    lowImpactHi: 'आमतौर पर कोई बीमारी का संकेत नहीं होता।',
    highImpactEn: 'Gout attacks (red, swollen, extremely painful joints) and uric acid kidney stones.',
    highImpactHi: 'जोड़ों (खासकर पैर के अंगूठे, घुटने) में असहनीय दर्द व सूजन (गठिया/Gout) और पथरी।',
    dietTipsEn: 'Avoid red meat, organ meats, beer/alcohol, seafood, and high-fructose corn syrup. Drink plenty of water and lemon water.',
    dietTipsHi: 'रेड मीट, बीयर/शराब, ज्यादा दालें, पालक व टमाटर सीमित करें; नींबू पानी और भरपूर सादा पानी पिएं।'
  },
  SGPT_ALT: {
    name: 'SGPT / ALT (Alanine Transaminase)',
    category: 'Hepatic (Liver)',
    normalRangeMale: '< 50 U/L',
    normalRangeFemale: '< 35 U/L',
    whatIsItEn: 'An enzyme found mainly inside liver cells that leaks into the bloodstream when liver cells are stressed or inflamed.',
    whatIsItHi: 'लिवर की कोशिकाओं में मौजूद एंजाइम। जब लिवर में सूजन या दबाव आता है, तो यह खून में रिस जाता है।',
    whyTestedEn: 'Most sensitive blood indicator of liver health and inflammation.',
    whyTestedHi: 'लिवर की सेहत और सूजन (Liver Inflammation) जांचने का सबसे सटीक टेस्ट।',
    lowImpactEn: 'Normal healthy baseline.',
    lowImpactHi: 'सामान्य और सुरक्षित।',
    highImpactEn: 'Fatty liver, hepatitis, alcohol-induced liver stress, or medication side effects.',
    highImpactHi: 'फैटी लिवर (Fatty Liver), पीलिया (Hepatitis), शराब का असर या दवाओं का साइड-इफेक्ट।',
    dietTipsEn: 'Strictly avoid alcohol; reduce fried oily food; take coffee (hepatoprotective), green tea, and raw vegetables.',
    dietTipsHi: 'शराब बिल्कुल बंद करें; तला-भुना कम करें; पपीता, आंवला, छाछ और हरी पत्तेदार सब्जियां लें।'
  },
  SGOT_AST: {
    name: 'SGOT / AST (Aspartate Transaminase)',
    category: 'Hepatic (Liver)',
    normalRangeMale: '< 40 U/L',
    normalRangeFemale: '< 35 U/L',
    whatIsItEn: 'An enzyme found in the liver, heart muscles, and skeletal muscles.',
    whatIsItHi: 'लिवर और दिल की मांसपेशियों में पाया जाने वाला एंजाइम।',
    whyTestedEn: 'Evaluated together with SGPT to differentiate liver vs muscular injury.',
    whyTestedHi: 'लिवर और मांसपेशियों की कार्यक्षमता जांचने के लिए SGPT के साथ कराया जाता है।',
    lowImpactEn: 'Normal healthy baseline.',
    lowImpactHi: 'सामान्य और सुरक्षित।',
    highImpactEn: 'Liver damage, intense physical exertion, muscle trauma, or heart stress.',
    highImpactHi: 'लिवर पर दबाव, भारी कसरत के बाद मांसपेशियों में खिंचाव या दिल पर असर।',
    dietTipsEn: 'Antioxidant-rich foods, adequate sleep, avoid self-medicating with unprescribed tablets.',
    dietTipsHi: 'संतुलित आहार, पर्याप्त नींद और बिना डॉक्टरी सलाह के एंटीबायोटिक/पेनकिलर न खाएं।'
  },
  TOTAL_BILIRUBIN: {
    name: 'Total Bilirubin',
    category: 'Hepatic (Liver)',
    normalRangeMale: '0.2 — 1.2 mg/dL',
    normalRangeFemale: '0.2 — 1.2 mg/dL',
    whatIsItEn: 'Yellow pigment created during the normal recycling of aged red blood cells by the liver.',
    whatIsItHi: 'पीला पिगमेंट जो पुरानी लाल रक्त कोशिकाओं के टूटने से बनता है और लिवर इसे साफ करता है।',
    whyTestedEn: 'Screens for jaundice (yellowing of eyes and skin), bile duct stones, and liver function.',
    whyTestedHi: 'पीलिया (Jaundice), गॉलब्लैडर में पथरी और लिवर के कार्य को देखने के लिए।',
    lowImpactEn: 'Usually harmless.',
    lowImpactHi: 'सुरक्षित।',
    highImpactEn: 'Jaundice, dark urine, pale stools, itching, biliary obstruction, or hepatitis.',
    highImpactHi: 'आंखों और पेशाब का पीला होना (पीलिया/Jaundice), थकान और पित्त की नली में रुकावट।',
    dietTipsEn: 'Easily digestible light home-cooked meals; avoid oily foods; drink coconut water and sugarcane juice from clean sources.',
    dietTipsHi: 'हल्का सुपाच्य भोजन, नारियल पानी, मूली, पपीता; तेल-मसाले से पूरी तरह परहेज।'
  },
  TSH: {
    name: 'TSH (Thyroid Stimulating Hormone)',
    category: 'Thyroid',
    normalRangeMale: '0.45 — 4.5 µIU/mL',
    normalRangeFemale: '0.45 — 4.5 µIU/mL (Pregnancy specific)',
    whatIsItEn: 'Master hormone produced by your pituitary gland in the brain telling your thyroid to produce T3/T4.',
    whatIsItHi: 'दिमाग की पिट्यूटरी ग्रंथि द्वारा छोड़ा जाने वाला हार्मोन, जो थायराइड ग्रंथि को कंट्रोल करता है।',
    whyTestedEn: 'Detects Hypothyroidism (underactive thyroid) and Hyperthyroidism (overactive thyroid).',
    whyTestedHi: 'थायराइड की बीमारी (वजन बढ़ना, सुस्ती या बाल झड़ना) का पता लगाने का मुख्य टेस्ट।',
    lowImpactEn: 'Hyperthyroidism: rapid heartbeat, unexplained weight loss, anxiety, feeling too hot.',
    lowImpactHi: 'थायराइड का ज्यादा काम करना (वजन घटना, दिल की धड़कन तेज होना, घबराहट)।',
    highImpactEn: 'Hypothyroidism: unexpected weight gain, fatigue, dry skin, constipation, feeling cold.',
    highImpactHi: 'थायराइड का सुस्त होना (वजन तेजी से बढ़ना, सुस्ती, बाल झड़ना, ठंड लगना)।',
    dietTipsEn: 'Iodized salt, selenium (nuts), zinc, avoid excess raw cruciferous veggies (cauliflower/cabbage in large raw amounts).',
    dietTipsHi: 'आयोडीन युक्त नमक, समय पर नाश्ता; बहुत अधिक कच्ची गोभी/ब्रोकोली से बचें; डॉक्टर की दवा समय पर लें।'
  },
  VITAMIN_D: {
    name: 'Vitamin D (25-OH Total)',
    category: 'Vitamins & Minerals',
    normalRangeMale: '30 — 100 ng/mL (Optimal)',
    normalRangeFemale: '30 — 100 ng/mL',
    whatIsItEn: 'Fat-soluble vitamin synthesized in skin via sunlight, essential for absorbing calcium and bone density.',
    whatIsItHi: 'धूप से शरीर में बनने वाला जरूरी विटामिन, जो हड्डियों को कैल्शियम सोखने में मदद करता है।',
    whyTestedEn: 'Evaluates bone pain, osteoporosis risk, muscle weakness, and immune resistance.',
    whyTestedHi: 'हड्डियों में दर्द, कमर दर्द, बाल झड़ना और बार-बार बीमार पड़ने की जांच के लिए।',
    lowImpactEn: 'Bone and back pain, fatigue, hair loss, weak immunity, mood swings (Very common in indoor lifestyle).',
    lowImpactHi: 'हड्डियों व जोड़ों में दर्द, थकान, बाल गिरना, इम्यूनिटी कम होना (भारत में 80% लोगों में कम मिलता है)।',
    highImpactEn: 'Toxicity (hypercalcemia) usually only from severe supplement overdose.',
    highImpactHi: 'बहुत ज्यादा होना सिर्फ अधिक सप्लीमेंट खाने से होता है।',
    dietTipsEn: '15-20 mins early morning sunlight on bare skin; fortified milk, mushrooms, eggs, and weekly medical supplements as prescribed.',
    dietTipsHi: 'सुबह 15-20 मिनट धूप में बैठें; दूध, पनीर, मशरूम, अंडे खाएं; डॉक्टर की सलाह पर वीकली विटामिन डी कैप्सूल लें।'
  },
  VITAMIN_B12: {
    name: 'Vitamin B12 (Cobalamin)',
    category: 'Vitamins & Minerals',
    normalRangeMale: '211 — 911 pg/mL',
    normalRangeFemale: '211 — 911 pg/mL',
    whatIsItEn: 'Essential nutrient for red blood cell formation, neurological brain health, and nerve sheath integrity.',
    whatIsItHi: 'नसों की मजबूती, दिमाग की सतर्कता और लाल रक्त कोशिकाओं को बनाने के लिए सबसे जरूरी विटामिन।',
    whyTestedEn: 'Screens for tingling/numbness in hands and feet, memory fog, fatigue, and nerve weakness.',
    whyTestedHi: 'हाथ-पैरों में झनझनाहट/सुन्नपन, नसों की कमजोरी, याददाश्त में धुंधलापन और थकान की जांच के लिए।',
    lowImpactEn: 'Tingling sensation in feet (pins and needles), cognitive fog, numbness, extreme fatigue (Frequent in vegetarians).',
    lowImpactHi: 'हाथ-पैरों में सुई चुभने जैसा अहसास, नसों में कमजोरी, सुन्नपन (शाकाहारी लोगों में अक्सर कम मिलता है)।',
    highImpactEn: 'Usually excreted safely in urine.',
    highImpactHi: 'शरीर अतिरिक्त मात्रा पेशाब के जरिए सुरक्षित निकाल देता है।',
    dietTipsEn: 'Milk, curd (dahi), paneer, fortified cereals, eggs, fish. Vegetarians often need medical supplementation.',
    dietTipsHi: 'दूध, दही, पनीर, छाछ; यदि गंभीर रूप से कम है तो डॉक्टर से विटामिन B12 की दवा/इंजेक्शन लें।'
  },
  PLATELETS: {
    name: 'Platelet Count',
    category: 'Hematology (Blood)',
    normalRangeMale: '150,000 — 410,000 /µL',
    normalRangeFemale: '150,000 — 410,000 /µL',
    whatIsItEn: 'Tiny disc-shaped blood cells that clot together to stop bleeding when you get a cut or injury.',
    whatIsItHi: 'खून के वे छोटे कण जो चोट लगने पर थक्का (Clot) बनाकर खून का बहना रोकते हैं।',
    whyTestedEn: 'Essential in viral fevers (Dengue, Malaria), bleeding disorders, and pre-surgery safety.',
    whyTestedHi: 'डेंगू, मलेरिया, वायरल बुखार में और किसी भी सर्जरी से पहले ब्लीडिंग रिस्क चेक करने के लिए।',
    lowImpactEn: 'Easy bruising, bleeding gums, nosebleeds, internal bleeding risk (Thrombocytopenia).',
    lowImpactHi: 'मसूड़ों से खून आना, शरीर पर नीले निशान पड़ना, नाक से खून आना (डेंगू में प्लेटलेट्स गिरना)।',
    highImpactEn: 'Risk of abnormal blood clots in veins or arteries.',
    highImpactHi: 'खून की नसों में थक्का जमने का खतरा बढ़ना।',
    dietTipsEn: 'Papaya leaf extract, kiwi, pomegranate, pumpkin seeds, coconut water, and adequate rest during fevers.',
    dietTipsHi: 'पपीते का पत्ता, कीवी, अनार, गिलोय, नारियल पानी और बुखार के दौरान खूब आराम व पानी।'
  }
};

export function BiomarkerDictionaryModal({ isOpen, onClose, initialSearch = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeItem, setActiveItem] = useState(null);
  const { lang, t } = useLanguage();

  if (!isOpen) return null;

  const categories = ['ALL', 'Hematology (Blood)', 'Metabolic (Diabetes)', 'Lipid Panel (Heart)', 'Renal (Kidney)', 'Hepatic (Liver)', 'Thyroid', 'Vitamins & Minerals'];

  const filtered = Object.entries(BIOMARKER_KNOWLEDGE).filter(([key, item]) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.whatIsItEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.whatIsItHi.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'hi' ? 'मेडिकल टेस्ट गाइड व डिक्शनरी' : 'Clinical Biomarker Guide & Reference Dictionary'}
      description={lang === 'hi' ? 'किसी भी टेस्ट के बारे में आसान भाषा में समझें — यह क्या है, सुरक्षित सीमा क्या है और क्या आहार लेना चाहिए।' : 'Physiological roles, standard clinical reference intervals, and nutritional recommendations in plain language.'}
      maxWidth="820px"
    >
      {/* Search & Category Filter */}
      <div style={{ marginBottom: '16px' }}>
        <Input
          icon={Search}
          placeholder={lang === 'hi' ? 'टेस्ट का नाम खोजें (उदा. Hemoglobin, Sugar, Thyroid, Vitamin D)...' : 'Search biomarker name (e.g. Hemoglobin, Fasting Glucose, HbA1c, Thyroid)...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginTop: '10px', paddingBottom: '4px' }}>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              style={{
                fontSize: 'var(--text-xs)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: selectedCategory === c ? 'var(--accent)' : 'var(--border)',
                backgroundColor: selectedCategory === c ? 'var(--accent-subtle)' : 'var(--surface)',
                color: selectedCategory === c ? 'var(--accent-ink)' : 'var(--ink-secondary)',
                fontWeight: selectedCategory === c ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {c === 'ALL' ? (lang === 'hi' ? 'सभी टेस्ट' : 'All Biomarkers') : c}
            </button>
          ))}
        </div>
      </div>

      {/* List of Biomarkers */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching biomarker found"
          description="Try searching with a generic term like Hemoglobin, Glucose, Cholesterol, or Creatinine."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(([key, item]) => {
            const isExpanded = activeItem === key;
            return (
              <div
                key={key}
                style={{
                  border: '1px solid',
                  borderColor: isExpanded ? 'var(--accent-border)' : 'var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isExpanded ? 'var(--surface-sub)' : 'var(--surface)',
                  overflow: 'hidden',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {/* Accordion Row */}
                <div
                  onClick={() => setActiveItem(isExpanded ? null : key)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink)' }}>
                      {item.name}
                    </span>
                    <Badge variant="neutral" size="sm">{item.category}</Badge>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-muted)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>
                      {isExpanded ? 'Collapse' : 'Details'}
                    </span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ padding: '16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Plain Definition */}
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', lineHeight: 'var(--leading-sm)' }}>
                      {lang === 'hi' ? item.whatIsItHi : item.whatIsItEn}
                    </p>

                    {/* Reference Intervals */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px', backgroundColor: 'var(--status-normal-bg)', border: '1px solid var(--status-normal-border)', borderRadius: 'var(--radius-xs)' }}>
                      <div>
                        <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--status-normal-ink)', textTransform: 'uppercase' }}>
                          Men Safe Reference
                        </span>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--status-normal-ink)', marginTop: '2px' }}>
                          {item.normalRangeMale}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--status-normal-ink)', textTransform: 'uppercase' }}>
                          Women Safe Reference
                        </span>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--status-normal-ink)', marginTop: '2px' }}>
                          {item.normalRangeFemale}
                        </div>
                      </div>
                    </div>

                    {/* Out of bounds insights */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--status-borderline-bg)', border: '1px solid var(--status-borderline-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--status-borderline-ink)', marginBottom: '4px' }}>
                          <TrendingUp size={13} />
                          <span>{lang === 'hi' ? 'ज्यादा (High) होने पर' : 'If Elevated'}</span>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--status-borderline-ink)', lineHeight: 'var(--leading-xs)' }}>
                          {lang === 'hi' ? item.highImpactHi : item.highImpactEn}
                        </p>
                      </div>

                      <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--status-abnormal-bg)', border: '1px solid var(--status-abnormal-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--status-abnormal-ink)', marginBottom: '4px' }}>
                          <TrendingDown size={13} />
                          <span>{lang === 'hi' ? 'कम (Low) होने पर' : 'If Low'}</span>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--status-abnormal-ink)', lineHeight: 'var(--leading-xs)' }}>
                          {lang === 'hi' ? item.lowImpactHi : item.lowImpactEn}
                        </p>
                      </div>
                    </div>

                    {/* Nutrition & Lifestyle */}
                    <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--surface-sub)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                        <Sparkles size={13} style={{ color: 'var(--accent)' }} />
                        <span>{lang === 'hi' ? 'आहार और जीवनशैली सुझाव' : 'Dietary & Lifestyle Recommendations'}</span>
                      </div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-secondary)', lineHeight: 'var(--leading-xs)' }}>
                        {lang === 'hi' ? item.dietTipsHi : item.dietTipsEn}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Actions */}
      <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
          Always consult your healthcare provider for medical decisions.
        </span>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close Guide
        </Button>
      </div>
    </Modal>
  );
}

