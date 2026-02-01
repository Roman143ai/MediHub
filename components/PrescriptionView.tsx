
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
            printWindow.document.write('<style>@page { size: A4; margin: 0; } body { font-family: sans-serif; margin: 0; padding: 0; }</style>');
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

    // Precise A4 sizing (794px width is approx 210mm at 96dpi)
    const options = {
      margin: 0,
      filename: `Prescription_${profile.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true,
        width: 794 // Fixed width for A4 consistency
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // Temporary style to ensure content fits A4 perfectly during capture
      const originalStyle = element.getAttribute('style') || '';
      element.style.width = '794px';
      element.style.minHeight = '1123px'; // A4 height ratio
      
      await (window as any).html2pdf().from(element).set(options).save();
      
      element.setAttribute('style', originalStyle);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('PDF ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500 max-w-4xl mx-auto pb-10 px-2">
      {/* The Printable Container */}
      <div 
        className="bg-white shadow-xl overflow-hidden border border-slate-200 print:shadow-none print:border-none mx-auto" 
        ref={printRef} 
        style={{ width: '100%', maxWidth: '800px', minHeight: '1123px', display: 'flex', flexDirection: 'column' }}
      >
        
        {/* Prescription Header */}
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
        <div className="flex flex-1 divide-x divide-slate-100">
          {/* Left Column */}
          <div className="w-1/3 p-8 space-y-8 bg-slate-50/20">
            <section>
              <h3 className="text-[10px] font-black text-blue-600 uppercase mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                রোগ নির্ণয় (Diagnosis)
              </h3>
              <div className="text-[13px] font-bold text-slate-800 leading-snug bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
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
          </div>

          {/* Right Column (Medicines) */}
          <div className="w-2/3 p-8">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-5xl font-serif font-black text-blue-600 italic select-none">Rx.</span>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-100 to-transparent"></div>
            </div>

            <div className="space-y-6">
              {prescription.medications.map((med, i) => (
                <div key={i} className="pb-5 border-b border-slate-50 last:border-0">
                  <h4 className="text-[16px] font-black text-slate-900">{med.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Generic: {med.genericName}</p>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <p className="text-[10px] font-black text-blue-500 italic">{med.purpose}</p>
                  </div>
                  <div className="flex gap-4 items-center mt-3">
                    <div className="text-[12px] font-black text-blue-700 bg-blue-50 px-4 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                      {med.dosage}
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      সময়কাল: {med.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prescription Footer */}
        {settings.banners.prescriptionFooter ? (
          <div className="w-full">
            <img src={settings.banners.prescriptionFooter} className="w-full object-cover" alt="Footer" />
          </div>
        ) : (
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <div className="max-w-[70%]">
              <p className="text-[9px] text-slate-400 font-bold leading-relaxed">
                সতর্কবার্তা: এটি একটি এআই চালিত মূল্যায়ন। যেকোনো ঔষধ সেবনের পূর্বে ডাক্তারের পরামর্শ নিন।
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{settings.prescriptionTitle}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">www.mediconsult.ai</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 no-print px-2 pt-4">
        <button onClick={onReset} className="flex-1 px-6 py-4 bg-white text-slate-600 rounded-2xl font-black border-2 border-slate-100 hover:bg-slate-50 transition-all shadow-sm">
          নতুন প্রোফাইল
        </button>
        
        <button 
          onClick={handleDownloadPDF} 
          disabled={isDownloading}
          className={`flex-1 px-6 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl ${isDownloading ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'}`}
        >
          {isDownloading ? 'ডাউনলোড হচ্ছে...' : 'PDF ডাউনলোড (A4)'}
        </button>

        <button onClick={handlePrint} className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 shadow-blue-200 transition-all">
          প্রিন্ট করুন
        </button>
      </div>
    </div>
  );
};
