"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ByteSizedCard({ extraToggle }: { extraToggle?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="sticky top-0 z-40 mb-2 drop-shadow-sm">
      <Card className="border border-emerald-200 dark:border-emerald-800 bg-[#f0fdf4]/95 dark:bg-emerald-950/90 backdrop-blur-md shadow-sm rounded-xl overflow-hidden">
        <CardHeader 
          className="pb-3 bg-emerald-50/40 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/40 transition-colors select-none"
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 flex-wrap cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="flex items-baseline gap-2 flex-wrap">
                <span>Byte-Sized Communication</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold tracking-normal normal-case font-normal border-l border-emerald-300 pl-2 leading-none">Taktik Diskusi & Pengarahan Coach</span>
              </div>
            </CardTitle>
            <div className="flex items-center gap-4 text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100/40 dark:hover:bg-emerald-900/20 px-2 py-1 rounded-md" onClick={() => setIsOpen(!isOpen)}>
                <span className="text-[11px] font-bold">{isOpen ? "Sembunyikan" : "Tampilkan"}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", !isOpen && "-rotate-90")} />
              </div>
              {extraToggle}
            </div>
          </div>
        </CardHeader>
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Section 1: Main Rule */}
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 leading-relaxed text-slate-700 dark:text-slate-300 shadow-xs flex flex-col justify-center h-full w-full">
              <div>
                <strong>Poin Penting:</strong> Pastikan saran Anda <span className="underline font-bold text-emerald-600 dark:text-emerald-400">Concise (Singkat)</span> dan <span className="underline font-bold text-[#3b82f6] dark:text-blue-400">Clear (Jelas)</span>. Pecah konsep besar menjadi potongan info kecil agar mudah dipahami & diterapkan.
              </div>
            </div>

            {/* Section 2: Characteristics */}
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 space-y-1.5 text-slate-600 dark:text-slate-400 shadow-xs flex flex-col justify-center h-full w-full">
              <p className="font-bold text-[10px] text-slate-800 dark:text-slate-200 uppercase tracking-wider">Karakteristik Taktis:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Conciseness:</strong> Fokus informasi krusial, singkirkan detail tak perlu.</li>
                <li><strong>Clarity:</strong> Pesan tidak ambigu dan langsung pada intinya.</li>
                <li><strong>Understandability:</strong> Mudah dipahami & langsung ditindaklanjuti.</li>
                <li><strong>Engaging:</strong> Menggunakan variasi format (poin/visual).</li>
              </ul>
            </div>

            {/* Section 3: Before vs After */}
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 text-[11px] shadow-xs flex flex-col justify-center h-full w-full">
              <div className="grid grid-cols-2 gap-3 w-full">
                <div>
                  <span className="text-red-500 font-semibold block text-[10px] mb-1.5">Sebelum (Naratif Panjang):</span>
                  <p className="italic text-slate-400 line-through leading-tight text-[10px]">"Produktivitas kita berjalan maksimal di minggu ini. Kita berhasil mendapatkan 5 klien baru sehingga penjualan naik..."</p>
                </div>
                <div>
                  <span className="text-emerald-600 font-semibold block text-[10px] mb-1.5">Sesudah (Byte-Sized Points):</span>
                  <ul className="list-disc pl-3 font-semibold text-slate-800 dark:text-slate-200 space-y-0.5 text-[10px] leading-tight">
                    <li>5 klien baru didapatkan</li>
                    <li>Penjualan naik +20%</li>
                    <li>Fokus kontrak besar</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}
