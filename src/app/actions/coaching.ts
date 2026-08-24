'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { sendScheduleAgreedEmail } from '@/lib/mailer';

export async function addCoachingLog(data: {
  coacheeId: string;
  date: string;
  title: string;
  notes: string;
  nextSessionDate?: string | null;
  isDraft?: boolean;
  actionItems?: { text: string; dueDate?: Date | string | null }[];
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const coachId = session.user.id;

  try {
    const log = await prisma.coachingLog.create({
      data: {
        coachId,
        coacheeId: data.coacheeId,
        date: new Date(data.date),
        title: data.title,
        notes: data.notes,
        isDraft: data.isDraft || false,
        nextSessionDate: data.nextSessionDate ? new Date(data.nextSessionDate) : null,
        actionItems: {
          create: data.actionItems?.map(item => ({
            text: item.text,
            dueDate: item.dueDate ? new Date(item.dueDate) : null,
          })) || []
        }
      },
      include: {
        actionItems: true,
      }
    });

    revalidatePath(`/team/${data.coacheeId}`);
    revalidatePath(`/profile`);
    return { success: true, log };
  } catch (error) {
    console.error('Error adding coaching log:', error);
    return { success: false, error: 'Failed to add log' };
  }
}

export async function deleteCoachingLog(id: string, coacheeId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const coachId = session.user.id;

  try {
    const log = await prisma.coachingLog.findUnique({
      where: { id },
    });

    if (!log || log.coachId !== coachId) {
      throw new Error('Unauthorized or not found');
    }

    await prisma.coachingLog.delete({
      where: { id },
    });

    revalidatePath(`/team/${coacheeId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting coaching log:', error);
    return { success: false, error: 'Failed to delete log' };
  }
}

export async function updateCoachingLog(id: string, data: {
  coacheeId: string;
  date: string;
  title: string;
  notes: string;
  nextSessionDate?: string | null;
  isDraft?: boolean;
  actionItems?: { text: string; dueDate?: Date | string | null }[];
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const coachId = session.user.id;

  try {
    const log = await prisma.coachingLog.findUnique({
      where: { id },
    });

    if (!log || log.coachId !== coachId) {
      throw new Error('Unauthorized or not found');
    }

    // Delete existing action items and recreate them to easily handle updates
    await prisma.actionItem.deleteMany({
      where: { coachingLogId: id }
    });

    const updatedLog = await prisma.coachingLog.update({
      where: { id },
      data: {
        date: new Date(data.date),
        title: data.title,
        notes: data.notes,
        isDraft: data.isDraft || false,
        nextSessionDate: data.nextSessionDate ? new Date(data.nextSessionDate) : null,
        actionItems: {
          create: data.actionItems?.map(item => ({
            text: item.text,
            dueDate: item.dueDate ? new Date(item.dueDate) : null,
          })) || []
        }
      },
      include: {
        actionItems: true,
      }
    });

    revalidatePath(`/team/${data.coacheeId}`);
    revalidatePath(`/profile`);
    return { success: true, log: updatedLog };
  } catch (error) {
    console.error('Error updating coaching log:', error);
    return { success: false, error: 'Failed to update log' };
  }
}

export async function addCoachingResponse(id: string, response: string, coacheeId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { position: true, role: true }
    });

    if (user?.position !== 'Deputi Direksi Wilayah' && user?.position !== 'Asisten Deputi' && user?.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only Deputi or Asisten Deputi can add responses');
    }

    const existingLog = await prisma.coachingLog.findUnique({
      where: { id },
      select: { response: true, updatedAt: true }
    });

    const timestamp = Date.now();
    const finalResponse = `${response}@@@${timestamp}`;

    const updatedLog = await prisma.coachingLog.update({
      where: { id },
      data: {
        response: finalResponse
      },
    });

    revalidatePath(`/team/${coacheeId}`);
    return { success: true, log: updatedLog };
  } catch (error) {
    console.error('Error adding coaching response:', error);
    return { success: false, error: 'Failed to add response' };
  }
}

export async function updateActionItemFollowUp(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  const actionItemId = formData.get('actionItemId') as string;
  const followUpNotes = formData.get('followUpNotes') as string;
  const file = formData.get('evidenceFile') as File | null;
  const coacheeId = formData.get('coacheeId') as string;

  if (!actionItemId) {
    return { success: false, error: 'Invalid action item' };
  }

  try {
    let evidenceUrl = undefined;
    let evidenceName = undefined;

    if (file && file.size > 0) {
      if (file.size > 1024 * 1024) {
        return { success: false, error: 'Ukuran file melebihi 1MB' };
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      const filepath = join(uploadDir, fileName);
      
      await writeFile(filepath, buffer);
      evidenceUrl = `/uploads/${fileName}`;
      evidenceName = file.name;
    }

    const updatedActionItem = await prisma.actionItem.update({
      where: { id: actionItemId },
      data: {
        followUpNotes,
        ...(evidenceUrl ? { evidenceUrl, evidenceName } : {})
      }
    });

    revalidatePath(`/profile`);
    revalidatePath(`/team/${coacheeId}`);
    revalidatePath(`/coaching`);
    
    return { success: true, actionItem: updatedActionItem };
  } catch (error) {
    console.error('Error updating follow up:', error);
    return { success: false, error: 'Failed to save follow up' };
  }
}

export async function closeCoachingLog(id: string, coacheeId: string, nextSessionDate?: string | null) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const existingLog = await prisma.coachingLog.findUnique({
      where: { id },
      include: { actionItems: true }
    });

    if (!existingLog) {
      return { success: false, error: 'Log not found' };
    }

    if (existingLog.coachId !== session.user.id) {
      return { success: false, error: 'Unauthorized to close this log' };
    }

    // Check if all action items have followUpNotes or evidenceUrl
    if (existingLog.actionItems.length > 0) {
      const allFollowedUp = existingLog.actionItems.every((item: any) => 
        (item.followUpNotes && item.followUpNotes.trim().length > 0) || !!item.evidenceUrl
      );
      if (!allFollowedUp) {
        return { success: false, error: 'Semua Action Items (Renaksi) atau eviden harus diisi oleh coachee sebelum sesi dapat ditutup.' };
      }
    }

    const updateData: any = { isClosed: true };
    if (nextSessionDate !== undefined) {
      updateData.nextSessionDate = nextSessionDate ? new Date(nextSessionDate) : null;
    }

    const updatedLog = await prisma.coachingLog.update({
      where: { id },
      data: updateData,
      include: { coach: true, coachee: true }
    });

    if (nextSessionDate) {
      await sendScheduleAgreedEmail(
        updatedLog.coach.email || '',
        updatedLog.coach.name || 'Coach',
        updatedLog.coachee.email || '',
        updatedLog.coachee.name || 'Coachee',
        new Date(nextSessionDate)
      );
    }

    // Also close all open discussion notes for this coachee
    await prisma.coachingLog.updateMany({
      where: {
        coacheeId: coacheeId,
        title: { startsWith: 'Diskusi: ' },
        isClosed: false
      },
      data: {
        isClosed: true
      }
    });

    revalidatePath(`/team/${coacheeId}`);
    revalidatePath(`/profile`);
    return { success: true, log: updatedLog };
  } catch (error) {
    console.error('Error closing coaching log:', error);
    return { success: false, error: 'Failed to close session' };
  }
}

export async function updateNextSessionDate(id: string, coacheeId: string, nextSessionDate: string | null) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const updatedLog = await prisma.coachingLog.update({
      where: { id },
      data: {
        nextSessionDate: nextSessionDate ? new Date(nextSessionDate) : null,
      },
      include: { coach: true, coachee: true }
    });

    if (nextSessionDate) {
      await sendScheduleAgreedEmail(
        updatedLog.coach.email || '',
        updatedLog.coach.name || 'Coach',
        updatedLog.coachee.email || '',
        updatedLog.coachee.name || 'Coachee',
        new Date(nextSessionDate)
      );
    }

    revalidatePath(`/team/${coacheeId}`);
    revalidatePath(`/profile`);
    revalidatePath(`/coaching`);
    return { success: true, log: updatedLog };
  } catch (error) {
    console.error('Error updating next session date:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update next session date';
    return { success: false, error: msg };
  }
}
