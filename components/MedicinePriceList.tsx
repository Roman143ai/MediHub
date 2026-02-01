
import React, { useState, useMemo } from 'react';
import { PriceListItem } from '../types';

interface MedicinePriceListProps {
  items: PriceListItem[];
  onOrderNow?: (medicineName: string) => void;
}

export const MedicinePriceListView: React.FC<MedicinePriceListProps> = ({ items, onOrderNow }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category || 'General')))], [items]);

  const filteredAndSorted = useMemo(() => {
    let result = items.filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || 
                           i.generic.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || (i.category || 'General') === activeCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    return result;
  }, [items, search, activeCategory, sortBy]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={i} className="bg-amber-200 text-slate-900 rounded-sm px-0.5">{part}</span> 
        : part
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <section className="glass-card rounded-[3rem] p-10 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>

        <div className="flex flex-col items-center text-center mb-10">
           <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center text-3xl mb-4 shadow-inner">💰</div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight">ঔষধের মূল্য তালিকা</h2>
           <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-[0.3em]">Verified Pharmacy Price Index</p>
        </div>

        {/* Search & Sorting Container */}
        <div className="space-y-4 mb-10">
          <div className="relative group">
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="অফিসিয়াল তালিকা থেকে ঔষধ খুঁজুন..." 
              className="w-full px-10 py-6 rounded-3xl bg-slate-50 border-4 border-transparent focus:border-amber-400 focus:bg-white outline-none font-black text-xl text-slate-800 transition-all shadow-inner"
            />
            <div className="absolute right-6 top-6 text-slate-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 px-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap transition-all border-2 ${activeCategory === cat ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-amber-200 hover:text-amber-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase">সাজান:</span>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-white border-2 border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:border-amber-400 text-slate-600"
              >
                <option value="name">নাম অনুযায়ী</option>
                <option value="price-asc">দাম (কম থেকে বেশি)</option>
                <option value="price-desc">দাম (বেশি থেকে কম)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic List Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAndSorted.length > 0 ? filteredAndSorted.map(item => (
            <div key={item.id} className="p-8 bg-white rounded-[2.5rem] border-2 border-slate-50 hover:border-amber-400 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-amber-50 text-[8px] font-black text-amber-600 uppercase rounded-full border border-amber-100">{item.category || 'General'}</span>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">
                    {highlightText(item.name, search)}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                    {highlightText(item.generic, search)}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-4xl font-black text-slate-800 tracking-tighter group-hover:scale-110 transition-transform origin-right">৳{item.price}</div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">{item.unit || 'per piece'}</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase truncate max-w-[120px] md:max-w-[180px]">{item.company}</p>
                </div>
                <button 
                  onClick={() => onOrderNow?.(`${item.name} (${item.generic})`)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-inner"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  অর্ডার
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-24 text-center space-y-6">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-5xl grayscale opacity-20">🛒</div>
               <div className="space-y-2">
                 <p className="font-black text-2xl text-slate-300 uppercase tracking-widest">তালিকায় কোনো ঔষধ নেই</p>
                 <p className="text-slate-400 text-sm font-medium">অ্যাডমিন কর্তৃক ঔষধ যোগ করার পর এখানে দেখা যাবে।</p>
               </div>
            </div>
          )}
        </div>
      </section>

      <div className="glass-card rounded-[2.5rem] p-8 text-center border-white/50 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-amber-50/20 to-transparent pointer-events-none"></div>
         <div className="flex items-center justify-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-amber-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">গুরুত্বপূর্ণ তথ্য</p>
         </div>
         <p className="text-xs font-bold text-slate-500 italic max-w-2xl mx-auto leading-relaxed">
            ঔষধের মূল্য বাজারভেদে এবং এলাকাভেদে ভিন্ন হতে পারে। এখানে দেখানো মূল্যসমূহ অ্যাডমিন কর্তৃক নির্ধারিত এবং একটি আনুমানিক ধারণা মাত্র।
         </p>
      </div>
    </div>
  );
};
