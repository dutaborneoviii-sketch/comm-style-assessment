"use client";

import { useTransition } from 'react';
import { Shield, User } from 'lucide-react';
import { setViewMode } from '@/app/actions/view-mode';

export function ViewModeToggle({ currentMode }: { currentMode: 'admin' | 'user' }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (mode: 'admin' | 'user') => {
    if (mode === currentMode) return;
    startTransition(async () => {
      await setViewMode(mode);
    });
  };

  return (
    <div className={`relative flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-full select-none ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
      {/* Background sliding indicator */}
      <div 
        className={`absolute top-0.5 bottom-0.5 rounded-full bg-gradient-to-r transition-all duration-300 shadow-md ${
          currentMode === 'admin' 
            ? 'left-0.5 w-[75px] from-[#77C9D4] to-[#57BC90]' 
            : 'left-[77.5px] w-[65px] from-emerald-600 to-teal-600'
        }`}
      />
      
      {/* Admin Button */}
      <button
        onClick={() => handleToggle('admin')}
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1 text-xs font-black tracking-wide uppercase transition-colors duration-300 rounded-full ${
          currentMode === 'admin' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
        }`}
        style={{ width: '75px' }}
      >
        <Shield className="w-3.5 h-3.5" />
        Admin
      </button>

      {/* Staff Button */}
      <button
        onClick={() => handleToggle('user')}
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1 text-xs font-black tracking-wide uppercase transition-colors duration-300 rounded-full ${
          currentMode === 'user' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
        }`}
        style={{ width: '65px' }}
      >
        <User className="w-3.5 h-3.5" />
        Staf
      </button>
    </div>
  );
}
