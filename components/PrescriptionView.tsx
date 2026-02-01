
import React, { useRef, useState } from 'react';
import { PatientProfile, Prescription, AppSettings } from '../types';

interface PrescriptionViewProps {
  profile: PatientProfile;
  prescription: Prescription;
  onReset: () => void;
  settings: AppSettings;
}

export const PrescriptionView: React.FC<PrescriptionViewProps> = ({ profile, prescription, onReset, settings }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
        const printWindow = window.open('', '', 'height=1000,width=900');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Prescription</title>');
            printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
            printWindow.document.write('<style>@page { size: auto; margin: 0; } body { font-family: sans-serif; margin: 0; padding: 0; }</style>');
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

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element || typeof (window as any).html2pdf === 'undefined') {
      alert('PDF লাইব্রেরি লোড হচ্ছে, দয়া করে একটু অপেক্ষা করুন।');
      return;
    }

    setIsDownloading(true);

    // Optimized options for A4 high-quality PDF
    const options = {
      margin: 0, // We handle padding inside the element for better control
      filename: `Prescription_${profile.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 3, // Higher scale for crystal clear text
        useCORS: true, 
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800 // Consistent width for A4 proportion rendering
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // Temporarily enforce a width to ensure the layout is captured in A4 proportion
      const originalWidth = element.style.width;
      element.style.width = '800px'; 
      
      await (window as any).html2pdf().from(element).set(options).save();
      
      // Restore original width
      element.style.width = originalWidth;
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('PDF ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500 max-w-4xl mx-auto pb-10 px-2">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 print:shadow-none print:border-none" ref={printRef} style={{ minHeight: '1120px' }}>
        
        {/* Prescription Header Banner */}
        {settings.banners.prescriptionHeader ? (
          <div className="w-full">
            <img src={settings.banners.prescriptionHeader} className="w-full object-cover" alt="Header" />
          </div>
        ) : (
          <div className="px-8 py-8 bg-white border-b-4 border-blue-600 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black text-blue-600 tracking-tighter">{settings.prescriptionTitle}</h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{settings.prescriptionSubtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700">তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
              <p className="text-[10px] font-black text-blue-500 uppercase mt-1">Ref: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            </div>
          </div>
        )}

        {/* Patient Bar */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 grid grid-cols-4 gap-4 text-xs">
          <div className="flex flex-col"><span className="text-[9px] text-slate-400 font-black uppercase mb-0.5">রোগীর নাম</span> <span className="font-bold text-slate-800">{profile.name}</span></div>
          <div className="flex flex-col"><span className="text-[9px] text-slate-400 font-black uppercase mb-0.5">বয়স</span> <span className="font-bold text-slate-800">{profile.age} বছর</span></div>
          <div className="flex flex-col"><span className="text-[9px] text-slate-400 font-black uppercase mb-0.5">লিঙ্গ</span> <span className="font-bold text-slate-800">{profile.gender === 'Male' ? 'পুরুষ' : 'মহিলা'}</span></div>
          <div className="flex flex-col"><span className="text-[9px] text-slate-400 font-black uppercase mb-0.5">রক্তের গ্রুপ</span> <span className="font-bold text-slate-800">{profile.bloodGroup}</span></div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row min-h-[700px] divide-x divide-slate-100">
          {/* Left Column (Symptoms & Diagnosis) */}
          <div className="w-full md:w-1/3 p-8 space-y-8 bg-slate-50/20">
            <section>
              <h3 className="text-[10px] font-black text-blue-600 uppercase mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                রোগ নির্ণয় (Diagnosis)
              </h3>
              <div className="text-[13px] font-bold text-slate-800 leading-snug bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 shadow-sm">
                {prescription.diagnosis}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-emerald-600 uppercase mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                পরামর্শ (Advice)
              </h3>
              <div className="text-[12px] text-slate-600 leading-relaxed font-medium whitespace-pre-line bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/30">
                {prescription.advice}
              </div>
            </section>

            <section className="pt-4 border-t border-slate-100">
              <h3 className="text-[9px] font-black text-slate-400 uppercase mb-2">ফলো-আপ</h3>
              <p className="text-[11px] font-bold text-slate-600">৭ দিন পর আবার যোগাযোগ করুন।</p>
            </section>
          </div>

          {/* Right Column (Medicines) */}
          <div className="w-full md:w-2/3 p-8">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-5xl font-serif font-black text-blue-600 italic select-none">Rx.</span>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-100 to-transparent"></div>
            </div>

            <div className="space-y-6">
              {prescription.medications.map((med, i) => (
                <div key={i} className="pb-5 border-b border-slate-50 last:border-0 group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-[16px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">{med.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Generic: {med.genericName}</p>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <p className="text-[10px] font-black text-blue-500 italic">{med.purpose}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center mt-3">
                    <div className="text-[12px] font-black text-blue-700 bg-blue-50 px-4 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                      {med.dosage}
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      সময়কাল: {med.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prescription Footer Banner */}
        {settings.banners.prescriptionFooter ? (
          <div className="w-full mt-auto">
            <img src={settings.banners.prescriptionFooter} className="w-full object-cover" alt="Footer" />
          </div>
        ) : (
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center mt-auto">
            <div className="max-w-[70%]">
              <p className="text-[9px] text-slate-400 font-bold leading-relaxed">
                <span className="text-blue-500 font-black uppercase mr-1">সতর্কবার্তা:</span> 
                এই প্রেসক্রিপশনটি এআই দ্বারা তৈরি। যেকোনো ঔষধ সেবনের পূর্বে অবশ্যই একজন রেজিস্টার্ড এমবিবিএস ডাক্তারের পরামর্শ নিন। কোনো পার্শ্বপ্রতিক্রিয়া দেখা দিলে ঔষধ বন্ধ করে দ্রুত চিকিৎসকের শরণাপন্ন হন।
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{settings.prescriptionTitle} Digital Pad</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">www.mediconsult.ai</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row gap-4 no-print px-2">
        <button 
          onClick={onReset} 
          className="flex-1 px-6 py-4 bg-white text-slate-600 rounded-2xl font-black border-2 border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          নতুন প্রোফাইল
        </button>
        
        <button 
          onClick={handleDownloadPDF} 
          disabled={isDownloading}
          className={`flex-1 px-6 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl ${isDownloading ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'}`}
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              ডাউনলোড হচ্ছে...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              PDF ডাউনলোড (A4)
            </>
          )}
        </button>

        <button 
          onClick={handlePrint} 
          className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          প্রিন্ট করুন
        </button>
      </div>
      
      <style>{`
        @media print { 
          .no-print { display: none !important; } 
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};
