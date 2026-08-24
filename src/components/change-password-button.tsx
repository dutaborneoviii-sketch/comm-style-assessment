"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { KeyRound } from "lucide-react";
import { changeSelfPassword } from "@/app/actions/users";

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="h-10 px-5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
    >
      {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
    </button>
  );
}

export function ChangePasswordButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await changeSelfPassword(formData);
    
    setIsSubmitting(false);
    
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(true);
      // Wait a moment before closing so user can read the success message
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false); // reset for next open
      }, 2000);
    }
  }

  // Reset states when dialog is closed
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        setError(null);
        setSuccess(false);
      }, 300); // Wait for close animation
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-slate-100 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all font-semibold px-4 shadow-sm flex items-center gap-2"
      >
        <KeyRound className="w-4 h-4" />
        <span className="hidden sm:inline">Ubah Password</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
          <div className="p-6 pb-4">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Ubah Password
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 font-normal">
                Silakan masukkan password lama Anda dan tentukan password baru yang aman.
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
              {success && (
                <div className="p-3 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                  Password berhasil diubah.
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
                type="button"
                onClick={() => handleOpenChange(false)}
                className="h-10 px-5 text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
              >
                Batal
              </button>
              <SubmitButton isSubmitting={isSubmitting} />
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
