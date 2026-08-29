"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticate } from "@/lib/actions";
import { ArrowRight, Lock, Mail, User, Briefcase, Building2, Eye, EyeOff, MapPin, Navigation } from "lucide-react";
import { ForgotPasswordButton } from "./forgot-password-button";
import { employeeLocations } from "@/lib/locations";

function SubmitButton({ label, loadingLabel }: { label: string, loadingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      className="w-full h-12 text-base font-bold bg-gradient-to-r from-[#015249] to-[#57BC90] hover:from-[#57BC90] hover:to-[#015249] text-white transition-all duration-300 shadow-[0_0_20px_rgba(87,188,144,0.3)] hover:shadow-[0_0_25px_rgba(87,188,144,0.5)] rounded-xl group" 
      disabled={pending}
    >
      {pending ? loadingLabel : label}
    </Button>
  );
}

export function AuthForm({ departments = [] }: { departments?: { name: string }[] }) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [selectedWorkUnit, setSelectedWorkUnit] = useState("");

  async function handleLogin(formData: FormData) {
    const res = await authenticate(formData);
    if (res?.error) {
      setLoginError(res.error);
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setRegisterError("");
    setRegisterSuccess("");
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        setRegisterError(json.error || "Gagal mendaftar");
      } else {
        setRegisterSuccess(json.message);
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setActiveTab("login"), 2000); // Auto switch to login
      }
    } catch (err) {
      setRegisterError("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full mx-auto relative group">
      {/* Decorative ambient glow behind the card */}
      {/* Decorative ambient glow removed for cleaner design */}
      
      <div className="relative bg-white/95 dark:bg-slate-950/40 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_0_50px_rgba(30,184,138,0.15)]">
        {/* Login Form */}
        <div className="block animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Selamat Datang</h2>
          </div>
          <form action={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <Input 
                  id="npp" 
                  name="npp" 
                  type="text" 
                  inputMode="numeric" 
                  pattern="[0-9]*" 
                  placeholder="Nomor Pokok Pegawai (NPP)" 
                  className="pl-11 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-12 rounded-xl transition-all duration-300"
                  required 
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                  }}
                />
              </div>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Kata Sandi" 
                  className="pl-11 pr-11 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-12 rounded-xl transition-all duration-300" 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end pt-1">
              <ForgotPasswordButton />
            </div>

            {loginError && (
              <div className="text-sm text-red-600 dark:text-red-300 font-medium bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 p-3 rounded-xl text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                {loginError}
              </div>
            )}
            
            <div className="pt-2">
              <SubmitButton label="Masuk" loadingLabel="Memverifikasi..." />
            </div>
          </form>
        </div>
        
      </div>
      
      {/* Login Application Version Footer */}
      <div className="text-center mt-4">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
          © 2026 Versi 1.0.0
        </p>
      </div>
    </div>
  );
}
