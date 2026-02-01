
import React, { useState } from 'react';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'admin';

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name || !userId || !password) {
        setError('সবগুলো ঘর পূরণ করুন।');
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('mediConsult_users') || '[]');
      const adminCreds = JSON.parse(localStorage.getItem('mediConsult_adminCreds') || '{"userId":"1","password":"1"}');
      
      if (users.find((u: User) => u.userId === userId) || userId === adminCreds.userId) {
        setError('এই ইউজার আইডি ইতিমধ্যে ব্যবহার করা হয়েছে।');
        return;
      }

      const newUser: User = { name, userId, password };
      localStorage.setItem('mediConsult_users', JSON.stringify([...users, newUser]));
      alert('রেজিস্ট্রেশন সফল হয়েছে! এখন লগইন করুন।');
      setMode('login');
    } else if (mode === 'admin') {
      const adminCreds = JSON.parse(localStorage.getItem('mediConsult_adminCreds') || '{"userId":"1","password":"1"}');
      if (userId === adminCreds.userId && password === adminCreds.password) {
        onLogin({ name: 'Admin', userId: adminCreds.userId, password: adminCreds.password, isAdmin: true });
      } else {
        setError('ভুল অ্যাডমিন আইডি অথবা পাসওয়ার্ড।');
      }
    } else {
      const users = JSON.parse(localStorage.getItem('mediConsult_users') || '[]');
      const user = users.find((u: User) => u.userId === userId && u.password === password);
      
      if (user) {
        onLogin(user);
      } else {
        setError('ভুল ইউজার আইডি অথবা পাসওয়ার্ড।');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 ${mode === 'admin' ? 'bg-slate-900' : 'bg-blue-600'} text-white rounded-[2rem] shadow-2xl transition-colors duration-500 animate-float`}>
            {mode === 'admin' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5L12 21l7-7Z"/></svg>
            )}
          </div>
          <h1 className="text-4xl font-black text-slate-900 mt-4 tracking-tight">MediConsult <span className={mode === 'admin' ? 'text-slate-500' : 'text-blue-600'}>AI</span></h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
            {mode === 'admin' ? 'ADMINISTRATOR PORTAL' : 'SMART HEALTHCARE PORTAL'}
          </p>
        </div>

        <div className="glass-card rounded-[3rem] p-8 md:p-10 shadow-2xl border border-white relative overflow-hidden">
          {mode === 'admin' && <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900"></div>}
          
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode !== 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              রোগী লগইন
            </button>
            <button 
              onClick={() => { setMode('admin'); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'admin' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'}`}
            >
              অ্যাডমিন লগইন
            </button>
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">
            {mode === 'register' ? 'রেজিস্ট্রেশন করুন' : mode === 'admin' ? 'অ্যাডমিন প্রবেশ' : 'লগইন করুন'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">আপনার নাম</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-inner"
                  placeholder="উদা: আব্দুল্লাহ আল মামুন"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">
                {mode === 'admin' ? 'অ্যাডমিন আইডি' : 'ইউজার আইডি'} (ID)
              </label>
              <input 
                type="text" 
                value={userId} 
                onChange={e => setUserId(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent ${mode === 'admin' ? 'focus:border-slate-900' : 'focus:border-blue-500'} focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-inner`}
                placeholder="ID লিখুন"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">পাসওয়ার্ড (Password)</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent ${mode === 'admin' ? 'focus:border-slate-900' : 'focus:border-blue-500'} focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-inner`}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-rose-500 text-xs font-bold text-center animate-bounce">{error}</p>
            )}

            <button 
              type="submit" 
              className={`w-full py-5 ${mode === 'admin' ? 'bg-slate-900' : 'bg-gradient-to-r from-blue-600 to-indigo-700'} text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4`}
            >
              {mode === 'register' ? 'অ্যাকাউন্ট খুলুন' : mode === 'admin' ? 'অ্যাডমিন লগইন' : 'প্রবেশ করুন'}
            </button>
          </form>

          {mode !== 'admin' && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <button 
                onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}
                className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
              >
                {mode === 'register' ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন' : 'নতুন অ্যাকাউন্ট খুলতে চান? রেজিস্ট্রেশন করুন'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
