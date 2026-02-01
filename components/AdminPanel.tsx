
import React, { useState, useEffect } from 'react';
import { AppSettings, Theme, MedicineOrder, PriceListItem, User, OrderMessage } from '../types';
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
  const [activeTab, setActiveTab] = useState<'themes' | 'orders' | 'prices' | 'symptoms' | 'history' | 'tests' | 'account' | 'banners' | 'users' | 'home'>('orders');
  
  // Local states for inputs
  const [inputValue, setInputValue] = useState('');
  const [historyInputValue, setHistoryInputValue] = useState('');
  const [testInputValue, setTestInputValue] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [croppingBanner, setCroppingBanner] = useState<{ type: keyof typeof settings.banners; image: string } | null>(null);
  
  // Admin & Branding States
  const [adminUserId, setAdminUserId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [prescriptionTitle, setPrescriptionTitle] = useState(settings.prescriptionTitle);
  const [prescriptionSubtitle, setPrescriptionSubtitle] = useState(settings.prescriptionSubtitle);
  const [homeWelcomeTitle, setHomeWelcomeTitle] = useState(settings.homeWelcomeTitle || 'স্বাগতম!');
  const [homeWelcomeSubtitle, setHomeWelcomeSubtitle] = useState(settings.homeWelcomeSubtitle || 'আপনার সুস্বাস্থ্য আমাদের লক্ষ্য।');

  // User Management States
  const [users, setUsers] = useState<User[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [uName, setUName] = useState('');
  const [uId, setUId] = useState('');
  const [uPass, setUPass] = useState('');

  // Price Management States
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pGeneric, setPGeneric] = useState('');
  const [pCompany, setPCompany] = useState('');
  const [pPrice, setPPrice] = useState('');

  useEffect(() => {
    const creds = JSON.parse(localStorage.getItem('mediConsult_adminCreds') || '{"userId":"1","password":"1"}');
    setAdminUserId(creds.userId);
    setAdminPassword(creds.password);
    
    const savedUsers = JSON.parse(localStorage.getItem('mediConsult_users') || '[]');
    setUsers(savedUsers);
  }, []);

  // --- Handlers ---
  const handleUpdateAdminAccount = () => {
    if (!adminUserId || !adminPassword) return alert("আইডি এবং পাসওয়ার্ড দিন।");
    localStorage.setItem('mediConsult_adminCreds', JSON.stringify({ userId: adminUserId, password: adminPassword }));
    window.dispatchEvent(new Event('storage'));
    alert("অ্যাডমিন তথ্য আপডেট হয়েছে।");
  };

  const handleSaveAppBranding = () => {
    onUpdate({ ...settings, prescriptionTitle, prescriptionSubtitle });
    alert("ব্র্যান্ডিং আপডেট হয়েছে।");
  };

  const handleSaveHomeUI = () => {
    onUpdate({ ...settings, homeWelcomeTitle, homeWelcomeSubtitle });
    alert("হোম পেজ কাস্টমাইজেশন সফলভাবে সেভ হয়েছে।");
  };

  const handleSaveUser = () => {
    if (!uId || !uPass) return;
    let updatedUsers = [];
    if (editingUserId) {
      updatedUsers = users.map(u => u.userId === editingUserId ? { name: uName, userId: uId, password: uPass } : u);
    } else {
      updatedUsers = [...users, { name: uName, userId: uId, password: uPass }];
    }
    setUsers(updatedUsers);
    localStorage.setItem('mediConsult_users', JSON.stringify(updatedUsers));
    window.dispatchEvent(new Event('storage'));
    setEditingUserId(null); setUName(''); setUId(''); setUPass('');
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
          messages: [...(o.messages || []), { sender: 'admin' as const, text: replyText, timestamp: Date.now() }]
        };
      }
      return o;
    });
    onUpdateOrders(newOrders);
    setReplyText('');
  };

  const handleAddOrUpdatePrice = () => {
    if (!pName || !pPrice) return;
    if (editingPriceId) {
      onUpdatePriceList(priceList.map(item => 
        item.id === editingPriceId 
          ? { ...item, name: pName, generic: pGeneric, company: pCompany, price: pPrice }
          : item
      ));
      setEditingPriceId(null);
    } else {
      const newItem: PriceListItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: pName, generic: pGeneric, company: pCompany, price: pPrice
      };
      onUpdatePriceList([...priceList, newItem]);
    }
    setPName(''); setPGeneric(''); setPCompany(''); setPPrice('');
  };

  const handleBannerFile = (type: keyof typeof settings.banners, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCroppingBanner({ type, image: reader.result as string });
        e.target.value = ''; 
      };
      reader.readAsDataURL(file);
    }
  };

  const activeOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {croppingBanner && (
        <ImageCropper
          image={croppingBanner.image}
          aspectRatio={croppingBanner.type.includes('Header') || croppingBanner.type.includes('Footer') ? 5 / 1 : 1}
          onCropComplete={(cropped) => {
            onUpdate({ ...settings, banners: { ...settings.banners, [croppingBanner.type]: cropped } });
            setCroppingBanner(null);
          }}
          onCancel={() => setCroppingBanner(null)}
        />
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar bg-slate-50/30">
        {[ 'orders', 'prices', 'banners', 'home', 'themes', 'users', 'symptoms', 'history', 'tests', 'account' ].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 min-w-[90px] py-5 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {tab === 'orders' ? 'অর্ডার' : tab === 'prices' ? 'মূল্য' : tab === 'banners' ? 'ব্যানার' : tab === 'home' ? 'হোম পেজ' : tab === 'themes' ? 'থিম' : tab === 'users' ? 'ইউজার' : tab === 'account' ? 'অ্যাকাউন্ট' : tab === 'history' ? 'ইতিহাস' : tab === 'tests' ? 'টেস্ট' : 'লক্ষণ'}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-8 min-h-[500px]">
        {/* --- HOME TAB --- */}
        {activeTab === 'home' && (
          <div className="max-w-xl mx-auto space-y-8 animate-in fade-in zoom-in-95">
             <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                <div className="text-center">
                   <h3 className="text-lg font-black text-slate-800 tracking-tight">হোম পেজ কাস্টমাইজেশন</h3>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure User Welcome Experience</p>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">ওয়েলকাম টাইটেল (Title)</label>
                      <input value={homeWelcomeTitle} onChange={e => setHomeWelcomeTitle(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold" placeholder="উদা: স্বাগতম!" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">হোম পেজ সাবটাইটেল (Subtitle)</label>
                      <input value={homeWelcomeSubtitle} onChange={e => setHomeWelcomeSubtitle(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold" placeholder="উদা: আপনার সুস্থতা আমাদের লক্ষ্য।" />
                   </div>
                   <button onClick={handleSaveHomeUI} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">হোম পেজ আপডেট করুন</button>
                </div>
             </div>

             <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                <div className="text-2xl">💡</div>
                <div className="space-y-1">
                   <p className="text-xs font-black text-blue-900 uppercase">প্রিভিউ টিপস</p>
                   <p className="text-[10px] font-bold text-blue-700/70 leading-relaxed">
                      ব্যানার পরিবর্তন করার জন্য উপরের 'ব্যানার' ট্যাবে যান। এখানে শুধুমাত্র টেক্সট কন্টেন্ট পরিবর্তন করা যাবে যা ইউজারের হোম পেজের ওয়েলকাম সেকশনে দেখাবে।
                   </p>
                </div>
             </div>
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
              {orders.length === 0 ? (
                <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">কোনো অর্ডার নেই</p>
              ) : orders.slice().reverse().map(o => (
                <button key={o.id} onClick={() => setSelectedOrderId(o.id)} className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${selectedOrderId === o.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                  <p className="text-[8px] font-black uppercase opacity-60 mb-1">ID: {o.id.substring(0,6)} • {o.status}</p>
                  <h4 className="font-black truncate text-xs">{o.patientName}</h4>
                  <p className="text-[8px] truncate mt-1 opacity-80">{o.medicines}</p>
                </button>
              ))}
            </div>
            <div className="md:col-span-2">
              {activeOrder ? (
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col h-[500px]">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                    <div>
                      <h4 className="font-black text-slate-800">{activeOrder.patientName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{activeOrder.phone}</p>
                    </div>
                    <select value={activeOrder.status} onChange={e => handleStatusChange(activeOrder.id, e.target.value as any)} className="bg-white px-3 py-1.5 rounded-xl text-[10px] font-black border border-slate-200">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex-grow overflow-y-auto space-y-3 no-scrollbar mb-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4">
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-1">অর্ডার ডিটেইলস</p>
                      <p className="text-xs font-bold text-slate-700">ঔষধ: {activeOrder.medicines}</p>
                      <p className="text-xs font-bold text-slate-700">পরিমাণ: {activeOrder.quantity}</p>
                      <p className="text-xs font-bold text-slate-700">ঠিকানা: {activeOrder.address}</p>
                    </div>
                    {(activeOrder.messages || []).map((m, idx) => (
                      <div key={idx} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] font-bold shadow-sm ${m.sender === 'admin' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200'}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="রিপ্লাই লিখুন..." className="flex-grow px-4 py-2.5 rounded-xl bg-white border border-slate-200 outline-none text-xs font-bold" />
                    <button onClick={handleAdminReply} className="px-5 bg-blue-600 text-white rounded-xl font-black text-xs">পাঠান</button>
                  </div>
                </div>
              ) : <div className="h-full flex items-center justify-center text-slate-300 font-black uppercase text-xs">অর্ডার সিলেক্ট করুন</div>}
            </div>
          </div>
        )}

        {/* --- PRICES TAB --- */}
        {activeTab === 'prices' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 mb-4">{editingPriceId ? 'ঔষধ আপডেট' : 'নতুন ঔষধ যোগ'}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <input value={pName} onChange={e => setPName(e.target.value)} placeholder="নাম" className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold outline-none" />
                <input value={pGeneric} onChange={e => setPGeneric(e.target.value)} placeholder="জেনেরিক" className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold outline-none" />
                <input value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="মূল্য (৳)" className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold outline-none" />
                <button onClick={handleAddOrUpdatePrice} className="col-span-full md:col-span-1 py-3 bg-amber-500 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-amber-200">সংরক্ষণ করুন</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {priceList.map(item => (
                <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center group">
                  <div>
                    <h4 className="font-black text-xs text-slate-800">{item.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{item.generic} • ৳ {item.price}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingPriceId(item.id); setPName(item.name); setPGeneric(item.generic); setPPrice(item.price); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                    <button onClick={() => onUpdatePriceList(priceList.filter(p => p.id !== item.id))} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- BANNERS TAB --- */}
        {activeTab === 'banners' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(settings.banners) as Array<keyof typeof settings.banners>).map(key => (
              <div key={key} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  {settings.banners[key] && <button onClick={() => onUpdate({ ...settings, banners: { ...settings.banners, [key]: '' } })} className="text-[8px] font-black text-rose-500 uppercase">মুছে দিন</button>}
                </div>
                <div className="w-full h-24 bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
                  {settings.banners[key] ? <img src={settings.banners[key]} className="w-full h-full object-cover" /> : <p className="text-[8px] font-black text-slate-300 uppercase">নো ব্যানার</p>}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-white text-[9px] font-black uppercase">আপলোড করুন</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerFile(key, e)} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- THEMES TAB --- */}
        {activeTab === 'themes' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {themes.map(t => (
              <button key={t.id} onClick={() => onUpdate({ ...settings, activeThemeId: t.id })} className={`p-4 rounded-[2rem] border-4 transition-all text-center ${settings.activeThemeId === t.id ? 'border-blue-600 bg-white' : 'border-slate-50 bg-slate-50/50'}`}>
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 shadow-lg" style={{ backgroundColor: t.primary }}></div>
                <h4 className="text-[9px] font-black text-slate-800 uppercase">{t.name}</h4>
              </button>
            ))}
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <h3 className="text-xs font-black text-slate-800 mb-4">{editingUserId ? 'ইউজার আপডেট' : 'নতুন ইউজার যোগ'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={uName} onChange={e => setUName(e.target.value)} placeholder="নাম" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold" />
                <input value={uId} onChange={e => setUId(e.target.value)} placeholder="ইউজার আইডি" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold" />
                <input value={uPass} onChange={e => setUPass(e.target.value)} placeholder="পাসওয়ার্ড" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold" />
                <button onClick={handleSaveUser} className="col-span-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase">ইউজার সেভ করুন</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {users.map(u => (
                <div key={u.userId} className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center group">
                  <div>
                    <h4 className="font-black text-xs text-slate-800">{u.name}</h4>
                    <p className="text-[9px] font-bold text-blue-600 uppercase">ID: {u.userId} • {u.password}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingUserId(u.userId); setUName(u.name); setUId(u.userId); setUPass(u.password); }} className="p-2 text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                    <button onClick={() => { const up = users.filter(usr => usr.userId !== u.userId); setUsers(up); localStorage.setItem('mediConsult_users', JSON.stringify(up)); window.dispatchEvent(new Event('storage')); }} className="p-2 text-rose-500"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SYMPTOMS, HISTORY, TESTS TABS --- */}
        {['symptoms', 'history', 'tests'].includes(activeTab) && (
          <div className="space-y-6">
            <div className="flex gap-3">
              <input 
                value={activeTab === 'symptoms' ? inputValue : activeTab === 'history' ? historyInputValue : testInputValue} 
                onChange={(e) => {
                  if (activeTab === 'symptoms') setInputValue(e.target.value);
                  else if (activeTab === 'history') setHistoryInputValue(e.target.value);
                  else setTestInputValue(e.target.value);
                }} 
                placeholder={`নতুন ${activeTab === 'symptoms' ? 'লক্ষণ' : activeTab === 'history' ? 'ইতিহাস' : 'টেস্ট'} যোগ করুন...`} 
                className="flex-grow px-5 py-3 rounded-xl border-2 border-slate-100 outline-none font-bold text-xs" 
              />
              <button 
                onClick={() => {
                  const val = activeTab === 'symptoms' ? inputValue : activeTab === 'history' ? historyInputValue : testInputValue;
                  if (!val.trim()) return;
                  const key = activeTab === 'symptoms' ? 'symptoms' : activeTab === 'history' ? 'medicalHistories' : 'availableTests';
                  onUpdate({ ...settings, [key]: [...(settings as any)[key], val] });
                  if (activeTab === 'symptoms') setInputValue('');
                  else if (activeTab === 'history') setHistoryInputValue('');
                  else setTestInputValue('');
                }} 
                className="px-6 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase"
              >যোগ করুন</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(settings as any)[activeTab === 'symptoms' ? 'symptoms' : activeTab === 'history' ? 'medicalHistories' : 'availableTests'].map((item: string) => (
                <div key={item} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700">{item}</span>
                  <button onClick={() => {
                    const key = activeTab === 'symptoms' ? 'symptoms' : activeTab === 'history' ? 'medicalHistories' : 'availableTests';
                    onUpdate({ ...settings, [key]: (settings as any)[key].filter((i: string) => i !== item) });
                  }} className="text-rose-400 hover:text-rose-600 transition-colors">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ACCOUNT TAB --- */}
        {activeTab === 'account' && (
          <div className="max-w-xl mx-auto space-y-8">
             <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest">অ্যাপ ব্র্যান্ডিং</h4>
                <div className="space-y-3">
                  <input value={prescriptionTitle} onChange={e => setPrescriptionTitle(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold" placeholder="প্রেসক্রিপশন টাইটেল" />
                  <input value={prescriptionSubtitle} onChange={e => setPrescriptionSubtitle(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold" placeholder="সাবটাইটেল" />
                  <button onClick={handleSaveAppBranding} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase">ব্র্যান্ডিং সেভ করুন</button>
                </div>
             </div>
             <div className="bg-slate-900 p-6 rounded-[2.5rem] space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-500 text-center tracking-widest">অ্যাডমিন অ্যাকাউন্ট</h4>
                <div className="space-y-3">
                  <input value={adminUserId} onChange={e => setAdminUserId(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-800 border-none text-white text-xs font-bold" placeholder="New Admin ID" />
                  <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-800 border-none text-white text-xs font-bold" placeholder="New Password" />
                  <button onClick={handleUpdateAdminAccount} className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase">লগইন তথ্য আপডেট করুন</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
