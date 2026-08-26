import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950">
      <Loader2 className="h-10 w-10 animate-spin text-[#015249] dark:text-[#57BC90] mb-4" />
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Memuat Halaman...</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center max-w-sm">
        Mohon tunggu sebentar, sistem sedang menyiapkan data untuk Anda.
      </p>
    </div>
  );
}
