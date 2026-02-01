
import React from 'react';

interface HomeDashboardProps {
  onOpenPriceList: () => void;
  onOpenOrder: () => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onOpenHistory: () => void;
  unreadCount: number;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ 
  onOpenPriceList, 
  onOpenOrder, 
  onOpenSearch, 
  onOpenAdmin,
  onOpenHistory,
  unreadCount 
}) => {
  const actions = [
    {
      id: 'price',
      title: 'ঔষধের মূল্য',
      desc: 'বাজার দর যাচাই করুন',
      icon: '💰',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      onClick: onOpenPriceList
    },
    {
      id: 'order',
      title: 'ঔষধ কিনুন',
      desc: 'ঘরে বসে ঔষধ অর্ডার করুন',
      icon: '📦',
      color: 'from-indigo-500 to-blue-700',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      onClick: onOpenOrder,
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      id: 'search',
      title: 'বিকল্প ঔষধ',
      desc: 'জেনেরিক বিকল্প খুঁজুন',
      icon: '🔍',
      color: 'from-emerald-500 to-teal-700',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      onClick: onOpenSearch
    },
    {
      id: 'history',
      title: 'প্রেসক্রিপশন ইতিহাস',
      desc: 'পুরানো প্রেসক্রিপশন দেখুন',
      icon: '📄',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      onClick: onOpenHistory
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className="group relative flex flex-col items-center text-center p-6 rounded-[2.5rem] bg-white border border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className={`w-12 h-12 md:w-16 md:h-16 ${action.bgColor} ${action.textColor} rounded-3xl flex items-center justify-center text-2xl md:text-3xl mb-4 shadow-inner group-hover:scale-110 transition-transform`}>
            {action.icon}
          </div>
          <h3 className="text-[10px] md:text-sm font-black text-slate-800 mb-1 leading-tight">{action.title}</h3>
          <p className="hidden md:block text-[8px] font-bold text-slate-400 uppercase tracking-tighter leading-tight">{action.desc}</p>
          
          {action.badge && (
            <span className="absolute top-4 right-4 w-6 h-6 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-black animate-pulse">
              {action.badge}
            </span>
          )}

          <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${action.color} rounded-b-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity`}></div>
        </button>
      ))}
    </div>
  );
};
