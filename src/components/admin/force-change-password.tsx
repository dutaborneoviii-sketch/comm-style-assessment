"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { changeSelfPassword } from "@/app/actions/users";
import { KeyRound, ShieldAlert } from "lucide-react";

export function ForceChangePassword({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.passwordUpdatedAt) {
      const now = new Date().getTime();
      const pwdDate = new Date(user.passwordUpdatedAt).getTime();
      const diffDays = (now - pwdDate) / (1000 * 3600 * 24);
      if (diffDays >= 90) {
        setOpen(true);
      }
    } else if (user) {
      // If user doesn't have passwordUpdatedAt (old data), maybe force them or initialize it.
      // We assume if it's missing, it's older than 90 days.
      setOpen(true);
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await changeSelfPassword(formData);
    
    setIsSubmitting(false);
    
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setOpen(false);
      window.location.reload(); // Refresh to update user session and layout
    }
  }

  if (!open) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl [&>button]:hidden">
        <div className="p-6 pb-4">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Pembaruan Password Diperlukan
            </DialogTitle>
            <DialogDescription className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
              Demi keamanan sistem, Anda diwajibkan untuk mengubah password Anda setiap 90 hari (3 bulan). Silakan perbarui password Anda sekarang untuk melanjutkan.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="oldPassword">
                Password Lama
              </label>
              <input
                id="oldPassword"
                name="oldPassword"
                type="password"
                required
                className="w-full h-10 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-900"
                placeholder="Masukkan password saat ini"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="newPassword">
                Password Baru
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
                className="w-full h-10 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-900"
                placeholder="Minimal 8 karakter"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
                Konfirmasi Password Baru
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="w-full h-10 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-900"
                placeholder="Ketik ulang password baru"
              />
            </div>
          </div>

          <div className="bg-slate-50/70 dark:bg-zinc-900/40 px-6 py-4 flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-900">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
