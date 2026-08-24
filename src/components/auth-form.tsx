"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticate } from "@/lib/actions";
import { ArrowRight, Lock, Mail, User, Briefcase, Building2, Eye, EyeOff } from "lucide-react";
import { ForgotPasswordButton } from "./forgot-password-button";

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
        {/* Tab Selectors */}
        <div className="flex w-full bg-slate-100 dark:bg-slate-950/60 p-1.5 rounded-2xl mb-8 border border-slate-200/50 dark:border-white/5 shadow-inner relative">
          <button 
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 rounded-xl transition-all duration-300 font-bold py-2.5 text-sm z-10 ${activeTab === "login" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
          >
            Masuk
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("register")}
            className={`flex-1 rounded-xl transition-all duration-300 font-bold py-2.5 text-sm z-10 ${activeTab === "register" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
          >
            Daftar
          </button>
          {/* Animated Tab Indicator */}
          <div 
            className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-white/10 rounded-xl shadow-sm dark:shadow-md transition-all duration-300 ease-out z-0 border border-slate-200/60 dark:border-white/10 backdrop-blur-md"
            style={{ left: activeTab === "login" ? "6px" : "calc(50% + 0px)" }}
          />
        </div>
        
        {/* Login Form */}
        <div className={activeTab === "login" ? "block animate-in fade-in slide-in-from-bottom-2 duration-300" : "hidden"}>
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
        
        {/* Register Form */}
        <div className={activeTab === "register" ? "block animate-in fade-in slide-in-from-bottom-2 duration-300" : "hidden"}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Daftar Akun Baru</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Lengkapi data diri Anda di bawah ini</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                <User className="h-4 w-4" />
              </div>
              <Input 
                id="reg-name" 
                name="name" 
                type="text" 
                placeholder="Nama Lengkap" 
                className="pl-10 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-11 rounded-xl text-sm transition-all duration-300" 
                required 
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.toUpperCase();
                }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="relative group/input">
                <Input 
                  id="reg-npp" 
                  name="npp" 
                  type="text" 
                  inputMode="numeric"
                  placeholder="NPP (Misal: 10123)" 
                  className="bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-11 rounded-xl text-sm transition-all duration-300" 
                  required 
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                  }}
                />
              </div>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <Input id="reg-email" name="email" type="email" placeholder="Email Kantor" className="pl-10 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-11 rounded-xl text-sm transition-all duration-300" required />
              </div>
            </div>
            
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-500 transition-colors z-10">
                <Building2 className="h-4 w-4" />
              </div>
              <select 
                id="reg-dept" 
                name="department" 
                className="pl-10 flex h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 py-1 text-sm text-slate-950 dark:text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-colors appearance-none [&>option]:text-black"
                required
                defaultValue=""
              >
                <option value="" disabled className="text-slate-500">Pilih Bidang Unit Kerja...</option>
                {departments.map((dept) => (
                  <option key={dept.name} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-500 transition-colors z-10">
                <Briefcase className="h-4 w-4" />
              </div>
              <select 
                id="reg-pos" 
                name="position" 
                className="pl-10 flex h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 py-1 text-sm text-slate-950 dark:text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-colors appearance-none [&>option]:text-black"
                required
                defaultValue=""
              >
                <option value="" disabled className="text-slate-500">Pilih Jabatan (Role)...</option>
                <option value="Deputi Direksi Wilayah">Deputi Direksi Wilayah</option>
                <option value="Asisten Deputi">Asisten Deputi</option>
                <option value="Asisten Manager">Asisten Manager</option>
                <option value="Staf Pelaksana">Staf Pelaksana</option>
                <option value="PATT/PTT">PATT/PTT</option>
              </select>
            </div>
            
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                <Lock className="h-4 w-4" />
              </div>
              <Input 
                id="reg-password" 
                name="password" 
                type={showRegPassword ? "text" : "password"} 
                placeholder="Buat Kata Sandi" 
                className="pl-10 pr-10 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-11 rounded-xl text-sm transition-all duration-300" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowRegPassword(!showRegPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {registerError && (
              <div className="text-xs text-red-600 dark:text-red-300 font-medium bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 p-2.5 rounded-xl text-center mt-2 flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                {registerError}
              </div>
            )}
            {registerSuccess && (
              <div className="text-xs text-emerald-600 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 p-2.5 rounded-xl text-center mt-2 flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                {registerSuccess}
              </div>
            )}
            
            <div className="pt-2">
              <Button type="submit" disabled={isLoading} className="w-full h-11 text-sm font-bold bg-slate-950 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all duration-300 rounded-xl group relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? "Mendaftarkan Akun..." : "Buat Akun Sekarang"}
                  {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              </Button>
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
