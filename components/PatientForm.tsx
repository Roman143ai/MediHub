
import React, { useState, useEffect } from 'react';
import { AppSettings, PatientProfile, MedicalCase } from '../types';
import { ImageCropper } from './ImageCropper';

interface PatientFormProps {
  settings: AppSettings;
  onSubmit: (profile: PatientProfile, medicalCase: MedicalCase) => void;
  isLoading: boolean;
  existingProfile: PatientProfile | null;
  isEditModeOnly?: boolean;
  onSaveProfile?: (profile: PatientProfile) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ 
  settings, 
  onSubmit, 
  isLoading, 
  existingProfile,
  isEditModeOnly = false,
  onSaveProfile
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [profile, setProfile] = useState<PatientProfile>(existingProfile || {
    id: Math.random().toString(36).substring(2, 10),
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'Unknown',
    address: '',
    mobile: '',
    previousDiseases: ''
  });

  const [medicalCase, setMedicalCase] = useState<MedicalCase>({
    patientId: profile.id,
    vitals: { weight: '', height: '', bp: '', pulse: '', temp: '' },
    selectedSymptoms: [],
    customSymptoms: '',
    selectedHistories: [],
    customHistory: '',
    currentMedications: [],
    tests: []
  });

  // Cropper state
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  useEffect(() => {
    if (existingProfile) {
      setProfile(existingProfile);
    }
  }, [existingProfile]);

  const toggleSymptom = (name: string) => {
    const exists = medicalCase.selectedSymptoms.find(s => s.name === name);
    if (exists) {
      setMedicalCase({
        ...medicalCase,
        selectedSymptoms: medicalCase.selectedSymptoms.filter(s => s.name !== name)
      });
    } else {
      setMedicalCase({
        ...medicalCase,
        selectedSymptoms: [...medicalCase.selectedSymptoms, { name, intensity: 'Moderate' }]
      });
    }
  };

  const updateSymptomIntensity = (name: string, intensity: 'Mild' | 'Moderate' | 'Severe') => {
    setMedicalCase({
      ...medicalCase,
      selectedSymptoms: medicalCase.selectedSymptoms.map(s => s.name === name ? { ...s, intensity } : s)
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        e.target.value = ''; // Reset input to allow re-selection
      };
      reader.readAsDataURL(file);
    }
  };

  const isProfileValid = profile.name.trim() !== '' && profile.age.trim() !== '';

  const StepIndicator = () => (
    <div className="flex items-center justify-between max-w-2xl mx-auto mb-12 px-4">
      {[
        { step: 1, label: 'ভাইটালস', icon: '💓' },
        { step: 2, label: 'লক্ষণসমূহ', icon: '🤒' },
        { step: 3, label: 'রিপোর্ট', icon: '📝' }
      ].map((item, idx) => (
        <React.Fragment key={item.step}>
          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => activeStep > item.step && setActiveStep(item.step)}>
            <div 
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 border-4 ${
                activeStep === item.step 
                  ? 'bg-white border-blue-500 text-blue-500 scale-110 shadow-2xl shadow-blue-200' 
                  : activeStep > item.step 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'bg-slate-100 border-slate-100 text-slate-400'
              }`}
            >
              {activeStep > item.step ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <span>{item.icon}</span>
              )}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${activeStep === item.step ? 'text-blue-600' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </div>
          {idx < 2 && (
            <div className={`flex-1 h-1.5 rounded-full mx-4 mb-6 transition-all duration-700 ${activeStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto relative">
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          aspectRatio={1}
          onCropComplete={(cropped) => {
            setProfile({ ...profile, profilePic: cropped });
            setImageToCrop(null);
          }}
          onCancel={() => setImageToCrop(null)}
        />
      )}

      {isEditModeOnly ? (
        <section className="glass-card rounded-[3rem] p-10 md:p-12 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-500">
           <div className="flex flex-col md:flex-row items-center gap-10 mb-12 border-b border-slate-100 pb-10">
            <div className="relative">
              <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center">
                {profile.profilePic ? (
                  <img src={profile.profilePic} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <svg className="w-20 h-20 text-slate-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                )}
              </div>
              <label className="absolute -bottom-3 -right-3 bg-blue-600 text-white p-4 rounded-3xl shadow-xl cursor-pointer hover:scale-110 transition-all border-4 border-white active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">প্রোফাইল এডিট করুন</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">Health Identity Manager</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">আপনার নাম</label>
              <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-sm" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="নাম লিখুন" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">আপনার বয়স</label>
              <input type="number" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-sm" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} placeholder="বয়স লিখুন" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">লিঙ্গ</label>
              <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                {['Male', 'Female'].map(g => (
                  <button key={g} onClick={() => setProfile({...profile, gender: g})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${profile.gender === g ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{g === 'Male' ? 'পুরুষ' : 'মহিলা'}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">রক্তের গ্রুপ</label>
              <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 appearance-none shadow-sm" value={profile.bloodGroup} onChange={e => setProfile({...profile, bloodGroup: e.target.value})}>
                <option value="Unknown">অজানা</option>
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
              </select>
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">মোবাইল নাম্বার</label>
              <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-sm" value={profile.mobile} onChange={e => setProfile({...profile, mobile: e.target.value})} placeholder="০১৭xxxxxxxx" />
            </div>
            <div className="space-y-3 md:col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">পূর্ণ ঠিকানা</label>
              <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-sm" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="গ্রাম/শহর, ডাকঘর, জেলা" />
            </div>
          </div>

          <div className="mt-12 flex justify-end">
            <button onClick={() => onSaveProfile?.(profile)} className="px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 transform hover:-translate-y-1">সেভ ও আপডেট করুন</button>
          </div>
        </section>
      ) : (
        <>
          <StepIndicator />

          {/* Step 1: Health Vitals & Basic Info Check */}
          {activeStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Emergency Profile Missing Check */}
              {!isProfileValid && (
                <section className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[2rem] animate-pulse">
                  <h4 className="text-amber-800 font-black text-sm uppercase mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    প্রোফাইল তথ্য প্রয়োজন
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-amber-100 focus:border-amber-500 outline-none font-bold text-slate-800" placeholder="আপনার নাম লিখুন" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                    <input className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-amber-100 focus:border-amber-500 outline-none font-bold text-slate-800" placeholder="আপনার বয়স" type="number" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} />
                  </div>
                </section>
              )}

              <section className="glass-card rounded-[3rem] p-10 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <div className="flex flex-col items-center text-center mb-12">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">শারীরিক ভাইটালস</h3>
                   <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Real-time Health Parameters</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    { label: 'ওজন', key: 'weight', unit: 'kg', icon: '⚖️', color: 'bg-orange-50 text-orange-600' },
                    { label: 'উচ্চতা', key: 'height', unit: 'ft', icon: '📏', color: 'bg-blue-50 text-blue-600' },
                    { label: 'রক্তচাপ', key: 'bp', unit: 'mmHg', icon: '💓', color: 'bg-rose-50 text-rose-600' },
                    { label: 'নাড়ির স্পন্দন', key: 'pulse', unit: 'bpm', icon: '⚡', color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'তাপমাত্রা', key: 'temp', unit: '°F', icon: '🌡️', color: 'bg-amber-50 text-amber-600' },
                  ].map(vital => (
                    <div key={vital.key} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                      <div className={`w-10 h-10 rounded-xl ${vital.color} flex items-center justify-center mb-4 text-xl group-hover:scale-110 transition-transform`}>
                        {vital.icon}
                      </div>
                      <div className="text-[10px] font-black uppercase text-slate-400 mb-1">{vital.label}</div>
                      <div className="flex items-end gap-1">
                        <input 
                          className="w-full bg-transparent font-black text-2xl text-slate-800 outline-none"
                          placeholder="00"
                          value={medicalCase.vitals[vital.key as keyof typeof medicalCase.vitals] || ''}
                          onChange={e => setMedicalCase({...medicalCase, vitals: {...medicalCase.vitals, [vital.key]: e.target.value}})}
                        />
                        <span className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{vital.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass-card rounded-[3rem] p-10 md:p-12 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl">🧬</div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">আপনার পূর্বের রোগের ইতিহাস</h4>
                </div>
                <div className="flex flex-wrap gap-3 mb-8">
                  {settings.medicalHistories.map(h => (
                    <button
                      key={h}
                      onClick={() => setMedicalCase({...medicalCase, selectedHistories: medicalCase.selectedHistories.includes(h) ? medicalCase.selectedHistories.filter(x => x !== h) : [...medicalCase.selectedHistories, h]})}
                      className={`px-6 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${medicalCase.selectedHistories.includes(h) ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                <textarea 
                  className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white outline-none transition-all font-medium h-32 resize-none shadow-inner"
                  placeholder="অন্য কোনো গুরুত্বপূর্ণ ইতিহাস থাকলে এখানে লিখুন (যেমন: অপারেশন বা বংশগত রোগ)..."
                  value={medicalCase.customHistory}
                  onChange={e => setMedicalCase({...medicalCase, customHistory: e.target.value})}
                />
              </section>
              
              <div className="flex justify-center">
                <button onClick={() => setActiveStep(2)} className="group px-16 py-6 bg-blue-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-200 hover:scale-105 transition-all flex items-center gap-4 active:scale-95">
                  পরবর্তী ধাপ: লক্ষণসমূহ
                  <svg className="group-hover:translate-x-2 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Symptoms */}
          {activeStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <section className="glass-card rounded-[3rem] p-10 md:p-12 shadow-2xl">
                <div className="flex flex-col items-center text-center mb-12">
                   <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-3xl mb-4 shadow-inner">🤒</div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">আপনার শারীরিক সমস্যা কি?</h3>
                   <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Select Symptoms & Intensity</p>
                </div>
                
                <div className="space-y-12">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {settings.symptoms.map(s => {
                      const isActive = medicalCase.selectedSymptoms.some(x => x.name === s);
                      return (
                        <div key={s} className={`p-1.5 rounded-[2rem] transition-all duration-500 ${isActive ? 'bg-rose-50 ring-2 ring-rose-200 scale-105' : 'bg-transparent'}`}>
                          <button
                            onClick={() => toggleSymptom(s)}
                            className={`w-full px-5 py-4 rounded-[1.7rem] text-sm font-black border-2 transition-all ${isActive ? 'bg-rose-500 text-white border-rose-500 shadow-xl' : 'bg-white text-slate-500 border-slate-50 hover:border-rose-100 hover:text-rose-600 shadow-sm'}`}
                          >
                            {s}
                          </button>
                          {isActive && (
                            <div className="flex gap-1 justify-center mt-2 p-1 bg-white/50 rounded-xl">
                              {(['Mild', 'Moderate', 'Severe'] as const).map(lvl => (
                                <button 
                                  key={lvl}
                                  onClick={() => updateSymptomIntensity(s, lvl)}
                                  className={`flex-1 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${medicalCase.selectedSymptoms.find(x => x.name === s)?.intensity === lvl ? 'bg-rose-100 text-rose-700' : 'text-slate-300'}`}
                                >
                                  {lvl === 'Mild' ? 'সামান্য' : lvl === 'Moderate' ? 'মাঝারি' : 'তীব্র'}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">অন্য কোনো সমস্যা (বিস্তারিত লিখুন)</label>
                    <textarea 
                      className="w-full px-8 py-6 rounded-[2.5rem] bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-medium h-40 resize-none shadow-inner"
                      placeholder="আপনার সমস্যাগুলো বিস্তারিতভাবে এখানে উল্লেখ করুন..."
                      value={medicalCase.customSymptoms}
                      onChange={e => setMedicalCase({...medicalCase, customSymptoms: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-between items-center px-4">
                <button onClick={() => setActiveStep(1)} className="px-10 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-800 transition-all flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                   পিছনে
                </button>
                <button onClick={() => setActiveStep(3)} className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-3 active:scale-95">
                  পরবর্তী: রিপোর্ট ও ঔষধ
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Reports & Medications */}
          {activeStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
               <section className="glass-card rounded-[3rem] p-10 md:p-12 shadow-2xl">
                <div className="flex flex-col items-center text-center mb-12">
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center text-3xl mb-4 shadow-inner">💊</div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">রিপোর্ট ও বর্তমান ঔষধ</h3>
                   <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Medical History Context</p>
                </div>

                <div className="space-y-12">
                  <div>
                    <div className="flex justify-between items-center mb-6 px-4">
                      <label className="text-sm font-black text-slate-800 uppercase tracking-wider">বর্তমানে ব্যবহৃত ঔষধসমূহ</label>
                      <button 
                        onClick={() => setMedicalCase({...medicalCase, currentMedications: [...medicalCase.currentMedications, { name: '', dosage: '' }]})}
                        className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:scale-110 active:scale-95 transition-all"
                      >
                        + ঔষধ যোগ করুন
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {medicalCase.currentMedications.map((med, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-emerald-200 transition-all items-center shadow-sm">
                          <input className="flex-grow bg-transparent text-sm font-bold outline-none text-slate-800" placeholder="ঔষধের নাম লিখুন" value={med.name} onChange={e => {
                            const updated = [...medicalCase.currentMedications];
                            updated[idx].name = e.target.value;
                            setMedicalCase({...medicalCase, currentMedications: updated});
                          }} />
                          <input className="w-24 bg-white px-3 py-1.5 rounded-lg text-[10px] font-black outline-none text-emerald-600 border border-emerald-100 text-center" placeholder="মাত্রা" value={med.dosage} onChange={e => {
                            const updated = [...medicalCase.currentMedications];
                            updated[idx].dosage = e.target.value;
                            setMedicalCase({...medicalCase, currentMedications: updated});
                          }} />
                          <button onClick={() => setMedicalCase({...medicalCase, currentMedications: medicalCase.currentMedications.filter((_, i) => i !== idx)})} className="p-2 text-rose-300 hover:text-rose-500"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-6 px-4">
                      <label className="text-sm font-black text-slate-800 uppercase tracking-wider">টেস্ট রিপোর্টস</label>
                      <button onClick={() => setMedicalCase({ ...medicalCase, tests: [...medicalCase.tests, { name: settings.availableTests[0], result: '' }] })} className="px-6 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:scale-110 active:scale-95 transition-all">+ রিপোর্ট যোগ করুন</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {medicalCase.tests.map((test, idx) => (
                        <div key={idx} className="p-6 bg-slate-50/50 rounded-3xl space-y-4 relative border-2 border-slate-100 hover:border-blue-200 transition-all shadow-sm">
                          <button onClick={() => setMedicalCase({...medicalCase, tests: medicalCase.tests.filter((_, i) => i !== idx)})} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                          <select className="w-full bg-white px-4 py-3 rounded-2xl text-xs font-black border-none shadow-sm" value={test.name} onChange={e => {
                            const updated = [...medicalCase.tests];
                            updated[idx].name = e.target.value;
                            setMedicalCase({...medicalCase, tests: updated});
                          }}>{settings.availableTests.map(t => <option key={t}>{t}</option>)}</select>
                          <input className="w-full bg-white px-4 py-3 rounded-2xl text-xs font-bold border-none shadow-sm" placeholder="ফলাফল লিখুন..." value={test.result} onChange={e => {
                            const updated = [...medicalCase.tests];
                            updated[idx].result = e.target.value;
                            setMedicalCase({...medicalCase, tests: updated});
                          }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-between items-center px-4">
                <button onClick={() => setActiveStep(2)} className="px-10 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-800 transition-all flex items-center gap-2">পিছনে</button>
                <button 
                  onClick={() => onSubmit(profile, medicalCase)} 
                  disabled={isLoading || !isProfileValid}
                  className="px-16 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl hover:shadow-blue-300 hover:scale-105 transition-all active:scale-95 flex items-center gap-4 group"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <span>প্রেসক্রিপশন তৈরি করুন</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
