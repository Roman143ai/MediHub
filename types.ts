
export interface User {
  name: string;
  userId: string;
  password: string;
  isAdmin?: boolean;
}

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bgGradient: string;
  cardBg: string;
}

export interface AppBanners {
  homeHeader?: string;
  homeFooter?: string;
  prescriptionHeader?: string;
  prescriptionFooter?: string;
}

export interface DoctorDetails {
  name: string;
  degree: string;
  designation: string;
  specialty: string;
  workplace: string;
}

export interface AppSettings {
  symptoms: string[];
  medicalHistories: string[];
  availableTests: string[];
  activeThemeId: string;
  banners: AppBanners;
  prescriptionTitle: string;
  prescriptionSubtitle: string;
  homeWelcomeTitle: string;
  homeWelcomeSubtitle: string;
  homeFooterText: string;
  doctorDetails: DoctorDetails;
  signatureImage?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: string;
  gender: string;
  bloodGroup: string;
  address: string;
  mobile: string;
  profilePic?: string;
  previousDiseases: string;
}

export interface MedicalCase {
  patientId: string;
  vitals: {
    weight?: string;
    height?: string;
    bp?: string;
    pulse?: string;
    temp?: string;
  };
  selectedSymptoms: { name: string; intensity: 'Mild' | 'Moderate' | 'Severe' }[];
  customSymptoms: string;
  selectedHistories: string[];
  customHistory: string;
  currentMedications: { name: string; dosage: string }[];
  tests: {
    name: string;
    result: string;
    imageBase64?: string;
  }[];
}

export interface Prescription {
  diagnosis: string;
  advice: string;
  medications: {
    name: string;
    genericName: string;
    dosage: string;
    duration: string;
    purpose: string;
  }[];
  date: string;
}

export interface PrescriptionEntry {
  id: string;
  patientId: string;
  prescription: Prescription;
  timestamp: number;
}

export interface OrderMessage {
  sender: 'user' | 'admin';
  text: string;
  timestamp: number;
}

export interface MedicineOrder {
  id: string;
  patientId: string;
  patientName: string;
  medicines: string;
  quantity: string;
  address: string;
  phone: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'cancelled';
  messages: OrderMessage[];
  createdAt: number;
}

export interface PriceListItem {
  id: string;
  name: string;
  generic: string;
  company: string;
  price: string;
  category?: string;
  unit?: string;
}
