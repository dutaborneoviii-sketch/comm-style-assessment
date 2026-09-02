export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAccess } from "@/lib/access";
import { cn } from "@/lib/utils";
import { User, Activity, Sparkles, Database, Users, BookOpen, Mail, History, Network, ToggleLeft, Clock, ClipboardCheck } from "lucide-react";
import { StyleDistributionChart, ChartData } from "@/components/dashboard/style-distribution-chart";
import CoachingTracker from "@/components/coaching-tracker";
import { getFeatureFlagsMap } from "@/app/actions/features";
import { getCooldownSetting } from "@/app/actions/settings";
import { cookies } from "next/headers";
import Image from "next/image";
import AdminDashboardView from "@/components/admin/admin-dashboard-view";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      assessments: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 p-4 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-red-400">Sesi Tidak Valid</h1>
          <p>Data akun Anda tidak ditemukan di sistem. Silakan hapus cookie atau logout untuk melanjutkan.</p>
          <form action={async () => {
            "use server";
            const { signOut } = await import("@/auth");
            await signOut({ redirectTo: "/" });
          }}>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">Logout Sekarang</Button>
          </form>
        </div>
      </div>
    );
  }

  // Override admin user properties if viewing as regular user staf
  const viewMode = cookies().get('view-mode')?.value || 'admin';
  const asistenMode = cookies().get('asisten-mode')?.value || 'coach';
  
  const access = getUserAccess(user as any);
  
  const isViewModeUser = access.isAdmin && viewMode === 'user';
  const isAsistenModeCoachee = (access.isCoach && access.isCoachee) && asistenMode === 'coachee';
  
  if (isViewModeUser) {
    user.role = 'USER';
    user.pangkat = 'Pelaksana'; // fallback for view mode
    if (!user.department) {
      user.department = 'TI Wilayah';
    }
  } else if (isAsistenModeCoachee) {
    // Treat them as a regular coachee when in coachee mode
  }

  if (user.role === 'ADMIN' && viewMode === 'admin') {
    return <AdminDashboardView user={user} />;
  }

  const latestAssessment = user.assessments[0];
  const isAsistenDeputi = user?.pangkat === 'Manager' || user?.pangkat === 'Asisten Deputi' || user?.positionDetail === 'Asisten Deputi' || user?.pangkat === 'Kepala Kabupaten' || user?.positionDetail === 'Kepala Kabupaten' || user?.pangkat === 'Kepala Kantor Kabupaten';
  const isAsdepSDM = (isAsistenDeputi && (user?.department?.includes('SDMUK') || user?.department?.includes('SDM, Umum dan Komunikasi'))) || user?.positionDetail?.includes('Asisten Deputi Bidang Sumber Daya Manusia');
  const getStyleHex = (styleName: string) => {
    if (!styleName) return "#6366f1";
    const s = styleName.toLowerCase();
    if (s.includes("direct") || s.includes("direkt")) return "#ef4444";
    if (s.includes("express") || s.includes("ekspre")) return "#f59e0b";
    if (s.includes("harmon")) return "#10b981";
    if (s.includes("analy") || s.includes("anali")) return "#3b82f6";
    return "#6366f1";
  };

  const primaryHex = latestAssessment ? getStyleHex(latestAssessment.primaryStyle) : "#6366f1";
  const secondaryHex = (latestAssessment && latestAssessment.secondaryStyle) ? getStyleHex(latestAssessment.secondaryStyle) : primaryHex;

  let chartData: ChartData[] = [];
  let allChartData: ChartData[] = [];
  let quadrantMembers: any[] = [];
  let chartTitle = user.department || "Keseluruhan";

  const isTopLevel = user.pangkat === 'Senior Manager' || user.pangkat === 'Deputi Direksi Wilayah' || user.positionDetail === 'Deputi Direksi Wilayah' || user.positionDetail === 'Kepala Cabang';
  const isMidLevel = user.pangkat === 'Manager' || user.positionDetail === 'Asisten Deputi' || user.positionDetail === 'Kepala Kabupaten' || user.positionDetail === 'Kepala Kantor Kabupaten';
  const isLowLevel = user.pangkat === 'Asisten Manager' || user.positionDetail === 'Asisten Manager';
  const isManager = access.isCoach && !isViewModeUser && !isAsistenModeCoachee;

  if (isManager) {
    let userFilter: any = { status: 'APPROVED' };
    let targetPangkat: string[] = [];
    
    if (isTopLevel) {
      if (user.positionDetail === 'Kepala Cabang' || (user.workUnit?.startsWith('Kantor Cabang') && user.pangkat === 'Manager')) {
        targetPangkat = ['Asisten Manager'];
        userFilter = {
          workUnit: user.workUnit || undefined,
          OR: [
            { pangkat: { in: targetPangkat } },
            { positionDetail: { in: targetPangkat } }
          ],
          status: 'APPROVED'
        };
        chartTitle = "Seluruh Anggota di " + (user.workUnit || "Cabang");
      } else if (user.pangkat === 'Senior Manager') {
        targetPangkat = ['Manager'];
        userFilter = {
          workUnit: user.workUnit || undefined,
          OR: [
            { pangkat: { in: targetPangkat } },
            { positionDetail: { in: targetPangkat } }
          ],
          status: 'APPROVED'
        };
        chartTitle = "Seluruh Anggota di " + (user.workUnit || "Wilayah");
      } else {
        targetPangkat = ['Manager', 'Asisten Manager', 'Pelaksana', 'PTT/PATT', 'Asisten Deputi', 'Kepala Kabupaten', 'Kepala Kantor Kabupaten', 'Staf Pelaksana'];
        userFilter = {
          OR: [
            { pangkat: { in: targetPangkat } },
            { positionDetail: { in: targetPangkat } }
          ],
          status: 'APPROVED'
        };
        chartTitle = "Seluruh Anggota di Wilayah";
      }
    } else if (isMidLevel || isLowLevel) {
      targetPangkat = isMidLevel ? ['Asisten Manager', 'Pelaksana', 'PTT/PATT', 'Staf Pelaksana'] : ['Pelaksana', 'PTT/PATT', 'Staf Pelaksana'];
      const isKepalaUnit = user.positionDetail === 'Kepala Kabupaten' || user.positionDetail === 'Kepala Kantor Kabupaten';
      
      userFilter = {
        ...(isKepalaUnit ? {} : { department: user.department || undefined }),
        ...(isKepalaUnit ? { employeeLocation: user.employeeLocation || undefined } : {}),
        workUnit: user.workUnit || undefined,
        OR: [
          { pangkat: { in: targetPangkat } },
          { positionDetail: { in: targetPangkat } }
        ],
        status: 'APPROVED'
      };
      chartTitle = (user.department || "").replace(/\s*\([^)]*\)$/, '') + " - " + (user.employeeLocation || user.workUnit || "Unit Kerja");
    } else if (user.role === 'ADMIN') {
      chartTitle = "Seluruh Wilayah";
    }

    let departmentUsers = await prisma.user.findMany({
      where: userFilter,
      include: {
        assessments: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        coacheeLogs: {
          select: { isClosed: true }
        }
      }
    });

    const normalizeStyle = (style: string) => {
      if (!style) return "";
      const s = style.toLowerCase();
      if (s.includes("direct") || s.includes("direkt")) return "Direktif";
      if (s.includes("express") || s.includes("ekspre")) return "Ekspresif";
      if (s.includes("harmon")) return "Harmonis";
      if (s.includes("analy") || s.includes("anali")) return "Analitis";
      return style;
    };

    const getStandardCombination = (p: string, s: string) => {
      const sorted = [p, s].sort().join(' + ');
      if (sorted === "Analitis + Direktif") return "Direktif + Analitis";
      if (sorted === "Analitis + Ekspresif") return "Ekspresif + Analitis";
      if (sorted === "Analitis + Harmonis") return "Harmonis + Analitis";
      if (sorted === "Direktif + Ekspresif") return "Direktif + Ekspresif";
      if (sorted === "Direktif + Harmonis") return "Direktif + Harmonis";
      if (sorted === "Ekspresif + Harmonis") return "Ekspresif + Harmonis";
      return sorted;
    };

    const styleCounts: Record<string, { total: number, departments: Record<string, number>, users: string[] }> = {};
    departmentUsers.forEach(member => {
      if (member.assessments && member.assessments.length > 0) {
        const assessment = member.assessments[0];
        const primary = normalizeStyle(assessment.primaryStyle);
        let styleName = primary;
        
        if (assessment.isCombination && assessment.secondaryStyle) {
          const secondary = normalizeStyle(assessment.secondaryStyle);
          styleName = getStandardCombination(primary, secondary);
        }
        
        if (!styleCounts[styleName]) {
          styleCounts[styleName] = { total: 0, departments: {}, users: [] };
        }
        
        styleCounts[styleName].total += 1;
        const deptName = member.department || "Tidak Diketahui";
        styleCounts[styleName].departments[deptName] = (styleCounts[styleName].departments[deptName] || 0) + 1;
        if (member.name) {
          const userNpp = member.npp || "-";
          styleCounts[styleName].users.push(`${member.name}@@@${userNpp}@@@${deptName}@@@${styleName}`);
        }
      }
    });

    chartData = Object.entries(styleCounts).map(([name, data]) => ({ 
      name, 
      count: data.total,
      departments: data.departments,
      users: data.users
    }));

    quadrantMembers = departmentUsers.map(member => {
      const assessment = member.assessments && member.assessments.length > 0 ? member.assessments[0] : null;
      return {
        id: member.id,
        name: member.name || "Unknown",
        positionDetail: member.positionDetail,
        department: member.department,
        primaryStyle: assessment ? normalizeStyle(assessment.primaryStyle) : null,
        secondaryStyle: assessment && assessment.secondaryStyle ? normalizeStyle(assessment.secondaryStyle) : null,
        isCombination: assessment ? assessment.isCombination : false,
      };
    });

    // Calculate Dashboard Stats
    let statsUsers = departmentUsers;
    if (user.role === 'ADMIN' || user.positionDetail === 'Deputi Direksi Wilayah') {
      statsUsers = departmentUsers.filter(u => u.positionDetail?.includes('Asisten Deputi') || u.pangkat === 'Manager');
    } else if (user.positionDetail?.includes('Asisten Deputi')) {
      statsUsers = departmentUsers;
    } else if (user.positionDetail === 'Kepala Kabupaten') {
      statsUsers = departmentUsers;
    }
    
    const totalMembers = statsUsers.length;
    let completedQuestionnaireNames: string[] = [];
    let notCompletedQuestionnaireNames: string[] = [];
    let noCoachingNames: string[] = [];
    let inProgressCoachingNames: string[] = [];
    let completedCoachingNames: string[] = [];

    statsUsers.forEach(u => {
      const name = u.name || "Anonim";
      if (u.assessments && u.assessments.length > 0) {
        completedQuestionnaireNames.push(name);
      } else {
        notCompletedQuestionnaireNames.push(name);
      }
      
      if (!u.coacheeLogs || u.coacheeLogs.length === 0) {
        noCoachingNames.push(name);
      } else {
        const hasOpen = u.coacheeLogs.some((log: any) => !log.isClosed);
        if (hasOpen) {
          inProgressCoachingNames.push(name);
        } else {
          completedCoachingNames.push(name);
        }
      }
    });

    const completedQuestionnaire = completedQuestionnaireNames.length;
    const notCompletedQuestionnaire = notCompletedQuestionnaireNames.length;
    const noCoaching = noCoachingNames.length;
    const inProgressCoaching = inProgressCoachingNames.length;
    const completedCoaching = completedCoachingNames.length;

    const inProgressPercentage = totalMembers > 0 ? Math.round((inProgressCoaching / totalMembers) * 100) : 0;
    const completedPercentage = totalMembers > 0 ? Math.round((completedCoaching / totalMembers) * 100) : 0;

    // Attach to a global variable to use in JSX
    (global as any).dashboardStats = {
      completedQuestionnaire,
      notCompletedQuestionnaire,
      noCoaching,
      inProgressCoaching,
      completedCoaching,
      inProgressPercentage,
      completedPercentage,
      totalMembers,
      completedQuestionnaireNames: completedQuestionnaireNames.join('\n'),
      notCompletedQuestionnaireNames: notCompletedQuestionnaireNames.join('\n'),
      noCoachingNames: noCoachingNames.join('\n'),
      inProgressCoachingNames: inProgressCoachingNames.join('\n'),
      completedCoachingNames: completedCoachingNames.join('\n'),
    };

    // For Asisten Deputi SDMUK: also compute all-region chart data for the right card
    if (isAsdepSDM) {
      const allRegionUsers = await prisma.user.findMany({
        where: { status: 'APPROVED' },
        include: {
          assessments: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });
      const allStyleCounts: Record<string, { total: number, departments: Record<string, number>, users: string[] }> = {};
      allRegionUsers.forEach(member => {
        if (member.assessments && member.assessments.length > 0) {
          const assessment = member.assessments[0];
          const primary = normalizeStyle(assessment.primaryStyle);
          let styleName = primary;
          if (assessment.isCombination && assessment.secondaryStyle) {
            styleName = getStandardCombination(primary, normalizeStyle(assessment.secondaryStyle));
          }
          if (!allStyleCounts[styleName]) allStyleCounts[styleName] = { total: 0, departments: {}, users: [] };
          allStyleCounts[styleName].total += 1;
          const deptName = member.department || 'Tidak Diketahui';
          allStyleCounts[styleName].departments[deptName] = (allStyleCounts[styleName].departments[deptName] || 0) + 1;
          if (member.name) {
            const userNpp = member.npp || "-";
            allStyleCounts[styleName].users.push(`${member.name}@@@${userNpp}@@@${deptName}@@@${styleName}`);
          }
        }
      });
      allChartData = Object.entries(allStyleCounts).map(([name, data]) => ({
        name,
        count: data.total,
        departments: data.departments,
        users: data.users
      }));
    }
  }



  // Determine role group for this user
  let userRoleGroup = user.pangkat || user.positionDetail || "Staf";

  // Feature flags
  const featureFlags = await getFeatureFlagsMap(userRoleGroup, user.department);

  const isNormalUserView = !isManager
    && !isAsistenModeCoachee
    && (featureFlags['ulangi_asesmen'] ?? true);

  const showBankSoal = user.role === 'ADMIN' || (isManager && !isTopLevel && (featureFlags['manajemen_bank_soal'] ?? false));
  const showCooldownSettings = user.role === 'ADMIN' || (isManager && !isTopLevel && (featureFlags['jangka_asesmen_ulang'] ?? false));
  const showPanduan = (isManager && !isTopLevel && featureFlags['panduan_komunikasi']) || isTopLevel;

  // Cooldown check for reassessment
  const cooldownMonths = await getCooldownSetting();
  let isUnderCooldown = false;
  let nextAvailableDate: Date | null = null;

  if (latestAssessment && cooldownMonths > 0) {
    const lastDate = new Date(latestAssessment.createdAt);
    const targetDate = new Date(lastDate);
    targetDate.setMonth(targetDate.getMonth() + cooldownMonths);
    
    const now = new Date();
    if (now < targetDate) {
      isUnderCooldown = true;
      nextAvailableDate = targetDate;
    }
  }

  const showCoacheeDashboard = access.isCoachee && (!access.isCoach || isAsistenModeCoachee || isViewModeUser);
  let myCoachingLogs: any[] = [];
  if (showCoacheeDashboard) {
    myCoachingLogs = await prisma.coachingLog.findMany({
      where: { coacheeId: user.id },
      include: {
        coach: { select: { name: true, npp: true, department: true, positionDetail: true } },
        actionItems: true
      },
      orderBy: { date: 'desc' }
    });
  }

  const { isCoach, isCoachee } = getUserAccess(user);
  const showCoachDashboard = isCoach && !isAsistenModeCoachee && !isViewModeUser;
  let coachActiveLogs: any[] = [];
  if (showCoachDashboard) {
    coachActiveLogs = await prisma.coachingLog.findMany({
      where: { 
        coachId: user.id,
        isClosed: false
      },
      include: {
        coachee: { select: { name: true, npp: true, department: true } },
        actionItems: true
      },
      orderBy: { date: 'asc' }
    });
  }

  const hasLeftColumnContent = (user.role !== 'ADMIN' && !isTopLevel && showBankSoal) || 
    (user.role !== 'ADMIN' && !isTopLevel && showCooldownSettings);

  return (
    <div className={cn("w-full max-w-[1920px] mx-auto relative pt-2 -mt-10 pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 xl:px-12")}>
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#57BC90]/10 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#015249]/10 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full items-start">
        
        {/* LEFT COLUMN (STICKY) */}
        {hasLeftColumnContent && (
        <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0 flex flex-col gap-4 md:gap-5 lg:sticky lg:top-24 z-10">
          




          {/* Bank Soal card for non-admin role groups with flag enabled */}
          {user.role !== 'ADMIN' && !isTopLevel && showBankSoal && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/30 dark:border-emerald-500/20 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-all group">
              <div className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">Manajemen Bank Soal</p>
                <p className="text-xs text-muted-foreground truncate">Kelola pertanyaan kuesioner asesmen</p>
              </div>
              <Link href="/admin/questions" className={cn(buttonVariants({ variant: "default", size: "sm" }), "shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs px-3 h-8")}>
                Buka
              </Link>
            </div>
          )}
          {/* Jangka Asesmen Ulang card for non-admin role groups with flag enabled */}
          {user.role !== 'ADMIN' && !isTopLevel && showCooldownSettings && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-teal-500/30 dark:border-teal-500/20 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-all group">
              <div className="inline-flex items-center justify-center p-2 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">Jangka Asesmen Ulang</p>
                <p className="text-xs text-muted-foreground truncate">Atur batas waktu pengisian ulang</p>
              </div>
              <Link href="/admin/settings" className={cn(buttonVariants({ variant: "default", size: "sm" }), "shrink-0 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs px-3 h-8")}>
                Kelola
              </Link>
            </div>
          )}

        </div>
        )}

        {/* RIGHT COLUMN */}
        <div className="w-full flex-1 flex flex-col gap-4 md:gap-6 min-w-0">
          
          {/* Rekapitulasi Coaching (Admin, Asisten Deputi, Deputi) */}
          {isManager && (
            <>
              {/* Standalone Dashboard Stats Cards */}
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative z-50">
                 
                 {/* Card 1: Status Pengisian Kuisioner */}
                 <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-800 transition-all flex justify-between items-start">
                    <div className="w-full">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">STATUS PENGISIAN KUISIONER</p>
                        <div className="flex justify-between items-center w-full">
                          <h2 className="text-3xl font-black text-slate-800 dark:text-white">
                            {(global as any).dashboardStats?.completedQuestionnaire || 0}
                          </h2>
                          <div className="w-28 h-28 relative shrink-0 -my-4">
                            <img src="/images/survey_icon_transparent.png" alt="Survey" className="w-full h-full object-contain scale-110" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                           <div className="flex items-center gap-2 group/tip cursor-help relative">
                              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                              <span className="text-emerald-600 font-bold">{(global as any).dashboardStats?.completedQuestionnaire || 0}</span>
                              <span className="text-slate-500 text-sm">Selesai mengisi</span>
                              
                              <div className="absolute bottom-full left-0 mb-2 w-max max-w-[280px] bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 whitespace-pre-line p-3 pointer-events-none transform origin-bottom translate-y-1 group-hover/tip:translate-y-0 text-left">
                                <span className="font-bold text-sm block border-b border-slate-700 pb-2 mb-2">Selesai Mengisi</span>
                                {(global as any).dashboardStats?.completedQuestionnaireNames || 'Tidak ada anggota'}
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-2 group/tip cursor-help relative">
                              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                              <span className="text-amber-600 font-bold">{(global as any).dashboardStats?.notCompletedQuestionnaire || 0}</span>
                              <span className="text-slate-500 text-sm">Belum mengisi</span>
                              
                              <div className="absolute bottom-full left-0 mb-2 w-max max-w-[280px] bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 whitespace-pre-line p-3 pointer-events-none transform origin-bottom translate-y-1 group-hover/tip:translate-y-0 text-left">
                                <span className="font-bold text-sm block border-b border-slate-700 pb-2 mb-2">Belum Mengisi</span>
                                {(global as any).dashboardStats?.notCompletedQuestionnaireNames || 'Tidak ada anggota'}
                              </div>
                           </div>
                        </div>
                    </div>
                 </div>

                 {/* Card 2: Status Coaching */}
                 <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-800 transition-all flex justify-between items-start">
                    <div className="w-full">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">STATUS COACHING</p>
                        <div className="flex justify-between items-center w-full">
                          <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400">
                            {(global as any).dashboardStats?.completedCoaching || 0}
                          </h2>
                          <div className="w-28 h-28 relative shrink-0 -my-4">
                            <img src="/images/coaching_icon_transparent.png" alt="Coaching Sessions" className="w-full h-full object-contain scale-110" />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-3">
                           <div className="flex items-center gap-2 group/tip cursor-help relative">
                              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                              <span className="text-blue-600 font-bold">{(global as any).dashboardStats?.completedCoaching || 0}</span>
                              <span className="text-slate-500 text-sm">Selesai coaching</span>
                              
                              <div className="absolute bottom-full left-0 mb-2 w-max max-w-[280px] bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 whitespace-pre-line p-3 pointer-events-none transform origin-bottom translate-y-1 group-hover/tip:translate-y-0 text-left">
                                <span className="font-bold text-sm block border-b border-slate-700 pb-2 mb-2">Selesai Coaching</span>
                                {(global as any).dashboardStats?.completedCoachingNames || 'Tidak ada anggota'}
                              </div>
                           </div>

                           <div className="flex items-center gap-2 group/tip cursor-help relative">
                              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                              <span className="text-amber-600 font-bold">{(global as any).dashboardStats?.inProgressCoaching || 0}</span>
                              <span className="text-slate-500 text-sm">Proses coaching</span>
                              
                              <div className="absolute bottom-full left-0 mb-2 w-max max-w-[280px] bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 whitespace-pre-line p-3 pointer-events-none transform origin-bottom translate-y-1 group-hover/tip:translate-y-0 text-left">
                                <span className="font-bold text-sm block border-b border-slate-700 pb-2 mb-2">Proses Coaching</span>
                                {(global as any).dashboardStats?.inProgressCoachingNames || 'Tidak ada anggota'}
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-2 group/tip cursor-help relative">
                              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                              <span className="text-rose-600 font-bold">{(global as any).dashboardStats?.noCoaching || 0}</span>
                              <span className="text-slate-500 text-sm">Belum coaching</span>
                              
                              <div className="absolute bottom-full left-0 mb-2 w-max max-w-[280px] bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 whitespace-pre-line p-3 pointer-events-none transform origin-bottom translate-y-1 group-hover/tip:translate-y-0 text-left">
                                <span className="font-bold text-sm block border-b border-slate-700 pb-2 mb-2">Belum Coaching</span>
                                {(global as any).dashboardStats?.noCoachingNames || 'Tidak ada anggota'}
                              </div>
                           </div>
                        </div>
                    </div>
                 </div>
              </div>

            <Card className="flex flex-col w-full border-[#015249]/30 dark:border-[#015249]/20 shadow-lg hover:shadow-xl transition-all relative bg-white dark:bg-zinc-950 p-0 rounded-xl overflow-hidden">
              <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#015249]/10 rounded-full blur-3xl mix-blend-multiply"></div>
              </div>

              <div className="flex flex-col xl:flex-row w-full relative z-10">
              <div className={cn("flex flex-col justify-between w-full p-6 sm:p-8 relative z-10", isAsdepSDM ? "xl:w-1/3" : "xl:w-1/2")}>
                <div>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center p-2 rounded-lg bg-[#015249]/10 dark:bg-[#015249]/20 text-[#015249] dark:text-blue-400 w-fit">
                      <History className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-black text-foreground">
                      Rekapitulasi Coaching
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base mt-3 text-muted-foreground leading-relaxed max-w-xl">
                    Akses dasbor master untuk memantau seluruh histori log sesi coaching, catatan penting, dan action items secara terpusat.
                  </CardDescription>
                </div>
                <div className="mt-6">
                  <Link href="/coaching" className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto shadow-xl shadow-[#015249]/20 bg-[#015249] hover:bg-[#57BC90] text-white transition-all hover:scale-105 px-8 font-bold rounded-xl h-12")}>
                    Lihat Semua Histori
                  </Link>
                </div>
              </div>

              <div className={cn("w-full border-t xl:border-t-0 xl:border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 relative z-10", isAsdepSDM ? "xl:w-1/3" : "xl:w-1/2")}>
                <StyleDistributionChart 
                  data={chartData} 
                  departmentName={chartTitle} 
                  className="border-none shadow-none bg-transparent hover:shadow-none p-0 m-0 h-full min-h-[350px] flex flex-col"
                  variant="pie"
                />
              </div>

              {isAsdepSDM && (
                <div className="w-full xl:w-1/3 border-t xl:border-t-0 xl:border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 relative z-10">
                  <StyleDistributionChart 
                    data={allChartData} 
                    departmentName="Seluruh Bidang di Wilayah"
                    className="border-none shadow-none bg-transparent hover:shadow-none p-0 m-0 h-full min-h-[350px] flex flex-col"
                    variant="pie"
                  />
                </div>
              )}
              </div>
            </Card>
            </>
          )}



          {/* Admin Management Cards */}
          {user.role === 'ADMIN' && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              <Card className="flex flex-col justify-between h-full border-blue-500/30 dark:border-blue-500/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden bg-white dark:bg-zinc-950">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
                <CardHeader className="pt-6 sm:pt-8">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-[#015249] dark:text-blue-400 w-fit">
                      <Users className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-black text-foreground">
                      Manajemen User
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base mt-2 text-muted-foreground leading-relaxed">
                    Kelola hak akses pengguna, tambah, edit, atau hapus data karyawan di seluruh wilayah.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6 sm:pb-8">
                  <Link href="/admin/users" className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto shadow-xl shadow-[#015249]/20 bg-[#015249] hover:bg-blue-700 text-white transition-all hover:scale-105 px-8 font-bold rounded-xl h-12")}>
                    Kelola Pengguna
                  </Link>
                </CardContent>
              </Card>
              
              {showBankSoal && (
              <Card className="flex flex-col justify-between h-full border-emerald-500/30 dark:border-emerald-500/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden bg-white dark:bg-zinc-950">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
                <CardHeader className="pt-6 sm:pt-8">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 w-fit">
                      <Database className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-black text-foreground">
                      Manajemen Bank Soal
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base mt-2 text-muted-foreground leading-relaxed">
                    Kelola pertanyaan, opsi jawaban, dan bobot skor untuk kuesioner asesmen.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6 sm:pb-8">
                  <Link href="/admin/questions" className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto shadow-xl shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:scale-105 px-8 font-bold rounded-xl h-12")}>
                    Buka Bank Soal
                  </Link>
                </CardContent>
              </Card>
              )}

              <Card className="flex flex-col justify-between h-full border-purple-500/30 dark:border-purple-500/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden bg-white dark:bg-zinc-950">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
                <CardHeader className="pt-6 sm:pt-8">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 w-fit">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-black text-foreground">
                      Panduan Komunikasi
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base mt-2 text-muted-foreground leading-relaxed">
                    Pelajari berbagai gaya komunikasi untuk meningkatkan kolaborasi tim Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6 sm:pb-8">
                  <Link href="/guide" className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto shadow-xl shadow-purple-600/20 bg-purple-600 hover:bg-purple-700 text-white transition-all hover:scale-105 px-8 font-bold rounded-xl h-12")}>
                    Buka Panduan
                  </Link>
                </CardContent>
              </Card>

              <Card className="flex flex-col justify-between h-full border-cyan-500/30 dark:border-cyan-500/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden bg-white dark:bg-zinc-950">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
                <CardHeader className="pt-6 sm:pt-8">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center p-2 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 w-fit">
                      <Network className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-black text-foreground">
                      Diagram ERD
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base mt-2 text-muted-foreground leading-relaxed">
                    Lihat Entity Relationship Diagram untuk memahami arsitektur dan relasi database aplikasi.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6 sm:pb-8">
                  <Link href="/admin/erd" className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto shadow-xl shadow-cyan-600/20 bg-cyan-600 hover:bg-cyan-700 text-white transition-all hover:scale-105 px-8 font-bold rounded-xl h-12")}>
                    Lihat ERD Database
                  </Link>
                </CardContent>
              </Card>

              <Card className="flex flex-col justify-between h-full border-orange-500/30 dark:border-orange-500/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden bg-white dark:bg-zinc-950">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
                <CardHeader className="pt-6 sm:pt-8">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center p-2 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 w-fit">
                      <ToggleLeft className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-black text-foreground">
                      Manajemen Fitur
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base mt-2 text-muted-foreground leading-relaxed">
                    Aktifkan atau nonaktifkan menu dan fitur untuk masing-masing level pangkat secara real-time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6 sm:pb-8">
                  <Link href="/admin/features" className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto shadow-xl shadow-orange-600/20 bg-orange-500 hover:bg-orange-600 text-white transition-all hover:scale-105 px-8 font-bold rounded-xl h-12")}>
                    Kelola Fitur
                  </Link>
                </CardContent>
              </Card>

              {showCooldownSettings && (
              <Card className="flex flex-col justify-between h-full border-teal-500/30 dark:border-teal-500/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden bg-white dark:bg-zinc-950">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
                <CardHeader className="pt-6 sm:pt-8">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center p-2 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 w-fit">
                      <Clock className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-black text-foreground">
                      Jangka Asesmen Ulang
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base mt-2 text-muted-foreground leading-relaxed">
                    Atur batas waktu minimal bagi pengguna sebelum diperbolehkan melakukan pengisian ulang kuesioner asesmen.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6 sm:pb-8">
                  <Link href="/admin/settings" className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto shadow-xl shadow-teal-600/20 bg-teal-500 hover:bg-teal-600 text-white transition-all hover:scale-105 px-8 font-bold rounded-xl h-12")}>
                    Kelola Jangka Waktu
                  </Link>
                </CardContent>
              </Card>
              )}


            </div>
          )}

          {/* Sesi Coaching Aktif (Untuk Coach) */}
          {showCoachDashboard && (
            <div className="w-full space-y-4">
              <div className="flex items-center gap-4 w-full mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                  <History className="h-6 w-6 text-[#57BC90]" /> Review Tindak Lanjut Coaching
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
              </div>
              <div className="w-full mt-4">
                <CoachingTracker 
                  logs={coachActiveLogs} 
                  coacheeId={user.id} 
                  isReadOnly={false} 
                  isCoachee={false} 
                  hideNewSessionButton={true}
                />
              </div>
            </div>
          )}



          {/* Staf Full Width Wrap */}
          {showCoacheeDashboard && (
            <div className="w-full bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-6 md:gap-8 min-h-[calc(100vh-16rem)]">
               
              {latestAssessment && (
                <div className="w-full space-y-4 relative z-10">
                  <div className="flex items-center gap-4 w-full mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                      <Sparkles className="h-6 w-6 text-[#57BC90]" /> Hasil Asesmen Terakhir
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
                  </div>
                  <div className="rounded-[2.5rem] bg-[#57BC90] p-3 shadow-xl">
                    <Card className="group relative overflow-hidden rounded-[2rem] border-0 shadow-none bg-white h-full">
                      <CardContent className="p-0 relative z-10 flex flex-col md:flex-row justify-between min-h-[240px]">
                        
                        {/* Text Content (Left) */}
                        <div className="flex-1 flex flex-col justify-center p-8 md:p-12 space-y-6 z-20">
                          
                          {/* Title */}
                          <div className="space-y-2 w-full">
                            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                              {latestAssessment.primaryStyle}
                              {latestAssessment.isCombination && (
                                <span className="text-slate-400 font-bold ml-2 text-xl md:text-2xl"> 
                                  + {latestAssessment.secondaryStyle}
                                </span>
                              )}
                            </h3>
                          </div>

                          {/* Date & Indicator */}
                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium bg-slate-50 px-4 py-2 rounded-xl w-fit border border-slate-100">
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                              </span>
                              Selesai pada {new Date(latestAssessment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>

                            {/* CTA Button */}
                            <Link href={`/questionnaire/result/${latestAssessment.id}`} className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden bg-slate-900 text-white font-bold rounded-xl h-10 px-6 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 duration-300">
                              <span className="relative z-10 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                                Laporan Detail
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                              </span>
                            </Link>
                          </div>
                        </div>

                        {/* Image Illustration (Right) */}
                        <div className="hidden md:flex flex-1 shrink-0 items-end justify-end relative overflow-hidden max-w-lg right-0 bottom-0 pointer-events-none">
                           {/* Gradient fade on the left side of the image so it blends into white if necessary, though bg is white */}
                           <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                           
                           <img 
                             src="/images/desk_character.jpg" 
                             alt="Illustration" 
                             className="w-full h-full object-cover object-right-bottom mix-blend-multiply"
                           />
                        </div>

                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              <div className="w-full space-y-4 relative z-10">
                <div className="flex items-center gap-4 w-full mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                    <History className="h-6 w-6 text-[#57BC90]" /> Log Coaching
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
                </div>
                <div className="w-full mt-8">
                  <CoachingTracker logs={myCoachingLogs.filter((log: any) => !log.title.startsWith('Diskusi: ')).sort((a: any, b: any) => {
                    if (a.isClosed === b.isClosed) {
                      if (new Date(a.date).getTime() !== new Date(b.date).getTime()) {
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                      }
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                    return a.isClosed ? 1 : -1;
                  })} coacheeId={user.id} coacheeName={user.name} isReadOnly={true} isCoachee={true} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
