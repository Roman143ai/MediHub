
import React, { useRef } from 'react';
import { PatientProfile, Prescription, AppSettings } from '../types';

interface PrescriptionViewProps {
  profile: PatientProfile;
  prescription: Prescription;
  onReset: () => void;
  settings: AppSettings;
}

export const PrescriptionView: React.FC<PrescriptionViewProps> = ({ profile, prescription, onReset, settings }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
        const printWindow = window.open('', '', 'height=1000,width=900');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Prescription</title>');
            printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
            printWindow.document.write('<style>@page { size: auto; margin: 5mm; } body { font-family: sans-serif; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 800);
        }
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500 max-w-4xl mx-auto pb-10 px-2">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 print:shadow-none print:border-none" ref={printRef}>
        
        {/* Prescription Header Banner */}
        {settings.banners.prescriptionHeader ? (
          <div className="w-full">
            <img src={settings.banners.prescriptionHeader} className="w-full object-cover" alt="Header" />
          </div>
        ) : (
          <div className="px-8 py-6 bg-white border-b-4 border-blue-600 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-blue-600 tracking-tighter">MediConsult AI</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Health Assistant • Bangladesh</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-700">তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
              <p className="text-[9px] font-black text-blue-500 uppercase">Ref: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            </div>
          </div>
        )}

        {/* Patient Bar */}
        <div className="px-8 py-3 bg-slate-50 border-b border-slate-100 grid grid-cols-4 gap-4 text-xs">
          <div><span className="text-slate-400 font-bold mr-1">নাম:</span> <span className="font-bold">{profile.name}</span></div>
          <div><span className="text-slate-400 font-bold mr-1">বয়স:</span> <span className="font-bold">{profile.age}</span></div>
          <div><span className="text-slate-400 font-bold mr-1">লিঙ্গ:</span> <span className="font-bold">{profile.gender === 'Male' ? 'পুরুষ' : 'মহিলা'}</span></div>
          <div><span className="text-slate-400 font-bold mr-1">রক্ত:</span> <span className="font-bold">{profile.bloodGroup}</span></div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row min-h-[500px] divide-x divide-slate-100">
          <div className="w-full md:w-1/3 p-6 space-y-6">
            <section>
              <h3 className="text-[10px] font-black text-blue-600 uppercase mb-2">রোগ নির্ণয় (Diagnosis)</h3>
              <div className="text-sm font-bold text-slate-800 leading-snug bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                {prescription.diagnosis}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-emerald-600 uppercase mb-2">পরামর্শ (Advice)</h3>
              <div className="text-[12px] text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                {prescription.advice}
              </div>
            </section>
          </div>

          <div className="w-full md:w-2/3 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-serif font-black text-blue-600 italic">Rx.</span>
              <div className="h-0.5 flex-1 bg-slate-100"></div>
            </div>

            <div className="space-y-4">
              {prescription.medications.map((med, i) => (
                <div key={i} className="pb-4 border-b border-slate-50 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="text-[15px] font-black text-slate-900">{med.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Generic: {med.genericName}</p>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <p className="text-[10px] font-black text-blue-500 italic">{med.purpose}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center mt-2">
                    <div className="text-[12px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                      {med.dosage}
                    </div>
                    <div className="text-[11px] font-bold text-slate-500">
                      সময়কাল: {med.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prescription Footer Banner */}
        {settings.banners.prescriptionFooter ? (
          <div className="w-full mt-6">
            <img src={settings.banners.prescriptionFooter} className="w-full object-cover" alt="Footer" />
          </div>
        ) : (
          <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-[8px] text-slate-400 font-medium italic max-w-xs">
              সতর্কবার্তা: এটি একটি এআই চালিত মূল্যায়ন। যেকোনো ঔষধ সেবনের পূর্বে রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন।
            </p>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-800 uppercase tracking-tighter">MediConsult Digital Pad</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 no-print">
        <button onClick={onReset} className="flex-1 px-8 py-4 bg-white text-slate-700 rounded-2xl font-black border-2 border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          নতুন প্রোফাইল
        </button>
        <button onClick={handlePrint} className="flex-[1.5] px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 transform hover:-translate-y-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          সেভ / প্রিন্ট করুন
        </button>
      </div>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
};
