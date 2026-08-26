import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center bg-transparent">
      <div className="flex flex-col items-center justify-center p-8 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <Loader2 className="h-10 w-10 animate-spin text-[#015249] dark:text-[#57BC90] mb-4" />
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Memuat Data...</h2>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Sinkronisasi dengan server</p>
      </div>
    </div>
  );
}
