
import React from 'react';
import { PatientProfile, Theme } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  isAdmin: boolean;
  setAdmin: (v: boolean) => void;
  isProfileView: boolean;
  setProfileView: (v: boolean) => void;
  isSearchView: boolean;
  setSearchView: (v: boolean) => void;
  isOrderView: boolean;
  setOrderView: (v: boolean) => void;
  isPriceListView: boolean;
  setPriceListView: (v: boolean) => void;
  theme: Theme;
  profile: PatientProfile | null;
  unreadCount?: number;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  isAdmin, 
  setAdmin, 
  isProfileView, 
  setProfileView, 
  isSearchView,
  setSearchView,
  isOrderView,
  setOrderView,
  isPriceListView,
  setPriceListView,
  theme,
  profile,
  unreadCount = 0,
  onLogout
}) => {
  const closeAll = () => {
    setAdmin(false);
    setProfileView(false);
    setSearchView(false);
    setOrderView(false);
    setPriceListView(false);
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <nav className="sticky top-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-3xl shadow-lg shadow-black/5 flex items-center justify-between px-4 md:px-6 py-3 border border-white/50">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={closeAll}>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 md:p-2.5 rounded-2xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5L12 21l7-7Z"/></svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">MediConsult <span className="text-blue-600">AI</span></h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { 
                  const wasProfile = isProfileView;
                  closeAll(); 
                  setProfileView(!wasProfile); 
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 ${isProfileView ? 'bg-blue-600 text-white shadow-xl' : 'bg-white text-slate-600 border border-slate-100'}`}
              >
                {profile?.profilePic ? (
                  <img src={profile.profilePic} className="w-5 h-5 rounded-lg object-cover" alt="Avatar" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                )}
                <span className="hidden xs:block">প্রোফাইল</span>
              </button>
              
              <button 
                onClick={onLogout}
                className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <footer className="py-10 text-center text-slate-400 text-xs font-medium">
        <p>Built with AI Intelligence • © 2024 MediConsult Systems</p>
      </footer>
    </div>
  );
};
