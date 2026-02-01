
import React, { useState } from 'react';
import { searchMedicine } from '../services/geminiService';

export const MedicineSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await searchMedicine(query);
      setResult(data);
    } catch (err) {
      setError("তথ্য খুঁজে পাওয়া যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <section className="glass-card rounded-[3rem] p-10 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center text-center mb-10">
           <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center text-3xl mb-4 shadow-inner">🔍</div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">বিকল্প ঔষধ খুঁজুন</h2>
           <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Medicine & Generic Alternatives</p>
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ঔষধের নাম বা জেনেরিক নাম লিখুন (যেমন: Napa বা Paracetamol)"
            className="w-full px-8 py-6 rounded-[2.5rem] bg-slate-50 border-4 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-black text-xl text-slate-800 transition-all shadow-inner pr-20"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-3 top-3 bottom-3 px-6 bg-emerald-500 text-white rounded-[2rem] shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
          >
            {loading ? <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {['Napa', 'Fexo', 'Seclo', 'Pantix', 'Entacyd'].map(pop => (
            <button 
              key={pop} 
              onClick={() => { setQuery(pop); }}
              className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
            >
              {pop}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="p-6 bg-rose-50 border-2 border-rose-200 text-rose-700 rounded-3xl font-bold text-center animate-bounce">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="glass-card rounded-[2.5rem] p-8 border-l-8 border-emerald-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Generic Name</p>
                <h3 className="text-2xl font-black text-emerald-600">{result.genericName}</h3>
              </div>
              <div className="bg-emerald-50 px-4 py-2 rounded-2xl">
                <span className="text-[10px] font-black text-emerald-600 uppercase">Type: {result.searchType}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.alternatives.map((alt: any, i: number) => (
              <div key={i} className="glass-card rounded-[2rem] p-6 hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{alt.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase">{alt.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">৳ {alt.price}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{alt.strength}</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/20 w-1/3"></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[9px] text-slate-400 font-bold italic py-4">
            সতর্কীকরণ: ঔষধের দাম বাজারভেদে ভিন্ন হতে পারে। ঔষধ কেনার আগে অবশ্যই রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন।
          </p>
        </div>
      )}
    </div>
  );
};
