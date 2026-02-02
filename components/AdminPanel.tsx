
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

type AdminTab = 'themes' | 'orders' | 'prices' | 'symptoms' | 'history' | 'tests' | 'account' | 'banners' | 'users' | 'home' | 'doctor';

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  settings, 
  onUpdate, 
  themes, 
  orders, 
  priceList,
  onUpdateOrders,
  onUpdatePriceList
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  
  // Local states for inputs
  const [inputValue, setInputValue] = useState('');
  const [historyInputValue, setHistoryInputValue] = useState('');
  const [testInputValue, setTestInputValue] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [croppingBanner, setCroppingBanner] = useState<{ type: keyof typeof settings.banners | 'signature'; image: string } | null>(null);
  
  // Admin & Branding States
  const [adminUserId, setAdminUserId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [prescriptionTitle, setPrescriptionTitle] = useState(settings.prescriptionTitle);
  const [prescriptionSubtitle, setPrescriptionSubtitle] = useState(settings.prescriptionSubtitle);
  const [homeWelcomeTitle, setHomeWelcomeTitle] = useState(settings.homeWelcomeTitle || 'স্বাগতম!');
  const [homeWelcomeSubtitle, setHomeWelcomeSubtitle] = useState(settings.homeWelcomeSubtitle || 'আপনার সুস্বাস্থ্য আমাদের লক্ষ্য।');
  const [homeFooterText, setHomeFooterText] = useState(settings.homeFooterText || '');
  const [websiteUrl, setWebsiteUrl] = useState(settings.websiteUrl || 'www.mediconsult.ai');

  // Doctor Details Local State
  const [docName, setDocName] = useState(settings.doctorDetails.name);
  const [docDegree, setDocDegree] = useState(settings.doctorDetails.degree);
  const [docDesignation, setDocDesignation] = useState(settings.doctorDetails.designation);
  const [docSpecialty, setDocSpecialty] = useState(settings.doctorDetails.specialty);
  const [docWorkplace, setDocWorkplace] = useState(settings.doctorDetails.workplace);

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
    onUpdate({ ...settings, homeWelcomeTitle, homeWelcomeSubtitle, homeFooterText });
    alert("হোম পেজ কাস্টমাইজেশন সফলভাবে সেভ হয়েছে।");
  };

  const handleSaveDoctorDetails = () => {
    onUpdate({ 
      ...settings, 
      prescriptionTitle, // also allow saving title here as requested
      websiteUrl,
      doctorDetails: {
        name: docName,
        degree: docDegree,
        designation: docDesignation,
        specialty: docSpecialty,
        workplace: docWorkplace
      }
    });
    alert("ডাক্তার ও ফুটার তথ্য আপডেট হয়েছে।");
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

  const handleBannerFile = (type: keyof typeof settings.banners | 'signature', e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Define tab categories for easier navigation
  const menuGroups = [
    {
      title: 'ম্যানেজমেন্ট',
      items: [
        { id: 'orders', label: 'অর্ডার', icon: '📦' },
        { id: 'prices', label: 'মূল্য তালিকা', icon: '৳' },
        { id: 'users', label: 'ইউজার', icon: '👥' },
      ]
    },
    {
      title: 'মেডিকেল সেটিংস',
      items: [
        { id: 'symptoms', label: 'লক্ষণ', icon: '🤒' },
        { id: 'history', label: 'ইতিহাস', icon: '📜' },
        { id: 'tests', label: 'টেস্ট', icon: '🧪' },
        { id: 'doctor', label: 'ডাক্তার ও ফুটার', icon: '👨‍⚕️' },
      ]
    },
    {
      title: 'কাস্টমাইজেশন',
      items: [
        { id: 'home', label: 'হোম UI', icon: '🏠' },
        { id: 'banners', label: 'ব্যানার', icon: '🖼️' },
        { id: 'themes', label: 'থিম', icon: '🎨' },
      ]
    },
    {
      title: 'সিস্টেম',
      items: [
        { id: 'account', label: 'অ্যাকাউন্ট', icon: '⚙️' },
      ]
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px] bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {croppingBanner && (
        <ImageCropper
          image={croppingBanner.image}
          aspectRatio={croppingBanner.type === 'signature' ? 3 / 1 : (String(croppingBanner.type).includes('Header') || String(croppingBanner.type).includes('Footer') ? 5 / 1 : 1)}
          onCropComplete={(cropped) => {
            if (croppingBanner.type === 'signature') {
              onUpdate({ ...settings, signatureImage: cropped });
            } else {
              onUpdate({ ...settings, banners: { ...settings.banners, [croppingBanner.type as string]: cropped } });
            }
            setCroppingBanner(null);
          }}
          onCancel={() => setCroppingBanner(null)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-slate-50/50 border-r border-slate-100 flex flex-col p-4">
        <div className="mb-6 px-4 py-2">
           <h2 className="text-xl font-black text-slate-800 tracking-tight">অ্যাডমিন প্যানেল</h2>
           <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Master Dashboard</p>
        </div>
        
        <nav className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
          {menuGroups.map(group => (
            <div key={group.title} className="space-y-1">
              <h3 className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{group.title}</h3>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-h-[800px] no-scrollbar">
        
        <header className="mb-8 flex justify-between items-center">
           <div>
              <h1 className="text-2xl font-black text-slate-900 capitalize">{activeTab === 'doctor' ? 'Doctor & Footer' : activeTab} Management</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage and configure your application</p>
           </div>
           <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500">
             MediConsult Admin v2.1
           </div>
        </header>

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="xl:col-span-1 space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
              {orders.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                   <p className="text-slate-300 font-bold uppercase text-[10px]">কোনো অর্ডার নেই</p>
                </div>
              ) : orders.slice().reverse().map(o => (
                <button key={o.id} onClick={() => setSelectedOrderId(o.id)} className={`w-full p-5 rounded-[2rem] border-2 transition-all text-left ${selectedOrderId === o.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[8px] font-black uppercase opacity-60">ID: {o.id.substring(0,6)}</p>
                    <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase ${o.status === 'confirmed' ? 'bg-emerald-400' : 'bg-amber-400'} text-white`}>{o.status}</span>
                  </div>
                  <h4 className="font-black truncate text-sm">{o.patientName}</h4>
                  <p className="text-[9px] truncate mt-1 opacity-80">{o.medicines}</p>
                </button>
              ))}
            </div>
            <div className="xl:col-span-2">
              {activeOrder ? (
                <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col h-[600px] shadow-sm">
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200">
                    <div>
                      <h4 className="text-xl font-black text-slate-800">{activeOrder.patientName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activeOrder.phone}</p>
                    </div>
                    <select value={activeOrder.status} onChange={e => handleStatusChange(activeOrder.id, e.target.value as any)} className="bg-white px-4 py-2 rounded-xl text-[10px] font-black border border-slate-200 outline-none">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex-grow overflow-y-auto space-y-4 no-scrollbar mb-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-3 tracking-widest">অর্ডার ডিটেইলস</p>
                      <div className="space-y-2">
                         <p className="text-sm font-bold text-slate-700">ঔষধ: <span className="font-medium text-slate-500">{activeOrder.medicines}</span></p>
                         <p className="text-sm font-bold text-slate-700">পরিমাণ: <span className="font-medium text-slate-500">{activeOrder.quantity}</span></p>
                         <p className="text-sm font-bold text-slate-700">ঠিকানা: <span className="font-medium text-slate-500">{activeOrder.address}</span></p>
                      </div>
                    </div>
                    {(activeOrder.messages || []).map((m, idx) => (
                      <div key={idx} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-[11px] font-bold shadow-sm ${m.sender === 'admin' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200'}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="রিপ্লাই লিখুন..." className="flex-grow px-6 py-4 rounded-2xl bg-white border border-slate-200 outline-none text-xs font-bold" />
                    <button onClick={handleAdminReply} className="px-8 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg">পাঠান</button>
                  </div>
                </div>
              ) : <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                  <div className="text-6xl">📦</div>
                  <p className="font-black uppercase text-xs tracking-widest">অর্ডার সিলেক্ট করুন</p>
                </div>}
            </div>
          </div>
        )}

        {/* --- PRICES TAB --- */}
        {activeTab === 'prices' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-6">{editingPriceId ? 'ঔষধ তথ্য আপডেট করুন' : 'নতুন ঔষধ যোগ করুন'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 ml-4">নাম</label>
                   <input value={pName} onChange={e => setPName(e.target.value)} placeholder="উদা: Napa" className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 ml-4">জেনেরিক</label>
                   <input value={pGeneric} onChange={e => setPGeneric(e.target.value)} placeholder="উদা: Paracetamol" className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 ml-4">মূল্য (৳)</label>
                   <input value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="উদা: ১.৫" className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold outline-none" />
                </div>
                <button onClick={handleAddOrUpdatePrice} className="col-span-full py-4 bg-amber-500 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-amber-100 hover:scale-[1.01] transition-all">সংরক্ষণ করুন</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {priceList.map(item => (
                <div key={item.id} className="p-5 bg-white rounded-[2rem] border border-slate-100 flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
                  <div>
                    <h4 className="font-black text-sm text-slate-800">{item.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.generic} • ৳ {item.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingPriceId(item.id); setPName(item.name); setPGeneric(item.generic); setPPrice(item.price); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button onClick={() => onUpdatePriceList(priceList.filter(p => p.id !== item.id))} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-6">{editingUserId ? 'ইউজার তথ্য আপডেট' : 'নতুন ইউজার যোগ'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value={uName} onChange={e => setUName(e.target.value)} placeholder="নাম" className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold outline-none" />
                <input value={uId} onChange={e => setUId(e.target.value)} placeholder="ইউজার আইডি (Mobile/ID)" className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold outline-none" />
                <input value={uPass} onChange={e => setUPass(e.target.value)} placeholder="পাসওয়ার্ড" className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold outline-none" />
                <button onClick={handleSaveUser} className="col-span-full py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-xl">ইউজার সেভ করুন</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(u => (
                <div key={u.userId} className="p-6 bg-white rounded-3xl border border-slate-100 flex justify-between items-center group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center font-black">
                       {u.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-800">{u.name}</h4>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">ID: {u.userId} • Pass: {u.password}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingUserId(u.userId); setUName(u.name); setUId(u.userId); setUPass(u.password); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                    <button onClick={() => { if(confirm('ডিলিট করতে চান?')) { const up = users.filter(usr => usr.userId !== u.userId); setUsers(up); localStorage.setItem('mediConsult_users', JSON.stringify(up)); window.dispatchEvent(new Event('storage')); } }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- LIST EDITORS (SYMPTOMS, HISTORY, TESTS) --- */}
        {['symptoms', 'history', 'tests'].includes(activeTab) && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-4 items-end shadow-sm">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">নতুন {activeTab === 'symptoms' ? 'লক্ষণ' : activeTab === 'history' ? 'ইতিহাস' : 'টেস্ট'} নাম</label>
                <input 
                  value={activeTab === 'symptoms' ? inputValue : activeTab === 'history' ? historyInputValue : testInputValue} 
                  onChange={(e) => {
                    if (activeTab === 'symptoms') setInputValue(e.target.value);
                    else if (activeTab === 'history') setHistoryInputValue(e.target.value);
                    else setTestInputValue(e.target.value);
                  }} 
                  placeholder="এখানে লিখুন..." 
                  className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold text-sm shadow-sm" 
                />
              </div>
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
                className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >যোগ করুন</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(settings as any)[activeTab === 'symptoms' ? 'symptoms' : activeTab === 'history' ? 'medicalHistories' : 'availableTests'].map((item: string) => (
                <div key={item} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
                  <span className="text-xs font-bold text-slate-700">{item}</span>
                  <button onClick={() => {
                    const key = activeTab === 'symptoms' ? 'symptoms' : activeTab === 'history' ? 'medicalHistories' : 'availableTests';
                    onUpdate({ ...settings, [key]: (settings as any)[key].filter((i: string) => i !== item) });
                  }} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- DOCTOR TAB --- */}
        {activeTab === 'doctor' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-8 shadow-sm">
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-800">ডাক্তার ও ফুটার সেটআপ</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Prescription Doctor & Footer Information</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">নাম</label>
                    <input value={docName} onChange={e => setDocName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold shadow-sm" placeholder="উদা: ডাঃ রিমন মাহমুদ" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">শিক্ষাগত যোগ্যতা</label>
                    <input value={docDegree} onChange={e => setDocDegree(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold shadow-sm" placeholder="MBBS, BCS (Health)" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">পদবী</label>
                    <input value={docDesignation} onChange={e => setDocDesignation(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold shadow-sm" placeholder="মেডিকেল অফিসার" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">বিশেষজ্ঞতা</label>
                    <input value={docSpecialty} onChange={e => setDocSpecialty(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold shadow-sm" placeholder="জেনারেল ফিজিশিয়ান" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">কর্মস্থল</label>
                    <input value={docWorkplace} onChange={e => setDocWorkplace(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold shadow-sm" placeholder="ঢাকা মেডিকেল কলেজ হাসপাতাল" />
                  </div>
              </div>

              {/* Added Footer Branding Section */}
              <div className="pt-6 border-t border-slate-200 space-y-6">
                <h4 className="text-[11px] font-black uppercase text-blue-600 tracking-widest text-center">ফুটার ব্র্যান্ডিং সেটিংস</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">ফুটার টাইটেল</label>
                    <input value={prescriptionTitle} onChange={e => setPrescriptionTitle(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold shadow-sm" placeholder="উদা: MediConsult AI" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">ওয়েবসাইট ইউআরএল</label>
                    <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold shadow-sm" placeholder="উদা: www.mediconsult.ai" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4 block mb-3">ডিজিটাল স্বাক্ষর (Signature)</label>
                <div className="relative group w-full h-32 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-blue-400">
                  {settings.signatureImage ? (
                    <img src={settings.signatureImage} className="h-full object-contain p-4" alt="Signature" />
                  ) : (
                    <p className="text-[9px] font-black text-slate-300 uppercase">স্বাক্ষর যোগ করুন</p>
                  )}
                  <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">নতুন ছবি আপলোড করুন</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerFile('signature', e)} />
                  </label>
                </div>
              </div>

              <button onClick={handleSaveDoctorDetails} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all">তথ্য আপডেট করুন</button>
            </div>
          </div>
        )}

        {/* --- BANNERS TAB --- */}
        {activeTab === 'banners' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
            {(Object.keys(settings.banners) as Array<keyof typeof settings.banners>).map(key => (
              <div key={key} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{String(key).replace(/([A-Z])/g, ' $1').trim()}</h4>
                  {settings.banners[key] && <button onClick={() => onUpdate({ ...settings, banners: { ...settings.banners, [key]: '' } })} className="text-[8px] font-black text-rose-500 uppercase">মুছে দিন</button>}
                </div>
                <div className="w-full aspect-[5/1] bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
                  {settings.banners[key] ? <img src={settings.banners[key]} className="w-full h-full object-cover" /> : <p className="text-[9px] font-black text-slate-300 uppercase">কোনো ব্যানার নেই</p>}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-white text-[9px] font-black uppercase">আপলোড করুন</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerFile(key as any, e)} />
                  </label>
                </div>
                <p className="mt-3 text-[8px] text-slate-400 font-bold uppercase tracking-tighter text-center">Standard Size: 1000x200 pixels</p>
              </div>
            ))}
          </div>
        )}

        {/* --- HOME TAB --- */}
        {activeTab === 'home' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
             <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-6 shadow-sm">
                <div className="text-center mb-6">
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">হোম পেজ টেক্সট সেটিংস</h3>
                </div>
                
                <div className="space-y-5">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">ওয়েলকাম টাইটেল</label>
                      <input value={homeWelcomeTitle} onChange={e => setHomeWelcomeTitle(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold shadow-sm" placeholder="উদা: স্বাগতম!" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">হোম সাবটাইটেল</label>
                      <input value={homeWelcomeSubtitle} onChange={e => setHomeWelcomeSubtitle(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold shadow-sm" placeholder="আপনার সুস্বাস্থ্য আমাদের লক্ষ্য।" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">ফুটার টেক্সট (Footer Notice)</label>
                      <input value={homeFooterText} onChange={e => setHomeFooterText(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold shadow-sm" placeholder="সুস্থ থাকুন, সঠিক চিকিৎসায় বিশ্বাস রাখুন।" />
                   </div>
                   <button onClick={handleSaveHomeUI} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all">আপডেট করুন</button>
                </div>
             </div>
          </div>
        )}

        {/* --- THEMES TAB --- */}
        {activeTab === 'themes' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {themes.map(t => (
              <button key={t.id} onClick={() => onUpdate({ ...settings, activeThemeId: t.id })} className={`p-6 rounded-[2.5rem] border-4 transition-all text-center flex flex-col items-center ${settings.activeThemeId === t.id ? 'border-blue-600 bg-white shadow-xl scale-105' : 'border-slate-50 bg-slate-50/50 hover:bg-white'}`}>
                <div className="w-16 h-16 rounded-3xl mx-auto mb-4 shadow-xl flex items-center justify-center text-2xl border-4 border-white" style={{ backgroundColor: t.primary }}>
                   {settings.activeThemeId === t.id && '✅'}
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{t.name}</h4>
              </button>
            ))}
          </div>
        )}

        {/* --- ACCOUNT TAB --- */}
        {activeTab === 'account' && (
          <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-300">
             <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-6 shadow-sm">
                <div className="text-center mb-4">
                  <h4 className="text-xl font-black text-slate-800">অ্যাপ ব্র্যান্ডিং (Branding)</h4>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">অ্যাপের নাম (Title)</label>
                     <input value={prescriptionTitle} onChange={e => setPrescriptionTitle(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold shadow-sm" placeholder="MediConsult AI" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">স্লোগান (Subtitle)</label>
                     <input value={prescriptionSubtitle} onChange={e => setPrescriptionSubtitle(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold shadow-sm" placeholder="Smart Healthcare" />
                  </div>
                  <button onClick={handleSaveAppBranding} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase shadow-xl">ব্র্যান্ডিং সেভ করুন</button>
                </div>
             </div>
             
             <div className="bg-slate-900 p-10 rounded-[3rem] space-y-6 shadow-2xl">
                <div className="text-center mb-4">
                  <h4 className="text-xl font-black text-white">সিকিউরিটি সেটিংস (Security)</h4>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">নতুন অ্যাডমিন আইডি</label>
                     <input value={adminUserId} onChange={e => setAdminUserId(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-800 border-none text-white text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter New ID" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">নতুন পাসওয়ার্ড</label>
                     <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-800 border-none text-white text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter New Password" />
                  </div>
                  <button onClick={handleUpdateAdminAccount} className="w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase shadow-xl hover:scale-[1.01] transition-all">লগইন তথ্য আপডেট করুন</button>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};
