import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import AdminLayoutWrapper from '@/components/admin/admin-layout-wrapper';
import { getFeatureFlagsMap } from '@/app/actions/features';
import { AutoLogout } from '@/components/auto-logout';
import { getUserAccess } from '@/lib/access';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  let isAdminView = false;
  let notifications: any[] = [];
  
  let dbUser = null;
  let featuresMap: Record<string, boolean> = {};
  
  if (session?.user?.id) {
    dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    const viewMode = cookies().get('view-mode')?.value || 'admin';
    
    let userRoleGroup = "Pelaksana";
    if (dbUser?.pangkat) userRoleGroup = dbUser.pangkat;
    
    if (dbUser) {
      featuresMap = await getFeatureFlagsMap(userRoleGroup, dbUser.department, dbUser.employeeLocation);
    }
    
    const access = getUserAccess(dbUser || {});
    
    const isCoachView = (access.isAdmin && viewMode === 'admin') || 
                        access.isCoach && (cookies().get('asisten-mode')?.value || 'coach') !== 'coachee';
    
    if (isCoachView) {
      // Get logs where action items have been created/updated recently, and logs with responses
      const [logsWithActionItems, logsWithResponse] = await Promise.all([
        prisma.coachingLog.findMany({
          where: {
            coachId: session.user.id,
            actionItems: {
              some: {} // Any action item
            }
          },
          include: {
            coachee: { select: { name: true } },
            actionItems: true
          },
          orderBy: { updatedAt: 'desc' }
        }),
        prisma.coachingLog.findMany({
          where: {
            coachId: session.user.id,
            response: { not: null }
          },
          include: { coachee: { select: { name: true } } },
          orderBy: { updatedAt: 'desc' }
        })
      ]);

      logsWithActionItems.forEach((log: any) => {
        let latestUpdate = log.updatedAt;
        let hasEvidence = false;
        log.actionItems.forEach((ai: any) => {
           if (ai.updatedAt > latestUpdate) latestUpdate = ai.updatedAt;
           if (ai.evidenceUrl) hasEvidence = true;
        });
        notifications.push({
          id: `ai-${log.id}`,
          title: hasEvidence ? 'Update Eviden/Bukti' : 'Update Action Item',
          message: hasEvidence 
            ? `${log.coachee?.name || 'User'} telah melampirkan bukti/status pada Action Items.`
            : `${log.coachee?.name || 'User'} telah menambahkan/memperbarui Action Plan (R-O-W).`,
          logId: log.id,
          type: 'action_item',
          date: latestUpdate
        });
      });

      logsWithResponse.forEach((log: any) => {
        notifications.push({
          id: `resp-${log.id}`,
          title: 'Tanggapan Coaching',
          message: `${log.coachee?.name || 'User'} telah memberikan tanggapan pada sesi coaching.`,
          logId: log.id,
          type: 'response',
          date: log.updatedAt
        });
      });

    } else {
      // Coachee View Notifications
      const recentLogs = await prisma.coachingLog.findMany({
        where: { coacheeId: session.user.id },
        include: { coach: { select: { name: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 15
      });

      recentLogs.forEach(log => {
        if (log.isClosed) {
          notifications.push({
            id: `close-${log.id}`,
            title: 'Sesi Selesai',
            message: `Sesi coaching dengan ${log.coach?.name || 'Coach'} telah ditutup.`,
            logId: log.id,
            type: 'response',
            date: log.updatedAt
          });
        } else {
          notifications.push({
            id: `new-${log.id}`,
            title: 'Sesi Coaching Aktif',
            message: `Ada sesi coaching baru/update dari ${log.coach?.name || 'Coach'}.`,
            logId: log.id,
            type: 'action_item',
            date: log.updatedAt
          });
        }
      });
    }

    notifications.sort((a, b) => b.date.getTime() - a.date.getTime());
    notifications = notifications.slice(0, 15);
  }

  if (session?.user && dbUser) {
    const viewMode = (cookies().get('view-mode')?.value as 'admin' | 'user') || 'admin';
    const asistenMode = cookies().get('asisten-mode')?.value || 'coach';
    return (
      <AdminLayoutWrapper user={dbUser} viewMode={viewMode} asistenMode={asistenMode} notifications={notifications} featuresMap={featuresMap}>
        <AutoLogout />
        {children}
      </AdminLayoutWrapper>
    );
  }

  return (
    <div className="w-full">
      <AutoLogout />
      {children}
    </div>
  );
}
