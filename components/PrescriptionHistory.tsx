
import React from 'react';
import { PrescriptionEntry } from '../types';

interface PrescriptionHistoryProps {
  entries: PrescriptionEntry[];
  onView: (entry: PrescriptionEntry) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export const PrescriptionHistory: React.FC<PrescriptionHistoryProps> = ({ entries, onView, onRemove, onClose }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2 px-4">
        <button onClick={onClose} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] hover:text-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>
          পিছনে
        </button>
        <div className="text-right">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">প্রেসক্রিপশন হিস্টোরি</h2>
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">সর্বশেষ ৫টি সংরক্ষিত আছে</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="glass-card rounded-[3rem] p-20 text-center space-y-4">
          <div className="text-6xl grayscale opacity-20">📄</div>
          <p className="font-black text-slate-300 uppercase tracking-widest">এখনো কোনো প্রেসক্রিপশন তৈরি করা হয়নি</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.slice().reverse().map((entry) => (
            <div key={entry.id} className="glass-card rounded-[2.5rem] p-6 hover:shadow-2xl hover:-translate-y-1 transition-all group border border-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">📄</div>
                  <div>
                    <h4 className="font-black text-slate-800 truncate max-w-[150px]">{entry.prescription.diagnosis}</h4>
                    <p className="text-[10px] font-bold text-slate-400">{new Date(entry.timestamp).toLocaleDateString('bn-BD')} | {new Date(entry.timestamp).toLocaleTimeString('bn-BD')}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove(entry.id); }}
                  className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => onView(entry)}
                  className="flex-grow py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-200"
                >
                  বিস্তারিত দেখুন
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
