
import React, { useState, useEffect } from 'react';
import { MedicineOrder, PatientProfile, OrderMessage } from '../types';

interface MedicineOrderProps {
  profile: PatientProfile | null;
  orders: MedicineOrder[];
  onPlaceOrder: (order: Omit<MedicineOrder, 'id' | 'createdAt' | 'messages' | 'status'>) => void;
  onSendMessage: (orderId: string, text: string) => void;
  initialMedicine?: string;
}

export const MedicineOrderView: React.FC<MedicineOrderProps> = ({ profile, orders, onPlaceOrder, onSendMessage, initialMedicine = '' }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [medicines, setMedicines] = useState(initialMedicine);
  const [quantity, setQuantity] = useState('');
  const [address, setAddress] = useState(profile?.address || '');
  const [phone, setPhone] = useState(profile?.mobile || '');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Handle pre-filled medicine from price list
  useEffect(() => {
    if (initialMedicine) {
      setMedicines(initialMedicine);
      setActiveTab('new');
    }
  }, [initialMedicine]);

  const myOrders = orders.filter(o => o.patientId === profile?.id);
  const activeOrder = myOrders.find(o => o.id === selectedOrderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return alert('অনুগ্রহ করে আগে প্রোফাইল তৈরি করুন।');
    if (!medicines || !quantity || !address || !phone) return alert('সব তথ্য পূরণ করুন।');
    
    onPlaceOrder({
      patientId: profile.id,
      patientName: profile.name,
      medicines,
      quantity,
      address,
      phone
    });
    setMedicines('');
    setQuantity('');
    setActiveTab('history');
  };

  const handleSend = () => {
    if (!selectedOrderId || !replyText.trim()) return;
    onSendMessage(selectedOrderId, replyText);
    setReplyText('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex bg-white/50 p-1 rounded-2xl border border-white/50 mb-4">
        <button onClick={() => setActiveTab('new')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'new' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>অর্ডার করুন</button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>অর্ডার হিস্টোরি ({myOrders.length})</button>
      </div>

      {activeTab === 'new' ? (
        <section className="glass-card rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center text-3xl mb-4 shadow-inner">📦</div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">নতুন ঔষধের অর্ডার</h2>
            <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Fast Home Delivery in Bangladesh</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">ঔষধের নাম ও বিবরণ</label>
              <textarea value={medicines} onChange={e => setMedicines(e.target.value)} placeholder="Napa 500mg, Fexo 120mg..." className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-inner h-32 resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">পরিমাণ (পাতা/পিস)</label>
                <input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="উদা: ২ পাতা" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">ফোন নাম্বার</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="০১xxxxxxxxx" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-inner" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">ডেলিভারি ঠিকানা</label>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="পূর্ণ ঠিকানা লিখুন" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-inner" />
            </div>
            <button type="submit" className="w-full py-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">অর্ডার কনফার্ম করুন</button>
          </form>
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4 max-h-[600px] overflow-y-auto no-scrollbar">
            {myOrders.length === 0 ? (
              <div className="glass-card p-10 text-center rounded-3xl text-slate-400 font-bold italic">কোনো অর্ডার নেই</div>
            ) : (
              myOrders.map(o => (
                <button key={o.id} onClick={() => setSelectedOrderId(o.id)} className={`w-full p-6 rounded-3xl border-2 transition-all text-left ${selectedOrderId === o.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase">ID: {o.id.substring(0,6)}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${o.status === 'confirmed' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{o.status}</span>
                  </div>
                  <h4 className="font-black truncate mb-1">{o.medicines}</h4>
                  <p className={`text-[10px] font-bold ${selectedOrderId === o.id ? 'text-indigo-100' : 'text-slate-400'}`}>{new Date(o.createdAt).toLocaleDateString()}</p>
                </button>
              ))
            )}
          </div>
          <div className="md:col-span-2">
            {activeOrder ? (
              <div className="glass-card rounded-[2.5rem] flex flex-col h-[600px] shadow-2xl overflow-hidden border border-white">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-slate-800">অর্ডার ডিটেইলস</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">অর্ডারের অবস্থা: {activeOrder.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-indigo-600">ID: {activeOrder.id.substring(0,8)}</p>
                  </div>
                </div>
                
                <div className="flex-grow p-6 overflow-y-auto space-y-4 no-scrollbar bg-white/30">
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-sm">
                    <p className="font-black text-indigo-800 mb-1">আপনার রিকোয়েস্ট:</p>
                    <p className="text-slate-600 font-bold">{activeOrder.medicines} ({activeOrder.quantity})</p>
                  </div>
                  
                  {activeOrder.messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold shadow-sm ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                        {m.text}
                        <div className={`text-[8px] mt-1 opacity-50 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                          {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="মেসেজ লিখুন..." className="flex-grow px-6 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold text-sm" />
                  <button onClick={handleSend} className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-[2.5rem] h-full flex flex-col items-center justify-center text-slate-300 p-10 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                <p className="font-black uppercase tracking-widest">একটি অর্ডার সিলেক্ট করুন</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
