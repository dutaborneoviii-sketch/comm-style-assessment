"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUserAccess } from "@/lib/access";
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
  ChevronDown,
  Activity,
  History,
  FileSpreadsheet,
  Mail,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSidebar({ user, viewMode, asistenMode, featuresMap, isCollapsed = false, toggleCollapse }: { user?: any, viewMode?: string, asistenMode?: string, featuresMap?: Record<string, boolean>, isCollapsed?: boolean, toggleCollapse?: () => void }) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "HOME": true,
    "DATA UTAMA": true,
    "ASESMEN & LAPORAN": true,
    "SISTEM & PENGATURAN": true,
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const access = getUserAccess(user as any);

  const isAdminView = access.isAdmin && viewMode === 'admin';
  const isCoach = access.isCoach;
  const isAsistenCoachMode = isCoach && asistenMode !== 'coachee';
  
  // Specific checks for UI elements based on roles
  const isDeputi = user?.pangkat === 'Deputi Direksi Wilayah' || user?.pangkat === 'Kepala Cabang' || user?.pangkat === 'Senior Manager' || user?.positionDetail === 'Kepala Cabang';
  const isAsistenDeputi = user?.pangkat === 'Manager' || user?.pangkat === 'Asisten Deputi' || user?.positionDetail?.startsWith('Asisten Deputi') || user?.pangkat === 'Kepala Kabupaten' || user?.positionDetail === 'Kepala Kabupaten' || user?.pangkat === 'Kepala Kantor Kabupaten' || user?.positionDetail === 'Kepala Kantor Kota';
  
  const isAsdepSDM = (isAsistenDeputi && (user?.department?.includes('SDMUK') || user?.department?.includes('SDM, Umum dan Komunikasi'))) || user?.positionDetail?.includes('Asisten Deputi SDM, Umum dan Komunikasi');
  
  const showMenuAplikasi = isAdminView || (isAsistenCoachMode && isAsdepSDM && featuresMap?.manajemen_menu_aplikasi);
  const showBankSoal = isAdminView || (isAsistenCoachMode && isAsdepSDM && featuresMap?.manajemen_bank_soal);
  const showKamusPanduan = isAdminView || (isAsistenCoachMode && isAsdepSDM && featuresMap?.manajemen_kamus_panduan);
  const showJangkaAsesmenUlang = isAdminView || (isAsistenCoachMode && isAsdepSDM && featuresMap?.jangka_asesmen_ulang);
  const showPanduan = isAdminView || isAsistenCoachMode || isDeputi;

  // Staf-like view: regular user OR Asisten Deputi in coachee mode
  const isStafView = (!isAdminView && !isAsistenCoachMode && !isDeputi);

  const isCabangOrKabupaten = user?.workUnit?.startsWith('Kantor Cabang') || user?.workUnit === 'Kantor Kabupaten' || user?.workUnit === 'Kantor Kota';
  const teamLabel = isCabangOrKabupaten ? "Anggota Bagian" : "Anggota Bidang";

  const navGroups = [
    {
      title: "HOME",
      collapsible: false,
      headerClass: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      iconClass: "text-slate-500 dark:text-slate-400",
      items: [
        { href: "/profile", label: "Dashboard", icon: LayoutDashboard, show: true },
      ].filter(item => item.show)
    },
    {
      title: "DATA UTAMA",
      collapsible: true,
      headerClass: "bg-[#96c1e9] text-white dark:bg-[#4375a3]",
      iconClass: "text-white",
      items: [
        { href: "/team", label: teamLabel, icon: Users, show: isAdminView || isAsistenCoachMode || isDeputi },
        { href: "/guide", label: "Panduan Gaya Komunikasi", icon: BookOpen, show: showPanduan },
        { href: "/admin/dictionary", label: "Kamus Panduan", icon: FileSpreadsheet, show: showKamusPanduan },
        { href: "/admin/questions", label: "Bank Soal", icon: Database, show: showBankSoal },
      ].filter(item => item.show)
    },
    {
      title: "ASESMEN & LAPORAN",
      collapsible: true,
      headerClass: "bg-[#a6d8aa] text-[#37754d] dark:bg-[#487e4e] dark:text-white",
      iconClass: "text-[#37754d] dark:text-white",
      items: [
        { href: "/questionnaire", label: "Pengisian Kuisioner", icon: Activity, show: isStafView },
        { href: "/history", label: "Riwayat Asesmen", icon: History, show: isStafView },
        { href: "/admin/coaching-report", label: "Rekapitulasi Coaching", icon: FileSpreadsheet, show: isAdminView || (isAsdepSDM && isAsistenCoachMode) },
        { href: "/admin/settings", label: "Jangka Asesmen Ulang", icon: Settings, show: showJangkaAsesmenUlang },
      ].filter(item => item.show)
    },
    {
      title: "SISTEM & PENGATURAN",
      collapsible: true,
      headerClass: "bg-[#fbce9c] text-[#8b5523] dark:bg-[#9a6a38] dark:text-white",
      iconClass: "text-[#8b5523] dark:text-white",
      items: [
        { href: "/admin/users", label: "Akses User", icon: Shield, show: isAdminView },
        { href: "/admin/features", label: "Menu Aplikasi", icon: ToggleLeft, show: showMenuAplikasi },
        { href: "/admin/logs", label: "Log Aktivitas User", icon: Activity, show: isAdminView },
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

      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3 scrollbar-none">
        {navGroups.map((group, idx) => {
          if (group.items.length === 0) return null;
          const isExpanded = expandedGroups[group.title] !== false;
          
          return (
            <div key={idx} className="mb-1">
              {!isCollapsed && (
                group.collapsible ? (
                  <button 
                    onClick={() => toggleGroup(group.title)}
                    className={cn(
                      "w-full flex items-center justify-between text-xs font-medium uppercase tracking-wider mb-2 px-4 py-2 rounded-lg transition-colors",
                      group.headerClass
                    )}
                  >
                    <span>{group.title}</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", group.iconClass, !isExpanded && "-rotate-90")} />
                  </button>
                ) : (
                  <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-3 py-1">
                    {group.title}
                  </h3>
                )
              )}
              {(!isCollapsed ? isExpanded : true) && (
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
                              ? "bg-[#015249] text-white shadow-md font-semibold" 
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium"
                          )}
                        >
                          <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "gap-3")}>
                            <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-[#015249] dark:group-hover:text-[#57BC90] transition-colors")} />
                            {!isCollapsed && <span className="text-[15px]">{item.label}</span>}
                          </div>
                          {!isActive && !isCollapsed && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
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

