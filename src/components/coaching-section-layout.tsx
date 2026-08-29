'use client';

import { useState } from 'react';
import { ToggleLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import ByteSizedCard from './byte-sized-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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

      <div className="flex flex-col lg:flex-row relative pb-32 lg:pb-0">
        {/* Kolom Kiri: Form/Tracker */}
        <div className={cn("transition-all duration-500 ease-in-out relative flex flex-col", isGuideCollapsed ? "w-full" : "w-full lg:w-[65%]")}>
          {coachingTracker}
        </div>
        
        {/* Kolom Kanan: Panduan Coach */}
        <div className={cn("transition-all duration-500 ease-in-out flex flex-col lg:pl-6 pt-4 lg:pt-0", isGuideCollapsed ? "w-0 h-0 lg:h-auto opacity-0 overflow-hidden" : "w-full lg:w-[35%] opacity-100 overflow-visible")}>
          <div className="relative lg:sticky lg:top-4 z-30 lg:min-w-[320px] h-fit lg:h-[calc(100vh-32px)]">
              <Card className="shadow-md border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 flex flex-col h-full">
                <CardHeader className="pb-4 shrink-0 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 mb-4 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">Panduan Coach</CardTitle>
                    <button 
                      onClick={() => setIsGuideCollapsed(true)}
                      title="Sembunyikan Panduan (Perluas Tampilan)"
                      className="flex items-center gap-1 cursor-pointer text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-300 px-3 py-1.5 rounded-full transition-all duration-200 bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-slate-200/60 dark:border-slate-700/60 font-bold text-[11px]"
                    >
                      Sembunyikan
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent 
                  className="flex flex-col gap-6 flex-1 overflow-y-auto px-4 sm:px-6 pb-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
                >
                  {hasByteSizedCard && (
                    <div className="shrink-0 drop-shadow-[0_4px_12px_rgba(16,185,129,0.05)] relative z-10">
                      <ByteSizedCard />
                    </div>
                  )}
                  {tacticalGuide}
                </CardContent>
              </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
