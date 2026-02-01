
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AdminPanel } from './components/AdminPanel';
import { PatientForm } from './components/PatientForm';
import { PrescriptionView } from './components/PrescriptionView';
import { WelcomeBanner } from './components/WelcomeBanner';
import { MedicineSearch } from './components/MedicineSearch';
import { MedicineOrderView } from './components/MedicineOrder';
import { MedicinePriceListView } from './components/MedicinePriceList';
import { HomeDashboard } from './components/HomeDashboard';
import { AuthPage } from './components/AuthPage';
import { PrescriptionHistory } from './components/PrescriptionHistory';
import { AppSettings, PatientProfile, MedicalCase, Prescription, MedicineOrder, PriceListItem, User, PrescriptionEntry } from './types';
import { INITIAL_SETTINGS, THEMES } from './constants';
import { generatePrescription } from './services/geminiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfileView, setIsProfileView] = useState(false);
  const [isSearchView, setIsSearchView] = useState(false);
  const [isOrderView, setIsOrderView] = useState(false);
  const [isPriceListView, setIsPriceListView] = useState(false);
  const [isHistoryView, setIsHistoryView] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeProfile, setActiveProfile] = useState<PatientProfile | null>(null);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [prescriptionHistory, setPrescriptionHistory] = useState<PrescriptionEntry[]>([]);
  const [orders, setOrders] = useState<MedicineOrder[]>([]);
  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [lastViewedOrdersCount, setLastViewedOrdersCount] = useState(0);
  const [prefilledMedicine, setPrefilledMedicine] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('mediConsult_currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAdmin(!!user.isAdmin);
    }

    const savedSettings = localStorage.getItem('mediConsult_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    
    const savedProfile = localStorage.getItem('mediConsult_profile');
    if (savedProfile) setActiveProfile(JSON.parse(savedProfile));
    
    const savedOrders = localStorage.getItem('mediConsult_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    
    const savedPriceList = localStorage.getItem('mediConsult_priceList');
    if (savedPriceList) setPriceList(JSON.parse(savedPriceList));

    const savedHistory = localStorage.getItem('mediConsult_history');
    if (savedHistory) setPrescriptionHistory(JSON.parse(savedHistory));

    const savedLastCount = localStorage.getItem('mediConsult_lastCount');
    if (savedLastCount) setLastViewedOrdersCount(parseInt(savedLastCount));
  }, []);

  useEffect(() => {
    if (isOrderView) {
      const count = orders.filter(o => o.patientId === activeProfile?.id).reduce((acc, o) => acc + o.messages.length, 0);
      setLastViewedOrdersCount(count);
      localStorage.setItem('mediConsult_lastCount', count.toString());
    } else {
      setPrefilledMedicine(null);
    }
  }, [isOrderView, orders, activeProfile]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAdmin(!!user.isAdmin);
    localStorage.setItem('mediConsult_currentUser', JSON.stringify(user));
    
    // Auto-create or find profile for regular users
    if (!user.isAdmin) {
      const savedProfile = localStorage.getItem(`mediConsult_profile_${user.userId}`);
      if (savedProfile) {
        setActiveProfile(JSON.parse(savedProfile));
      } else {
        const newProfile: PatientProfile = {
          id: user.userId,
          name: user.name,
          age: '',
          gender: 'Male',
          bloodGroup: 'Unknown',
          address: '',
          mobile: '',
          previousDiseases: ''
        };
        setActiveProfile(newProfile);
        localStorage.setItem(`mediConsult_profile_${user.userId}`, JSON.stringify(newProfile));
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setActiveProfile(null);
    setActivePrescription(null);
    localStorage.removeItem('mediConsult_currentUser');
    resetNavigation();
  };

  const resetNavigation = () => {
    setIsAdmin(false);
    setIsProfileView(false);
    setIsSearchView(false);
    setIsOrderView(false);
    setIsPriceListView(false);
    setIsHistoryView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSettingsUpdate = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('mediConsult_settings', JSON.stringify(newSettings));
  };

  const handleProfileUpdate = (profile: PatientProfile) => {
    setActiveProfile(profile);
    if (currentUser) {
      localStorage.setItem(`mediConsult_profile_${currentUser.userId}`, JSON.stringify(profile));
      localStorage.setItem('mediConsult_profile', JSON.stringify(profile));
    }
  };

  const handleUpdateOrders = (newOrders: MedicineOrder[]) => {
    setOrders(newOrders);
    localStorage.setItem('mediConsult_orders', JSON.stringify(newOrders));
  };

  const handleUpdatePriceList = (newList: PriceListItem[]) => {
    setPriceList(newList);
    localStorage.setItem('mediConsult_priceList', JSON.stringify(newList));
  };

  const handlePlaceOrder = (orderData: Omit<MedicineOrder, 'id' | 'createdAt' | 'messages' | 'status'>) => {
    const newOrder: MedicineOrder = {
      ...orderData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      status: 'pending',
      messages: []
    };
    handleUpdateOrders([...orders, newOrder]);
  };

  const handleSendMessage = (orderId: string, text: string) => {
    const newOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          messages: [...o.messages, { sender: 'user' as const, text, timestamp: Date.now() }]
        };
      }
      return o;
    });
    handleUpdateOrders(newOrders);
  };

  const handleOrderNowFromList = (medicineName: string) => {
    setPrefilledMedicine(medicineName);
    setIsPriceListView(false);
    setIsOrderView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (profile: PatientProfile, medicalCase: MedicalCase) => {
    setLoading(true);
    setError(null);
    handleProfileUpdate(profile);
    try {
      const result = await generatePrescription(profile, medicalCase);
      setActivePrescription(result);
      
      // Save to history with a limit of 5 entries
      const newEntry: PrescriptionEntry = {
        id: Math.random().toString(36).substr(2, 9),
        patientId: profile.id,
        prescription: result,
        timestamp: Date.now()
      };
      
      // We slice to the last 4 and add the new one to ensure total is max 5
      // This automatically removes the oldest one
      const newHistory = [...prescriptionHistory, newEntry].slice(-5);
      
      setPrescriptionHistory(newHistory);
      localStorage.setItem('mediConsult_history', JSON.stringify(newHistory));

      setIsProfileView(false);
      setIsSearchView(false);
      setIsOrderView(false);
      setIsPriceListView(false);
      setIsHistoryView(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Failed to generate prescription. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveHistory = (id: string) => {
    if (confirm('আপনি কি এই প্রেসক্রিপশনটি ডিলিট করতে চান?')) {
      const newHistory = prescriptionHistory.filter(h => h.id !== id);
      setPrescriptionHistory(newHistory);
      localStorage.setItem('mediConsult_history', JSON.stringify(newHistory));
    }
  };

  const resetCase = () => {
    setActivePrescription(null);
    setError(null);
    setIsProfileView(false);
    setIsSearchView(false);
    setIsOrderView(false);
    setIsPriceListView(false);
    setIsHistoryView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentTheme = THEMES.find(t => t.id === settings.activeThemeId) || THEMES[0];

  useEffect(() => {
    document.body.style.background = currentTheme.bgGradient;
    document.documentElement.style.setProperty('--primary-color', currentTheme.primary);
    document.documentElement.style.setProperty('--secondary-color', currentTheme.secondary);
  }, [currentTheme]);

  const currentOrdersCount = orders.filter(o => o.patientId === activeProfile?.id).reduce((acc, o) => acc + o.messages.length, 0);
  const unreadCount = currentOrdersCount - lastViewedOrdersCount;
  const userHistory = prescriptionHistory.filter(h => h.patientId === activeProfile?.id);

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const isHomeView = !isAdmin && !isSearchView && !isOrderView && !isPriceListView && !isHistoryView && !activePrescription;

  return (
    <Layout 
      isAdmin={isAdmin} 
      setAdmin={setIsAdmin} 
      isProfileView={isProfileView} 
      setProfileView={setIsProfileView} 
      isSearchView={isSearchView}
      setSearchView={setIsSearchView}
      isOrderView={isOrderView}
      setOrderView={setIsOrderView}
      isPriceListView={isPriceListView}
      setPriceListView={setIsPriceListView}
      theme={currentTheme}
      profile={activeProfile}
      unreadCount={unreadCount > 0 ? unreadCount : 0}
      onLogout={handleLogout}
    >
      {isHomeView && settings.banners.homeHeader && (
        <div className="w-full mb-8 rounded-[2rem] overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-1000">
          <img src={settings.banners.homeHeader} className="w-full object-cover" alt="Home Header" />
        </div>
      )}

      {isAdmin ? (
        <AdminPanel 
          settings={settings} 
          onUpdate={handleSettingsUpdate} 
          themes={THEMES} 
          orders={orders}
          priceList={priceList}
          onUpdateOrders={handleUpdateOrders}
          onUpdatePriceList={handleUpdatePriceList}
        />
      ) : isSearchView ? (
        <MedicineSearch />
      ) : isOrderView ? (
        <MedicineOrderView 
          profile={activeProfile} 
          orders={orders} 
          onPlaceOrder={handlePlaceOrder}
          onSendMessage={handleSendMessage}
          initialMedicine={prefilledMedicine || ''}
        />
      ) : isPriceListView ? (
        <MedicinePriceListView items={priceList} onOrderNow={handleOrderNowFromList} />
      ) : isHistoryView ? (
        <PrescriptionHistory 
          entries={userHistory} 
          onView={(entry) => { setActivePrescription(entry.prescription); setIsHistoryView(false); }} 
          onRemove={handleRemoveHistory}
          onClose={() => setIsHistoryView(false)}
        />
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {!activePrescription && (
            <>
              {activeProfile && <WelcomeBanner profile={activeProfile} />}
              <HomeDashboard 
                onOpenPriceList={() => setIsPriceListView(true)}
                onOpenOrder={() => setIsOrderView(true)}
                onOpenSearch={() => setIsSearchView(true)}
                onOpenAdmin={() => setIsAdmin(true)}
                onOpenHistory={() => setIsHistoryView(true)}
                unreadCount={unreadCount > 0 ? unreadCount : 0}
              />
            </>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-bounce">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
               {error}
            </div>
          )}

          {!activePrescription ? (
            <div className="pt-2">
              <PatientForm 
                settings={settings} 
                onSubmit={handleFormSubmit} 
                isLoading={loading} 
                existingProfile={activeProfile}
                isEditModeOnly={isProfileView}
                onSaveProfile={handleProfileUpdate}
              />
            </div>
          ) : (
            activeProfile && (
              <PrescriptionView 
                profile={activeProfile} 
                prescription={activePrescription} 
                onReset={resetCase}
                settings={settings}
              />
            )
          )}
        </div>
      )}

      {isHomeView && settings.banners.homeFooter && (
        <div className="w-full mt-12 mb-4 rounded-[2rem] overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <img src={settings.banners.homeFooter} className="w-full object-cover" alt="Home Footer" />
        </div>
      )}

      <style>{`
        :root {
          --primary: ${currentTheme.primary};
          --secondary: ${currentTheme.secondary};
        }
        .glass-card {
          background: ${currentTheme.cardBg} !important;
          color: ${settings.activeThemeId === 'dark' ? '#f8fafc' : '#1e293b'} !important;
        }
        ${settings.activeThemeId === 'dark' ? `
          input, textarea, select {
            background-color: #334155 !important;
            color: #f8fafc !important;
            border-color: #475569 !important;
          }
          label { color: #94a3b8 !important; }
          h3, h1 { color: #f1f5f9 !important; }
        ` : ''}
      `}</style>
    </Layout>
  );
};

export default App;
