
import React, { useState, useEffect } from 'react';
import { AppSettings, Theme, MedicineOrder, PriceListItem, OrderMessage } from '../types';
import { ImageCropper } from './ImageCropper';

interface AdminPanelProps {
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
  themes: Theme[];
  orders: MedicineOrder[];
  priceList: PriceListItem[];
  onUpdateOrders: (orders: MedicineOrder[]) => void;
  onUpdatePriceList: (list: PriceListItem[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  settings, 
  onUpdate, 
  themes, 
  orders, 
  priceList,
  onUpdateOrders,
  onUpdatePriceList
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'orders' | 'prices' | 'symptoms' | 'tests' | 'account' | 'banners'>('orders');
  const [inputValue, setInputValue] = useState('');
  const [testInputValue, setTestInputValue] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Banner cropping state
  const [croppingBanner, setCroppingBanner] = useState<{ type: keyof typeof settings.banners; image: string } | null>(null);

  // Account settings state
  const [adminUserId, setAdminUserId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    const creds = JSON.parse(localStorage.getItem('mediConsult_adminCreds') || '{"userId":"1","password":"1"}');
    setAdminUserId(creds.userId);
    setAdminPassword(creds.password);
  }, []);

  const handleUpdateAdminAccount = () => {
    if (!adminUserId || !adminPassword) {
      alert("ইউজার আইডি এবং পাসওয়ার্ড অবশ্যই দিতে হবে।");
      return;
    }
    localStorage.setItem('mediConsult_adminCreds', JSON.stringify({ userId: adminUserId, password: adminPassword }));
    alert("অ্যাডমিন লগইন তথ্য সফলভাবে পরিবর্তন করা হয়েছে। পরবর্তী লগইনের জন্য এটি মনে রাখুন।");
  };

  const handleBannerFile = (type: keyof typeof settings.banners, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCroppingBanner({ type, image: reader.result as string });
        e.target.value = ''; // Reset input
      };
      reader.readAsDataURL(file);
    }
  };

  const clearBanner = (type: keyof typeof settings.banners) => {
    onUpdate({
      ...settings,
      banners: {
        ...settings.banners,
        [type]: ''
      }
    });
  };
  
  // Price List form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pGeneric, setPGeneric] = useState('');
  const [pCompany, setPCompany] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCategory, setPCategory] = useState('General');
  const [pUnit, setPUnit] = useState('Per Piece');

  const handleAddOrUpdatePrice = () => {
    if (!pName || !pPrice) return;
    
    if (editingId) {
      onUpdatePriceList(priceList.map(item => 
        item.id === editingId 
          ? { ...item, name: pName, generic: pGeneric, company: pCompany, price: pPrice, category: pCategory, unit: pUnit }
          : item
      ));
      setEditingId(null);
    } else {
      const newItem: PriceListItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: pName,
        generic: pGeneric,
        company: pCompany,
        price: pPrice,
        category: pCategory,
        unit: pUnit
      };
      onUpdatePriceList([...priceList, newItem]);
    }
    
    // Reset fields
    setPName(''); setPGeneric(''); setPCompany(''); setPPrice(''); setPCategory('General'); setPUnit('Per Piece');
  };

  const startEdit = (item: PriceListItem) => {
    setEditingId(item.id);
    setPName(item.name);
    setPGeneric(item.generic);
    setPCompany(item.company);
    setPPrice(item.price);
    setPCategory(item.category || 'General');
    setPUnit(item.unit || 'Per Piece');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemovePrice = (id: string) => {
    if (confirm('আপনি কি এই ঔষধটি তালিকা থেকে মুছে ফেলতে চান?')) {
      onUpdatePriceList(priceList.filter(i => i.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const handleStatusChange = (orderId: string, status: MedicineOrder['status']) => {
    onUpdateOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleAdminReply = () => {
    if (!selectedOrderId || !replyText.trim()) return;
    const newOrders = orders.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          messages: [...o.messages, { sender: 'admin' as const, text: replyText, timestamp: Date.now() }]
        };
      }
      return o;
    });
    onUpdateOrders(newOrders);
    setReplyText('');
  };

  const activeOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {croppingBanner && (
        <ImageCropper
          image={croppingBanner.image}
          aspectRatio={1500 / 300} // Horizontal Banner Aspect Ratio
          onCropComplete={(cropped) => {
            onUpdate({
              ...settings,
              banners: {
                ...settings.banners,
                [croppingBanner.type]: cropped
              }
            });
            setCroppingBanner(null);
          }}
          onCancel={() => setCroppingBanner(null)}
        />
      )}

      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">অ্যাডমিন ড্যাশবোর্ড</h2>
          <p className="text-slate-500 text-sm font-medium">সিস্টেম কন্ট্রোল ও ম্যানেজমেন্ট</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100">Admin Mode Active</div>
      </div>

      <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar bg-slate-50/30">
        {[ 'orders', 'prices', 'banners', 'themes', 'symptoms', 'tests', 'account' ].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 min-w-[120px] py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {tab === 'orders' ? 'অর্ডারসমূহ' : 
             tab === 'prices' ? 'মূল্য তালিকা' : 
             tab === 'banners' ? 'ব্যানার' :
             tab === 'themes' ? 'থিম' : 
             tab === 'tests' ? 'টেস্টসমূহ' :
             tab === 'account' ? 'অ্যাকাউন্ট' : 'লক্ষণ'}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-8">
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
              {orders.length === 0 ? <p className="text-slate-300 font-bold italic text-center py-10">কোনো অর্ডার পাওয়া যায়নি</p> : 
                orders.slice().reverse().map(o => (
                  <button key={o.id} onClick={() => setSelectedOrderId(o.id)} className={`w-full p-6 rounded-3xl border-2 transition-all text-left relative ${selectedOrderId === o.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase">ID: {o.id.substring(0,6)}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase bg-white/20`}>{o.status}</span>
                    </div>
                    <h4 className="font-black truncate mb-1">{o.patientName}</h4>
                    <p className="text-[10px] opacity-70 mb-2 truncate">{o.medicines}</p>
                    <p className={`text-[8px] font-black ${selectedOrderId === o.id ? 'text-indigo-200' : 'text-slate-400'}`}>{new Date(o.createdAt).toLocaleString()}</p>
                  </button>
                ))
              }
            </div>
            <div className="md:col-span-2">
              {activeOrder ? (
                <div className="glass-card rounded-[2.5rem] flex flex-col h-[600px] shadow-lg border border-slate-100 overflow-hidden">
                   <div className="p-6 bg-slate-50 flex justify-between items-center border-b border-slate-100">
                      <div>
                        <h4 className="font-black text-slate-800">{activeOrder.patientName}</h4>
                        <p className="text-xs font-bold text-slate-400">{activeOrder.phone} | {activeOrder.address}</p>
                      </div>
                      <select 
                        value={activeOrder.status} 
                        onChange={e => handleStatusChange(activeOrder.id, e.target.value as any)}
                        className="bg-white px-4 py-2 rounded-xl text-xs font-black border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                   </div>
                   
                   <div className="flex-grow p-6 overflow-y-auto space-y-4 no-scrollbar">
                      <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-6">
                        <p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Order Description</p>
                        <p className="font-bold text-slate-800">{activeOrder.medicines}</p>
                        <p className="text-xs font-black text-indigo-600 mt-1">Quantity: {activeOrder.quantity}</p>
                      </div>

                      {activeOrder.messages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold shadow-sm ${m.sender === 'admin' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                            {m.text}
                            <div className={`text-[8px] mt-1 opacity-50 ${m.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                              {new Date(m.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                   </div>

                   <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdminReply()} placeholder="রিপ্লাই লিখুন..." className="flex-grow px-6 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold text-sm" />
                      <button onClick={handleAdminReply} className="px-6 bg-slate-900 text-white rounded-xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all">পাঠান</button>
                   </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-50 rounded-[2.5rem] p-10">
                   <p className="font-black uppercase tracking-[0.2em]">Select an order to manage</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prices' && (
          <div className="space-y-6">
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-3xl border transition-all ${editingId ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
               <div className="md:col-span-3 flex justify-between items-center mb-2">
                 <h4 className="text-sm font-black uppercase text-slate-500">{editingId ? 'ঔষধ আপডেট করুন' : 'নতুন ঔষধ যোগ করুন'}</h4>
                 {editingId && <button onClick={() => { setEditingId(null); setPName(''); setPGeneric(''); setPCompany(''); setPPrice(''); }} className="text-[10px] font-black text-rose-500 uppercase">বাতিল করুন</button>}
               </div>
               <input value={pName} onChange={e => setPName(e.target.value)} placeholder="ঔষধের নাম" className="px-4 py-3 rounded-xl border border-slate-200 font-bold text-xs outline-none focus:border-blue-500" />
               <input value={pGeneric} onChange={e => setPGeneric(e.target.value)} placeholder="জেনেরিক" className="px-4 py-3 rounded-xl border border-slate-200 font-bold text-xs outline-none focus:border-blue-500" />
               <input value={pCompany} onChange={e => setPCompany(e.target.value)} placeholder="কোম্পানি" className="px-4 py-3 rounded-xl border border-slate-200 font-bold text-xs outline-none focus:border-blue-500" />
               <input value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="দাম (৳)" className="px-4 py-3 rounded-xl border border-slate-200 font-bold text-xs outline-none focus:border-blue-500" />
               <select value={pCategory} onChange={e => setPCategory(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200 font-bold text-xs outline-none focus:border-blue-500 bg-white">
                 <option>General</option>
                 <option>Tablets</option>
                 <option>Syrups</option>
                 <option>Antibiotics</option>
                 <option>Vitamins</option>
                 <option>Cardiovascular</option>
                 <option>Pain Relief</option>
               </select>
               <input value={pUnit} onChange={e => setPUnit(e.target.value)} placeholder="ইউনিট (উদা: প্রতি পিস/পাতা)" className="px-4 py-3 rounded-xl border border-slate-200 font-bold text-xs outline-none focus:border-blue-500" />
               <button onClick={handleAddOrUpdatePrice} className={`md:col-span-3 px-6 py-4 text-white rounded-xl font-black text-sm hover:scale-[1.02] transition-all shadow-lg ${editingId ? 'bg-amber-600 shadow-amber-100' : 'bg-blue-600 shadow-blue-100'}`}>
                 {editingId ? 'তথ্য আপডেট করুন' : 'তালিকা আপডেট করুন'}
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {priceList.length === 0 ? (
                 <div className="col-span-full py-10 text-center text-slate-300 font-bold italic">তালিকায় কোনো ঔষধ নেই</div>
               ) : priceList.map(item => (
                 <div key={item.id} className={`p-5 bg-white rounded-3xl border flex justify-between items-center group transition-all ${editingId === item.id ? 'ring-2 ring-amber-500 border-amber-500' : 'border-slate-100 hover:border-blue-200 shadow-sm'}`}>
                    <div className="flex-grow">
                      <div className="flex gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-slate-50 text-[7px] font-black uppercase text-slate-400 rounded-md">{item.category}</span>
                      </div>
                      <h5 className="font-black text-slate-800">{item.name}</h5>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{item.generic}</p>
                      <p className="text-[12px] font-black text-blue-600 mt-1">৳ {item.price} <span className="text-[8px] text-slate-400 uppercase">({item.unit})</span></p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => startEdit(item)} className="p-2 text-slate-200 hover:text-amber-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                      <button onClick={() => handleRemovePrice(item.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4">
            {[
              { id: 'homeHeader', label: 'Home Page Header' },
              { id: 'homeFooter', label: 'Home Page Footer' },
              { id: 'prescriptionHeader', label: 'Prescription Header' },
              { id: 'prescriptionFooter', label: 'Prescription Footer' }
            ].map(banner => (
              <div key={banner.id} className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{banner.label}</h4>
                  {settings.banners[banner.id as keyof typeof settings.banners] && (
                    <button onClick={() => clearBanner(banner.id as any)} className="text-rose-500 text-[10px] font-black uppercase hover:underline">রিমুভ করুন</button>
                  )}
                </div>
                
                <div className="relative group aspect-[3/1] bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                  {settings.banners[banner.id as keyof typeof settings.banners] ? (
                    <img src={settings.banners[banner.id as keyof typeof settings.banners]} className="w-full h-full object-cover" alt={banner.label} />
                  ) : (
                    <div className="text-center p-4">
                      <div className="text-3xl mb-2">🖼️</div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">ব্যানার ইমেজ আপলোড করুন</p>
                    </div>
                  )}
                  <label className="absolute inset-0 cursor-pointer bg-slate-900/0 hover:bg-slate-900/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-900 shadow-xl">ছবি পরিবর্তন</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerFile(banner.id as any, e)} />
                  </label>
                </div>
                <p className="text-[9px] font-medium text-slate-400 italic">প্রস্তাবিত সাইজ: ১৫০০ x ৩০০ পিক্সেল (JPG/PNG)</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => onUpdate({...settings, activeThemeId: t.id})}
                className={`relative group flex flex-col items-center gap-3 p-4 rounded-3xl transition-all ${settings.activeThemeId === t.id ? 'bg-slate-100 scale-105 shadow-inner' : 'hover:bg-slate-50'}`}
              >
                <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden flex flex-col" style={{ background: t.bgGradient }}>
                   <div className="h-1/2 w-full" style={{ backgroundColor: t.primary }}></div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${settings.activeThemeId === t.id ? 'text-blue-600' : 'text-slate-400'}`}>{t.name}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'symptoms' && (
          <>
            <div className="flex gap-4">
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="নতুন লক্ষণ যোগ করুন..." className="flex-grow px-6 py-3.5 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 transition-all font-bold" />
              <button onClick={() => {
                if (!inputValue.trim()) return;
                onUpdate({...settings, symptoms: [...settings.symptoms, inputValue]});
                setInputValue('');
              }} className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 shadow-lg shadow-blue-100">যোগ করুন</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings.symptoms.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <span className="text-sm font-bold text-slate-700">{item}</span>
                  <button onClick={() => onUpdate({...settings, symptoms: settings.symptoms.filter(i => i !== item)})} className="text-slate-300 hover:text-rose-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'tests' && (
          <>
            <div className="flex gap-4">
              <input type="text" value={testInputValue} onChange={(e) => setTestInputValue(e.target.value)} placeholder="নতুন টেস্ট যোগ করুন..." className="flex-grow px-6 py-3.5 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 transition-all font-bold" />
              <button onClick={() => {
                if (!testInputValue.trim()) return;
                onUpdate({...settings, availableTests: [...settings.availableTests, testInputValue]});
                setTestInputValue('');
              }} className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 shadow-lg shadow-blue-100">যোগ করুন</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings.availableTests.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <span className="text-sm font-bold text-slate-700">{item}</span>
                  <button onClick={() => onUpdate({...settings, availableTests: settings.availableTests.filter(i => i !== item)})} className="text-slate-300 hover:text-rose-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'account' && (
          <div className="max-w-md mx-auto space-y-8 animate-in fade-in zoom-in-95">
             <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner mb-4">🔑</div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">অ্যাডমিন অ্যাকাউন্ট সেটিংস</h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Update your login credentials</p>
             </div>

             <div className="space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">নতুন ইউজার আইডি (New Admin ID)</label>
                   <input 
                     type="text" 
                     value={adminUserId} 
                     onChange={e => setAdminUserId(e.target.value)}
                     className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-800 transition-all shadow-sm"
                     placeholder="New ID"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">নতুন পাসওয়ার্ড (New Password)</label>
                   <input 
                     type="password" 
                     value={adminPassword} 
                     onChange={e => setAdminPassword(e.target.value)}
                     className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-800 transition-all shadow-sm"
                     placeholder="New Password"
                   />
                </div>
                <button 
                  onClick={handleUpdateAdminAccount}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  পরিবর্তন সেভ করুন
                </button>
             </div>
             <p className="text-center text-[10px] font-bold text-slate-400 leading-relaxed italic px-4">
                সতর্কতা: ইউজার আইডি বা পাসওয়ার্ড পরিবর্তন করলে তা কোথাও লিখে রাখুন। এটি ভুলে গেলে অ্যাডমিন প্যানেলে লগইন করা সম্ভব হবে না।
             </p>
          </div>
        )}
      </div>
    </div>
  );
};
