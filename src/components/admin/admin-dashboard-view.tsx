import { StyleDistributionChart } from "@/components/dashboard/style-distribution-chart";
import { prisma } from "@/lib/prisma";
import { Users, BookOpen, Clock, FileText, ArrowUp, ArrowDown } from "lucide-react";

export default async function AdminDashboardView({ user }: { user: any }) {
  // Fetch stats
  const totalUsers = await prisma.user.count();
  const totalApprovedUsers = await prisma.user.count({ where: { status: { in: ['APPROVED', 'ACTIVE'] } } });
  const totalPendingUsers = await prisma.user.count({ where: { status: 'PENDING' } });
  const totalInactiveUsers = await prisma.user.count({ where: { status: 'INACTIVE' } });
  const totalCoaching = await prisma.coachingLog.count();
  const totalActiveCoaching = await prisma.coachingLog.count({ where: { isClosed: false } });
  const totalClosedCoaching = await prisma.coachingLog.count({ where: { isClosed: true } });
  const usersWithAssessment = await prisma.user.count({
    where: {
      status: { in: ['APPROVED', 'ACTIVE'] },
      assessments: { some: {} }
    }
  });

  // Re-fetch all charts data for the charts
  const allRegionUsers = await prisma.user.findMany({
    where: { status: 'APPROVED' },
    include: {
      assessments: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  const allStyleCounts: Record<string, { total: number, departments: Record<string, number> }> = {};
  allRegionUsers.forEach(member => {
    if (member.assessments && member.assessments.length > 0) {
      const assessment = member.assessments[0];
      const simplify = (s: string) => {
        const lower = s.toLowerCase();
        if (lower.includes("directive") || lower.includes("direktif") || lower.includes("driver")) return { id: "Direktif", en: "Directive" };
        if (lower.includes("expressive") || lower.includes("ekspresif") || lower.includes("initiator")) return { id: "Ekspresif", en: "Expressive" };
        if (lower.includes("harmonious") || lower.includes("harmonis") || lower.includes("amiable")) return { id: "Harmonis", en: "Harmonious" };
        if (lower.includes("analytical") || lower.includes("analitis") || lower.includes("thinker")) return { id: "Analitis", en: "Analytical" };
        return { id: s, en: s };
      };

      const p = simplify(assessment.primaryStyle);
      let styleName = `${p.id} (${p.en})`;
      if (assessment.isCombination && assessment.secondaryStyle) {
        const s = simplify(assessment.secondaryStyle);
        const combo = [p.id, s.id];
        if (combo.includes("Direktif") && combo.includes("Ekspresif")) styleName = "Direktif + Ekspresif";
        else if (combo.includes("Direktif") && combo.includes("Analitis")) styleName = "Direktif + Analitis";
        else if (combo.includes("Harmonis") && combo.includes("Analitis")) styleName = "Harmonis + Analitis";
        else if (combo.includes("Ekspresif") && combo.includes("Harmonis")) styleName = "Ekspresif + Harmonis";
        else if (combo.includes("Direktif") && combo.includes("Harmonis")) styleName = "Direktif + Harmonis";
        else styleName = combo.sort().join(" + ");
      }
      if (!allStyleCounts[styleName]) allStyleCounts[styleName] = { total: 0, departments: {} };
      allStyleCounts[styleName].total += 1;
      const deptName = member.department || 'Tidak Diketahui';
      allStyleCounts[styleName].departments[deptName] = (allStyleCounts[styleName].departments[deptName] || 0) + 1;
    }
  });

  const allChartData = Object.entries(allStyleCounts).map(([name, data]) => ({
    name,
    count: data.total,
    departments: data.departments
  }));

  // Recent logs
  const recentLogs = await prisma.coachingLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      coach: { select: { name: true } },
      coachee: { select: { name: true, department: true } }
    }
  });

  // Recent users
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    where: { status: 'APPROVED' },
    select: { name: true, email: true, department: true }
  });

  return (
    <div className="flex flex-col gap-6 max-w-[1920px] mx-auto w-full relative z-10 pt-2 -mt-10 pb-8 px-4">
      
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-start">
          <div className="w-full">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status Pengisian Kuisioner</p>
            <div className="flex justify-between items-center w-full">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">{usersWithAssessment.toLocaleString()}</h2>
              <div className="w-28 h-28 relative shrink-0 -my-4">
                <img src="/images/survey_icon.jpg" alt="Survey" className="w-full h-full object-contain mix-blend-multiply scale-110" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <p className="text-emerald-500 text-sm font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {usersWithAssessment} <span className="text-slate-400 font-medium">Selesai mengisi</span>
              </p>
              <p className="text-amber-500 text-sm font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {totalApprovedUsers - usersWithAssessment} <span className="text-slate-400 font-medium">Belum mengisi</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-start">
          <div className="w-full">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Users</p>
            <div className="flex justify-between items-center w-full">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">{totalUsers.toLocaleString()}</h2>
              <div className="w-28 h-28 relative shrink-0 -my-4">
                <img src="/images/team_icon_noborder.jpg" alt="Total Users" className="w-full h-full object-contain mix-blend-multiply scale-110" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <p className="text-emerald-500 text-sm font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {totalApprovedUsers} <span className="text-slate-400 font-medium">Aktif</span>
              </p>
              <p className="text-slate-500 text-sm font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                {totalInactiveUsers} <span className="text-slate-400 font-medium">Nonaktif</span>
              </p>
              <p className="text-amber-500 text-sm font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {totalPendingUsers} <span className="text-slate-400 font-medium">Menunggu Approval</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-start">
          <div className="w-full">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Coaching Sessions</p>
            <div className="flex justify-between items-center w-full">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">{totalCoaching.toLocaleString()}</h2>
              <div className="w-28 h-28 relative shrink-0 -my-4">
                <img src="/images/coaching_icon.jpg" alt="Coaching Sessions" className="w-full h-full object-contain mix-blend-multiply scale-110" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <p className="text-emerald-500 text-sm font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {totalActiveCoaching} <span className="text-slate-400 font-medium">Aktif</span>
              </p>
              <p className="text-slate-500 text-sm font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                {totalClosedCoaching} <span className="text-slate-400 font-medium">Ditutup</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px]">
          <StyleDistributionChart 
            data={allChartData} 
            departmentName="Semua Data"
            variant="bar"
            className="border-none shadow-none bg-transparent hover:shadow-none p-0 m-0"
          />
        </div>
        
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px]">
          <div className="flex-1 w-full flex items-center justify-center">
            <StyleDistributionChart 
              data={allChartData} 
              departmentName="Semua Data Bidang"
              variant="pie"
              className="border-none shadow-none bg-transparent hover:shadow-none p-0 m-0 w-full"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
