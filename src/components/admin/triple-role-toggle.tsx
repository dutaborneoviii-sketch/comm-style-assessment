"use client";

import { useTransition } from 'react';
import { Shield, Users, User } from 'lucide-react';
import { setViewMode } from '@/app/actions/view-mode';
import { setAsistenMode } from '@/app/actions/asisten-mode';

export function TripleRoleToggle({ viewMode, asistenMode }: { viewMode: 'admin' | 'user', asistenMode: string }) {
  const [isPending, startTransition] = useTransition();

  // Determine current active state
  let currentActive = 'coach';
  if (viewMode === 'admin') currentActive = 'admin';
  else if (asistenMode === 'coachee') currentActive = 'coachee';

  const handleToggle = (state: 'admin' | 'coach' | 'coachee') => {
    if (state === currentActive) return;
    startTransition(async () => {
      if (state === 'admin') {
        await setViewMode('admin');
        await setAsistenMode('coach');
      } else if (state === 'coach') {
        await setViewMode('user');
        await setAsistenMode('coach');
      } else if (state === 'coachee') {
        await setViewMode('user');
        await setAsistenMode('coachee');
      }
    });
  };

  return (
    <div className={`relative flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-full select-none ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
      {/* Background sliding indicator */}
      <div 
        className={`absolute top-0.5 bottom-0.5 rounded-full bg-gradient-to-r transition-all duration-300 shadow-md ${
          currentActive === 'admin' 
            ? 'left-0.5 w-[75px] from-[#77C9D4] to-[#57BC90]' 
            : currentActive === 'coach'
            ? 'left-[77.5px] w-[75px] from-[#f59e0b] to-[#d97706]'
            : 'left-[154.5px] w-[85px] from-emerald-600 to-teal-600'
        }`}
      />
      
      {/* Admin Button */}
      <button
        onClick={() => handleToggle('admin')}
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1 text-[11px] font-black tracking-wide uppercase transition-colors duration-300 rounded-full ${
          currentActive === 'admin' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
        }`}
        style={{ width: '75px' }}
      >
        <Shield className="w-3 h-3" />
        Admin
      </button>

      {/* Coach Button */}
      <button
        onClick={() => handleToggle('coach')}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1 text-[11px] font-black tracking-wide uppercase transition-colors duration-300 rounded-full ${
          currentActive === 'coach' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
        }`}
        style={{ width: '75px' }}
      >
        <Users className="w-3 h-3" />
        Coach
      </button>

      {/* Coachee Button */}
      <button
        onClick={() => handleToggle('coachee')}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1 text-[11px] font-black tracking-wide uppercase transition-colors duration-300 rounded-full ${
          currentActive === 'coachee' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
        }`}
        style={{ width: '85px' }}
      >
        <User className="w-3 h-3" />
        Coachee
      </button>
    </div>
  );
}
