
import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  // Ref to track if navigation change is from back button
  const isPopStateRef = useRef(false);

  // Sync function to load all data from storage
  const syncData = useCallback(() => {
    const safeParse = (key: string, fallback: any) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) {
        return fallback;
      }
    };

    setSettings(safeParse('mediConsult_settings', INITIAL_SETTINGS));
    setPriceList(safeParse('mediConsult_priceList', []));
    setOrders(safeParse('mediConsult_orders', []));
    
    const user = safeParse('mediConsult_currentUser', null);
    if (user) {
      setCurrentUser(user);
      setIsAdmin(!!user.isAdmin);
    }
  }, []);

  // Back button (History) management
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
      resetNavigation();
      setActivePrescription(null);
      setTimeout(() => { isPopStateRef.current = false; }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Logic to push state whenever a view opens
  const navigateTo = (viewSetter: (val: boolean) => void) => {
    resetNavigation();
    viewSetter(true);
    if (!isPopStateRef.current) {
      window.history.pushState({ view: 'subpage' }, '');
    }
  };

  useEffect(() => {
    syncData();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('mediConsult_')) {
        syncData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [syncData]);

  useEffect(() => {
    if (isOrderView) {
      const count = orders.filter(o => o.patientId === activeProfile?.id).reduce((acc, o) => acc + (o.messages?.length || 0), 0);
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
    window.dispatchEvent(new Event('storage'));
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
    window.dispatchEvent(new Event('storage'));
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
          messages: [...(o.messages || []), { sender: 'user' as const, text, timestamp: Date.now() }]
        };
      }
      return o;
    });
    handleUpdateOrders(newOrders);
  };

  const handleOrderNowFromList = (medicineName: string) => {
    setPrefilledMedicine(medicineName);
    navigateTo(setIsOrderView);
  };

  const handleFormSubmit = async (profile: PatientProfile, medicalCase: MedicalCase) => {
    setLoading(true);
    setError(null);
    handleProfileUpdate(profile);
    try {
      const result = await generatePrescription(profile, medicalCase);
      setActivePrescription(result);
      
      // Push state so back button returns to form
      window.history.pushState({ view: 'prescription' }, '');

      const newEntry: PrescriptionEntry = {
        id: Math.random().toString(36).substr(2, 9),
        patientId: profile.id,
        prescription: result,
        timestamp: Date.now()
      };
      
      const newHistory = [...prescriptionHistory, newEntry].slice(-5);
      setPrescriptionHistory(newHistory);
      localStorage.setItem('mediConsult_history', JSON.stringify(newHistory));

      resetNavigation();
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
    resetNavigation();
  };

  const currentTheme = THEMES.find(t => t.id === settings.activeThemeId) || THEMES[0];

  useEffect(() => {
    document.body.style.background = currentTheme.bgGradient;
    document.documentElement.style.setProperty('--primary-color', currentTheme.primary);
    document.documentElement.style.setProperty('--secondary-color', currentTheme.secondary);
  }, [currentTheme]);

  const currentOrdersMessagesCount = orders.filter(o => o.patientId === activeProfile?.id).reduce((acc, o) => acc + (o.messages?.length || 0), 0);
  const unreadCount = currentOrdersMessagesCount - lastViewedOrdersCount;
  const userHistory = prescriptionHistory.filter(h => h.patientId === activeProfile?.id);

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const isHomeView = !isAdmin && !isSearchView && !isOrderView && !isPriceListView && !isHistoryView && !activePrescription;

  return (
    <Layout 
      isAdmin={isAdmin} 
      setAdmin={() => navigateTo(setIsAdmin)} 
      isProfileView={isProfileView} 
      setProfileView={() => navigateTo(setIsProfileView)} 
      isSearchView={isSearchView}
      setSearchView={() => navigateTo(setIsSearchView)}
      isOrderView={isOrderView}
      setOrderView={() => navigateTo(setIsOrderView)}
      isPriceListView={isPriceListView}
      setPriceListView={() => navigateTo(setIsPriceListView)}
      theme={currentTheme}
      profile={activeProfile}
      unreadCount={unreadCount > 0 ? unreadCount : 0}
      onLogout={handleLogout}
      settings={settings}
    >
      {isHomeView && settings.banners?.homeHeader && (
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
          onView={(entry) => { 
            setActivePrescription(entry.prescription); 
            setIsHistoryView(false); 
            window.history.pushState({ view: 'prescription' }, '');
          }} 
          onRemove={handleRemoveHistory}
          onClose={() => { resetNavigation(); window.history.back(); }}
        />
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {!activePrescription && (
            <>
              {activeProfile && <WelcomeBanner profile={activeProfile} settings={settings} />}
              <HomeDashboard 
                onOpenPriceList={() => navigateTo(setIsPriceListView)}
                onOpenOrder={() => navigateTo(setIsOrderView)}
                onOpenSearch={() => navigateTo(setIsSearchView)}
                onOpenAdmin={() => navigateTo(setIsAdmin)}
                onOpenHistory={() => navigateTo(setIsHistoryView)}
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
                onReset={() => { resetCase(); window.history.back(); }}
                settings={settings}
              />
            )
          )}

          {isHomeView && settings.homeFooterText && (
            <div className="mt-12 p-8 text-center glass-card rounded-[2.5rem] border border-white/50 animate-in fade-in duration-1000">
               <p className="text-sm font-bold text-slate-500 italic leading-relaxed">
                 {settings.homeFooterText}
               </p>
            </div>
          )}
        </div>
      )}

      {isHomeView && settings.banners?.homeFooter && (
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
