"use client";

import { useTransition } from 'react';
import { User, Users } from 'lucide-react';
import { setAsistenMode } from '@/app/actions/asisten-mode';

export function AsistenModeToggle({ currentMode }: { currentMode: 'coach' | 'coachee' }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (mode: 'coach' | 'coachee') => {
    if (mode === currentMode) return;
    startTransition(async () => {
      await setAsistenMode(mode);
    });
  };

  return (
    <div className={`relative flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-full select-none ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
      {/* Background sliding indicator */}
      <div 
        className={`absolute top-0.5 bottom-0.5 rounded-full bg-gradient-to-r transition-all duration-300 shadow-md ${
          currentMode === 'coach' 
            ? 'left-0.5 w-[85px] from-[#77C9D4] to-[#57BC90]' 
            : 'left-[87.5px] w-[85px] from-emerald-600 to-teal-600'
        }`}
      />
      
      {/* Coach Button */}
      <button
        onClick={() => handleToggle('coach')}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-black tracking-wide uppercase transition-colors duration-300 rounded-full ${
          currentMode === 'coach' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
        }`}
        style={{ width: '85px' }}
      >
        <Users className="w-3.5 h-3.5" />
        Coach
      </button>

      {/* Coachee Button */}
      <button
        onClick={() => handleToggle('coachee')}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-black tracking-wide uppercase transition-colors duration-300 rounded-full ${
          currentMode === 'coachee' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
        }`}
        style={{ width: '85px' }}
      >
        <User className="w-3.5 h-3.5" />
        Coachee
      </button>
    </div>
  );
}
