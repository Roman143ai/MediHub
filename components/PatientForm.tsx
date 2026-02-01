
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
  const [imageToCrop, setImageToCrop] = useState<{ type: 'profile' | 'test'; index?: number; data: string } | null>(null);

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

  const toggleHistory = (name: string) => {
    if (medicalCase.selectedHistories.includes(name)) {
      setMedicalCase({
        ...medicalCase,
        selectedHistories: medicalCase.selectedHistories.filter(h => h !== name)
      });
    } else {
      setMedicalCase({
        ...medicalCase,
        selectedHistories: [...medicalCase.selectedHistories, name]
      });
    }
  };

  const updateSymptomIntensity = (name: string, intensity: 'Mild' | 'Moderate' | 'Severe') => {
    setMedicalCase({
      ...medicalCase,
      selectedSymptoms: medicalCase.selectedSymptoms.map(s => s.name === name ? { ...s, intensity } : s)
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'test', index?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop({ type, index, data: reader.result as string });
        e.target.value = ''; // Reset input to allow re-selection
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (cropped: string) => {
    if (!imageToCrop) return;

    if (imageToCrop.type === 'profile') {
      setProfile({ ...profile, profilePic: cropped });
    } else if (imageToCrop.type === 'test' && imageToCrop.index !== undefined) {
      const updatedTests = [...medicalCase.tests];
      updatedTests[imageToCrop.index] = { ...updatedTests[imageToCrop.index], imageBase64: cropped };
      setMedicalCase({ ...medicalCase, tests: updatedTests });
    }
    setImageToCrop(null);
  };

  const addTest = (name: string) => {
    if (medicalCase.tests.find(t => t.name === name)) return;
    setMedicalCase({
      ...medicalCase,
      tests: [...medicalCase.tests, { name, result: '' }]
    });
  };

  const removeTest = (index: number) => {
    setMedicalCase({
      ...medicalCase,
      tests: medicalCase.tests.filter((_, i) => i !== index)
    });
  };

  const addMedication = () => {
    setMedicalCase({
      ...medicalCase,
      currentMedications: [...medicalCase.currentMedications, { name: '', dosage: '' }]
    });
  };

  const removeMedication = (index: number) => {
    setMedicalCase({
      ...medicalCase,
      currentMedications: medicalCase.currentMedications.filter((_, i) => i !== index)
    });
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

  if (isEditModeOnly) {
    return (
      <section className="glass-card rounded-[3rem] p-10 md:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto">
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
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, 'profile')} />
            </label>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">প্রোফাইল এডিট করুন</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Health Identity Manager</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <button key={g} onClick={() => setProfile({...profile, gender: g})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${profile.gender === g ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}>{g === 'Male' ? 'পুরুষ' : 'মহিলা'}</button>
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ঠিকানা</label>
            <textarea className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-sm h-24 resize-none" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="আপনার বর্তমান ঠিকানা" />
          </div>
        </div>
        <button onClick={() => onSaveProfile?.(profile)} className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all">সেভ করুন</button>
      </section>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto relative">
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop.data}
          aspectRatio={imageToCrop.type === 'profile' ? 1 : 4/3}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}

      <StepIndicator />

      {activeStep === 1 && (
        <section className="glass-card rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="mb-10 text-center">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">শারীরিক তথ্য (Vitals)</h3>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Essential health metrics</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">ওজন (KG)</label>
              <input type="number" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all" value={medicalCase.vitals.weight} onChange={e => setMedicalCase({...medicalCase, vitals: {...medicalCase.vitals, weight: e.target.value}})} placeholder="00" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">উচ্চতা</label>
              <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all" value={medicalCase.vitals.height} onChange={e => setMedicalCase({...medicalCase, vitals: {...medicalCase.vitals, height: e.target.value}})} placeholder="5'8\"" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">রক্তচাপ (BP)</label>
              <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all" value={medicalCase.vitals.bp} onChange={e => setMedicalCase({...medicalCase, vitals: {...medicalCase.vitals, bp: e.target.value}})} placeholder="120/80" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">পালস (Pulse)</label>
              <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all" value={medicalCase.vitals.pulse} onChange={e => setMedicalCase({...medicalCase, vitals: {...medicalCase.vitals, pulse: e.target.value}})} placeholder="72" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">তাপমাত্রা (°F)</label>
              <input className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all" value={medicalCase.vitals.temp} onChange={e => setMedicalCase({...medicalCase, vitals: {...medicalCase.vitals, temp: e.target.value}})} placeholder="98.6" />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
            <button onClick={() => setActiveStep(2)} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
              পরবর্তী ধাপ
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </section>
      )}

      {activeStep === 2 && (
        <section className="glass-card rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="mb-10 text-center">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">আপনার লক্ষণসমূহ (Symptoms)</h3>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Select and describe symptoms</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {settings.symptoms.map(s => {
              const selected = medicalCase.selectedSymptoms.find(sym => sym.name === s);
              return (
                <div key={s} className="relative group">
                  <button 
                    onClick={() => toggleSymptom(s)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-xs font-black text-center h-full ${selected ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}
                  >
                    {s}
                  </button>
                  {selected && (
                    <div className="absolute -top-2 -right-2 flex gap-1 animate-in zoom-in">
                      {['Mild', 'Moderate', 'Severe'].map(lvl => (
                        <button 
                          key={lvl} 
                          onClick={() => updateSymptomIntensity(s, lvl as any)}
                          className={`w-4 h-4 rounded-full border border-white flex items-center justify-center text-[5px] font-black ${selected.intensity === lvl ? 'bg-amber-400 text-white' : 'bg-white text-slate-300'}`}
                        >
                          {lvl[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">অন্যান্য লক্ষণ (যদি থাকে)</label>
            <textarea className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all h-24 resize-none shadow-inner" value={medicalCase.customSymptoms} onChange={e => setMedicalCase({...medicalCase, customSymptoms: e.target.value})} placeholder="আপনার অন্য কোনো সমস্যা থাকলে এখানে লিখুন..." />
          </div>

          <div className="mt-12 space-y-6">
            <div className="text-center">
              <h4 className="text-xl font-black text-slate-800">অতীতের ইতিহাস (History)</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {settings.medicalHistories.map(h => (
                <button 
                  key={h} 
                  onClick={() => toggleHistory(h)}
                  className={`p-4 rounded-2xl border-2 transition-all text-xs font-black text-center ${medicalCase.selectedHistories.includes(h) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}
                >
                  {h}
                </button>
              ))}
            </div>
            <textarea className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all h-24 resize-none shadow-inner" value={medicalCase.customHistory} onChange={e => setMedicalCase({...medicalCase, customHistory: e.target.value})} placeholder="অন্য কোনো পুরোনো রোগ থাকলে লিখুন..." />
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between">
            <button onClick={() => setActiveStep(1)} className="px-10 py-5 bg-white text-slate-400 rounded-2xl font-black text-sm border-2 border-slate-100 hover:text-slate-600 transition-all">পিছনে</button>
            <button onClick={() => setActiveStep(3)} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">পরবর্তী ধাপ</button>
          </div>
        </section>
      )}

      {activeStep === 3 && (
        <section className="glass-card rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="mb-10 text-center">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">রিপোর্ট ও ঔষধ (Reports & Meds)</h3>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Test results and current medications</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">টেস্ট রিপোর্ট (Select Test)</h4>
              <div className="flex flex-wrap gap-2">
                {settings.availableTests.map(t => (
                  <button key={t} onClick={() => addTest(t)} className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all">+{t}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {medicalCase.tests.map((test, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-[2rem] border-2 border-slate-50 shadow-sm space-y-3 relative group">
                    <button onClick={() => removeTest(idx)} className="absolute top-2 right-2 text-slate-200 hover:text-rose-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                    <div className="font-black text-xs text-blue-600 mb-1">{test.name}</div>
                    <input className="w-full px-4 py-2 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-300 outline-none text-xs font-bold" placeholder="রেজাল্ট লিখুন..." value={test.result} onChange={e => {
                      const updated = [...medicalCase.tests];
                      updated[idx].result = e.target.value;
                      setMedicalCase({...medicalCase, tests: updated});
                    }} />
                    <div className="flex items-center gap-3">
                      {test.imageBase64 ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-inner">
                          <img src={test.imageBase64} className="w-full h-full object-cover" />
                          <button onClick={() => {
                             const updated = [...medicalCase.tests];
                             updated[idx].imageBase64 = undefined;
                             setMedicalCase({...medicalCase, tests: updated});
                          }} className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[8px] font-black uppercase">মুছে দিন</button>
                        </div>
                      ) : (
                        <label className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-[10px] font-black text-slate-500 cursor-pointer hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                          {/* Fix: Close the svg tag properly and ensure the hierarchy is correct. */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, 'test', idx)} />
                          ছবি যোগ করুন
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">বর্তমান ঔষধ (Current Meds)</h4>
                <button onClick={addMedication} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">+ ঔষধ যোগ করুন</button>
              </div>
              <div className="space-y-3">
                {medicalCase.currentMedications.map((med, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input className="flex-[2] px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none text-xs font-bold" placeholder="ঔষধের নাম" value={med.name} onChange={e => {
                      const updated = [...medicalCase.currentMedications];
                      updated[idx].name = e.target.value;
                      setMedicalCase({...medicalCase, currentMedications: updated});
                    }} />
                    <input className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none text-xs font-bold" placeholder="খাওয়ার নিয়ম" value={med.dosage} onChange={e => {
                      const updated = [...medicalCase.currentMedications];
                      updated[idx].dosage = e.target.value;
                      setMedicalCase({...medicalCase, currentMedications: updated});
                    }} />
                    <button onClick={() => removeMedication(idx)} className="text-slate-200 hover:text-rose-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between gap-4">
            <button onClick={() => setActiveStep(2)} className="flex-1 py-5 bg-white text-slate-400 rounded-2xl font-black text-sm border-2 border-slate-100 hover:text-slate-600 transition-all">পিছনে</button>
            <button 
              onClick={() => onSubmit(profile, medicalCase)} 
              disabled={isLoading || !isProfileValid}
              className={`flex-[2] py-5 text-white rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-3 ${isLoading || !isProfileValid ? 'bg-slate-300' : 'bg-emerald-600 hover:scale-[1.02] active:scale-95 shadow-emerald-200'}`}
            >
              {isLoading ? 'প্রেসক্রিপশন তৈরি হচ্ছে...' : 'প্রেসক্রিপশন দেখুন'}
              {!isLoading && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
