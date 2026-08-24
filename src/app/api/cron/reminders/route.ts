import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendReminderEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verifikasi Authorization header untuk mengamankan cron endpoint (Opsional namun disarankan)
  const authHeader = request.headers.get('authorization');
  // Misalnya, Anda bisa cek token statis seperti: `Bearer SECRET_CRON_TOKEN`
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse('Unauthorized', { status: 401 });
  // }

  try {
    // 1. Ambil pengaturan H-X dari database
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'reminder_days' }
    });
    const daysBefore = parseInt(setting?.value || '1', 10);

    // 2. Tentukan rentang waktu target (misal: H-2 berarti cari yang jadwalnya 2 hari ke depan)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDateStart = new Date(today);
    targetDateStart.setDate(today.getDate() + daysBefore);
    
    const targetDateEnd = new Date(targetDateStart);
    targetDateEnd.setDate(targetDateEnd.getDate() + 1);

    // 3. Cari sesi coaching yang sesuai
    const upcomingSessions = await prisma.coachingLog.findMany({
      where: {
        isClosed: false,
        nextSessionDate: {
          gte: targetDateStart,
          lt: targetDateEnd
        }
      },
      include: {
        coach: true,
        coachee: true
      }
    });

    let sentCount = 0;
    const errors: string[] = [];

    // 4. Kirim email untuk masing-masing
    for (const session of upcomingSessions) {
      if (session.nextSessionDate) {
        const result = await sendReminderEmail(
          session.coach.email || '',
          session.coach.name || 'Coach',
          session.coachee.email || '',
          session.coachee.name || 'Coachee',
          session.nextSessionDate
        );
        
        if (result.success) {
          sentCount++;
        } else {
          errors.push(`Failed for session ${session.id}: ${result.error}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cron executed. Found ${upcomingSessions.length} sessions, sent ${sentCount} reminders.`,
      targetDate: targetDateStart,
      daysBefore,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
