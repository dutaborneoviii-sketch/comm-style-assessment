"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Settings, 
  Database, 
  BookOpen, 
  Users,
  Shield,
  Network,
  ToggleLeft,
  ChevronRight,
  Activity,
  History,
  FileSpreadsheet,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSidebar({ user, viewMode, asistenMode, featuresMap, isCollapsed = false, toggleCollapse }: { user?: any, viewMode?: string, asistenMode?: string, featuresMap?: Record<string, boolean>, isCollapsed?: boolean, toggleCollapse?: () => void }) {
  const pathname = usePathname();

  const isAdminView = user?.role === 'ADMIN' && viewMode === 'admin';
  const isAsistenDeputi = user?.position === 'Asisten Deputi';
  const isAsistenCoachMode = isAsistenDeputi && asistenMode !== 'coachee';
  const isAsistenCoacheeMode = isAsistenDeputi && asistenMode === 'coachee';
  const isAsdepSDM = isAsistenDeputi && user?.department === 'Bidang SDM, Umum dan Komunikasi (SDMUK)';
  
  const showMenuAplikasi = isAdminView || (isAsistenCoachMode && featuresMap?.manajemen_menu_aplikasi);
  const showBankSoal = isAdminView || (isAsistenCoachMode && featuresMap?.manajemen_bank_soal);
  const showKamusPanduan = isAdminView || (isAsistenCoachMode && featuresMap?.manajemen_kamus_panduan);
  const showJangkaAsesmenUlang = isAdminView || (isAsistenCoachMode && featuresMap?.jangka_asesmen_ulang);
  const showPanduan = (isAsistenCoachMode && featuresMap?.panduan_komunikasi) || user?.position === 'Deputi Direksi Wilayah';

  // Staf-like view: regular user OR Asisten Deputi in coachee mode
  const isStafView = (!isAdminView && !isAsistenCoachMode && user?.position !== 'Deputi Direksi Wilayah');

  const navGroups = [
    {
      title: "Home",
      items: [
        { href: "/profile", label: "Dashboard", icon: LayoutDashboard, show: true },
      ].filter(item => item.show)
    },
    {
      title: "Pages",
      items: [
        // Staf / Coachee menus
        { href: "/questionnaire", label: "Pengisian Kuisioner", icon: Activity, show: isStafView },
        { href: "/history", label: "Riwayat Asesmen", icon: History, show: isStafView },
        // Admin menus
        { href: "/admin/coaching-report", label: "Rekapitulasi Coaching", icon: FileSpreadsheet, show: isAdminView || (isAsdepSDM && isAsistenCoachMode) },
        { href: "/admin/users", label: "Manajemen Akses User", icon: Shield, show: isAdminView },
        { href: "/admin/features", label: "Manajemen Menu Aplikasi", icon: ToggleLeft, show: showMenuAplikasi },
        // Coach / Admin menus
        { href: "/team", label: "Anggota Bidang", icon: Users, show: isAdminView || isAsistenCoachMode || user?.position === 'Deputi Direksi Wilayah' },
        { href: "/guide", label: "Panduan Gaya Komunikasi", icon: BookOpen, show: showPanduan },
        { href: "/admin/dictionary", label: "Manajemen Kamus Panduan", icon: FileSpreadsheet, show: showKamusPanduan },
        { href: "/admin/questions", label: "Manajemen Bank Soal", icon: Database, show: showBankSoal },
        { href: "/admin/settings", label: "Jangka Asesmen Ulang", icon: Settings, show: showJangkaAsesmenUlang },
        { href: "/admin/email-settings", label: "Pengaturan Email", icon: Mail, show: isAdminView },
      ].filter(item => item.show)
    }
  ];

  return (
    <div className={cn("flex-shrink-0 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-sm relative z-20 transition-all duration-300", isCollapsed ? "w-[4.5rem]" : "w-64")}>
      <div className={cn("h-16 flex items-center border-b border-slate-100 dark:border-slate-800/80 mb-4 mt-2", isCollapsed ? "justify-center px-0" : "justify-between px-6")}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#015249] shadow-md">
              <span className="text-white font-black text-lg">B</span>
            </div>
            <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight whitespace-nowrap">
              <span className="text-[#015249]">KEPWIL8</span>
            </span>
          </div>
        )}
        {toggleCollapse && (
          <button 
            onClick={toggleCollapse} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Tampilkan Menu" : "Sembunyikan Menu"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-6 scrollbar-none">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/profile' && pathname.startsWith(item.href));
                const Icon = item.icon;
                
                return (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center justify-between py-2.5 rounded-xl transition-all duration-200 group",
                        isCollapsed ? "px-0 justify-center w-10 mx-auto" : "px-3",
                        isActive 
                          ? "bg-[#57BC90] text-white shadow-md shadow-[#57BC90]/20 font-semibold" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium"
                      )}
                    >
                      <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "gap-3")}>
                        <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-[#57BC90] transition-colors")} />
                        {!isCollapsed && <span className="text-sm">{item.label}</span>}
                      </div>
                      {!isActive && !isCollapsed && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Sidebar Footer Application Version */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-zinc-950/20 text-center">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            © 2026 Versi 1.0.0
          </p>
        </div>
      )}
    </div>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}
