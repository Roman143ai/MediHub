
import React from 'react';
import { PatientProfile, AppSettings } from '../types';

interface WelcomeBannerProps {
  profile: PatientProfile | null;
  settings: AppSettings;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ profile, settings }) => {
  if (!profile || !profile.name) return null;

  return (
    <div className="relative overflow-hidden glass-card rounded-[2.5rem] p-6 md:p-8 mb-8 border-white/50 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5L12 21l7-7Z"/></svg>
      </div>
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-xl shadow-blue-200">
            {profile.profilePic ? (
              <img src={profile.profilePic} className="w-full h-full object-cover rounded-[1.2rem]" alt="Profile" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center animate-pulse">
             <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">{settings.homeWelcomeTitle || 'স্বাগতম!'}</p>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            {profile.name}
          </h2>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">{settings.homeWelcomeSubtitle || 'আপনার সুস্বাস্থ্য আমাদের লক্ষ্য।'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
