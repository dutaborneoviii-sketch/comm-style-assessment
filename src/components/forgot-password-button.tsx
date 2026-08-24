"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { forgotPassword } from "@/app/actions/users";

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="h-10 px-5 text-sm font-bold text-white bg-[#57BC90] hover:bg-[#4aa07b] rounded-xl transition-colors disabled:opacity-50"
    >
      {isSubmitting ? "Memproses..." : "Kirim Password Baru"}
    </button>
  );
}

export function ForgotPasswordButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await forgotPassword(formData);
    
    setIsSubmitting(false);
    
    if (result.error) {
      setError(result.error);
    } else if (result.success && result.message) {
      setSuccess(result.message);
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 300);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm font-semibold text-[#57BC90] hover:text-[#4aa07b] transition-colors"
      >
        Lupa Password?
      </button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-xl">
          <div className="p-6 pb-4">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-bold text-slate-900">
                Lupa Password
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed text-slate-500 font-normal">
                Masukkan NPP Anda untuk mendapatkan password baru yang akan dikirimkan ke email terdaftar Anda.
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
                <div className="p-3 text-sm font-medium text-[#015249] bg-[#57BC90]/20 border border-[#57BC90]/30 rounded-lg">
                  {success}
                </div>
              )}

              {!success && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="npp">
                    Nomor Pokok Pegawai (NPP)
                  </label>
                  <input
                    id="npp"
                    name="npp"
                    type="text"
                    required
                    className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#57BC90]"
                    placeholder="Masukkan NPP Anda"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                    }}
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="h-10 px-5 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                {success ? "Tutup" : "Batal"}
              </button>
              {!success && <SubmitButton isSubmitting={isSubmitting} />}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
