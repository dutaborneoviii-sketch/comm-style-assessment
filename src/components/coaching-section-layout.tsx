'use client';

import { useState } from 'react';
import { ToggleLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import ByteSizedCard from './byte-sized-card';

export default function CoachingSectionLayout({
  hasByteSizedCard = false,
  coachingTracker,
  tacticalGuide
}: {
  hasByteSizedCard?: boolean;
  coachingTracker: React.ReactNode;
  tacticalGuide: React.ReactNode;
}) {
  const [isGuideCollapsed, setIsGuideCollapsed] = useState(false);

  const toggleButton = (
    <button 
      onClick={() => setIsGuideCollapsed(false)}
      title="Tampilkan Panduan Gaya Komunikasi"
      className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#57BC90] bg-white dark:bg-zinc-950 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 px-3 py-1.5 transition-colors"
    >
      <ToggleLeft className="w-5 h-5" strokeWidth={1.5} />
      Tampilkan Panduan
    </button>
  );

  return (
    <div className="flex flex-col w-full relative">
      {hasByteSizedCard && (
        <ByteSizedCard extraToggle={isGuideCollapsed ? toggleButton : null} />
      )}

      {(!hasByteSizedCard) && (
        <div className={cn("transition-all duration-300 z-50", isGuideCollapsed ? "fixed bottom-8 right-8 opacity-100 scale-100" : "fixed bottom-8 right-8 opacity-0 scale-95 pointer-events-none")}>
          <button 
            onClick={() => setIsGuideCollapsed(false)}
            title="Tampilkan Panduan Gaya Komunikasi"
            className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#57BC90] dark:hover:text-[#57BC90] bg-white dark:bg-zinc-900 rounded-full shadow-xl border border-slate-200 dark:border-slate-800 px-5 py-3 transition-all hover:scale-105"
          >
            <ToggleLeft className="w-5 h-5" strokeWidth={2} />
            Tampilkan Panduan
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row relative">
        <div className={cn("transition-all duration-500 ease-in-out h-fit relative", isGuideCollapsed ? "w-full" : "w-full lg:w-7/12")}>
          {coachingTracker}
        </div>
        
        <div className={cn("transition-all duration-500 ease-in-out overflow-hidden", isGuideCollapsed ? "w-0 h-0 lg:h-auto opacity-0" : "w-full lg:w-5/12 opacity-100")}>
          <div className="w-full lg:pl-8 pt-8 lg:pt-0">
            <div className="relative h-fit lg:sticky lg:top-[175px] z-30 lg:min-w-[320px]">
              <button 
                onClick={() => setIsGuideCollapsed(true)}
                title="Sembunyikan Panduan (Perluas Tampilan)"
                className="absolute top-5 right-5 z-40 flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-300 px-2 py-1 rounded-md transition-colors"
              >
                <span className="text-[11px] font-bold">Sembunyikan</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-200" />
              </button>
              {tacticalGuide}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
