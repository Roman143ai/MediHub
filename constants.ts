
import { AppSettings, Theme } from './types';

export const THEMES: Theme[] = [
  { id: 'blue', name: 'MediBlue (ডিফল্ট)', primary: '#2563eb', secondary: '#3b82f6', bgGradient: 'radial-gradient(circle at top right, #f0f9ff 0%, #e0f2fe 20%, #f8fafc 50%)', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { id: 'emerald', name: 'Emerald Health (সবুজ)', primary: '#059669', secondary: '#10b981', bgGradient: 'radial-gradient(circle at top right, #ecfdf5 0%, #d1fae5 20%, #f8fafc 50%)', cardBg: 'rgba(255, 255, 255, 0.85)' },
  { id: 'rose', name: 'Rose Care (গোলাপী)', primary: '#e11d48', secondary: '#f43f5e', bgGradient: 'radial-gradient(circle at top right, #fff1f2 0%, #ffe4e6 20%, #f8fafc 50%)', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { id: 'dark', name: 'NightCare (ডার্ক মোড)', primary: '#3b82f6', secondary: '#60a5fa', bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', cardBg: 'rgba(30, 41, 59, 0.7)' },
  { id: 'purple', name: 'Royal Purple (বেগুনী)', primary: '#7c3aed', secondary: '#8b5cf6', bgGradient: 'radial-gradient(circle at top right, #f5f3ff 0%, #ede9fe 20%, #f8fafc 50%)', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { id: 'amber', name: 'Sunny Vital (হলুদ)', primary: '#d97706', secondary: '#f59e0b', bgGradient: 'radial-gradient(circle at top right, #fffbeb 0%, #fef3c7 20%, #f8fafc 50%)', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { id: 'teal', name: 'Ocean Mist (নীলচে)', primary: '#0d9488', secondary: '#14b8a6', bgGradient: 'radial-gradient(circle at top right, #f0fdfa 0%, #ccfbf1 20%, #f8fafc 50%)', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { id: 'slate', name: 'Pro Slate (ধূসর)', primary: '#475569', secondary: '#64748b', bgGradient: 'radial-gradient(circle at top right, #f8fafc 0%, #f1f5f9 20%, #f8fafc 50%)', cardBg: 'rgba(255, 255, 255, 0.9)' },
  { id: 'mint', name: 'Mint Fresh (পুদিনা)', primary: '#0891b2', secondary: '#06b6d4', bgGradient: 'radial-gradient(circle at top right, #ecfeff 0%, #cffafe 20%, #f8fafc 50%)', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { id: 'lavender', name: 'Lavender (ল্যাভেন্ডার)', primary: '#9333ea', secondary: '#a855f7', bgGradient: 'radial-gradient(circle at top right, #faf5ff 0%, #f3e8ff 20%, #f8fafc 50%)', cardBg: 'rgba(255, 255, 255, 0.8)' }
];

export const INITIAL_SETTINGS: AppSettings = {
  activeThemeId: 'blue',
  prescriptionTitle: 'MediConsult AI',
  prescriptionSubtitle: 'Digital Health Assistant • Bangladesh',
  homeWelcomeTitle: 'স্বাগতম!',
  homeWelcomeSubtitle: 'আপনার সুস্বাস্থ্য আমাদের একমাত্র লক্ষ্য।',
  homeFooterText: 'সুস্থ থাকুন, সঠিক চিকিৎসায় বিশ্বাস রাখুন।',
  websiteUrl: 'www.mediconsult.ai',
  doctorDetails: {
    name: 'ডাঃ রিমন মাহমুদ',
    degree: 'MBBS, BCS (Health)',
    designation: 'মেডিকেল অফিসার',
    specialty: 'জেনারেল ফিজিশিয়ান',
    workplace: 'ঢাকা মেডিকেল কলেজ হাসপাতাল'
  },
  symptoms: [
    "জ্বর (Fever)", "কাশি (Cough)", "মাথাব্যথা (Headache)", "পেটে ব্যথা (Stomach Pain)",
    "শ্বাসকষ্ট (Shortness of Breath)", "দূর্বলতা (Weakness)", "বমি বমি ভাব (Nausea)",
    "বুকে ব্যথা (Chest Pain)", "শরীরে ব্যথা (Body Ache)", "গলা ব্যথা (Sore Throat)",
    "সর্দি (Runny Nose)", "খিদে কম লাগা (Loss of Appetite)"
  ],
  medicalHistories: [
    "ডায়াবেটিস (Diabetes)", "উচ্চ রক্তচাপ (High Blood Pressure)", "হাঁপানি (Asthma)",
    "কিডনি সমস্যা (Kidney Disease)", "হৃদরোগ (Heart Disease)", "থাইরয়েড সমস্যা (Thyroid)",
    "গ্যাস্ট্রিকের সমস্যা (Gastric/Acidity)", "অ্যালার্জি (Allergy)"
  ],
  availableTests: [
    "রক্ত পরীক্ষা (CBC)", "বুকের এক্স-রে (X-Ray Chest)", "ইসিজি (ECG)",
    "ডায়াবেটিস পরীক্ষা (Blood Sugar)", "প্রস্রাব পরীক্ষা (Urine R/E)",
    "পেটের আল্ট্রাসোনোগ্রাফি (USG of Abdomen)", "কিডনি পরীক্ষা (Serum Creatinine)", "লিভার পরীক্ষা (LFT)"
  ],
  banners: {
    homeHeader: '',
    homeFooter: '',
    prescriptionHeader: '',
    prescriptionFooter: ''
  }
};
