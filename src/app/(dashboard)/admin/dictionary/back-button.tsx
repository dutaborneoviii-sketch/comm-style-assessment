"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  return (
    <button 
      onClick={() => router.back()} 
      className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 mb-4 transition-colors"
    >
      <ArrowLeft className="w-4 h-4 mr-1" />
      Kembali
    </button>
  );
}
