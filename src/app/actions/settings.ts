"use server";

import { prisma } from "@/lib/prisma";
import { getUserAccess } from "@/lib/access";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sendTestEmail, sendTemplateTestEmail } from "@/lib/mailer";

const COOLDOWN_KEY = "assessment_cooldown_months";
const DEFAULT_COOLDOWN = "3"; // Default 3 bulan

// Ambil nilai cooldown
export async function getCooldownSetting(): Promise<number> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: COOLDOWN_KEY },
    });
    if (!setting) {
      // Seed default value jika belum ada
      const defaultSetting = await prisma.systemSetting.create({
        data: { key: COOLDOWN_KEY, value: DEFAULT_COOLDOWN },
      });
      return parseInt(defaultSetting.value, 10);
    }
    return parseInt(setting.value, 10);
  } catch (error) {
    console.error("Error fetching cooldown setting:", error);
    return parseInt(DEFAULT_COOLDOWN, 10);
  }
}

// Update nilai cooldown
export async function updateCooldownSetting(months: string) {
  try {
    await prisma.systemSetting.upsert({
      where: { key: COOLDOWN_KEY },
      update: { value: months },
      create: { key: COOLDOWN_KEY, value: months },
    });
    revalidatePath("/profile");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating cooldown setting:", error);
    return { error: error.message || "Gagal memperbarui pengaturan." };
  }
}

export async function getReminderDaysSetting() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'reminder_days' }
    });
    return parseInt(setting?.value || '1', 10);
  } catch (error) {
    console.error("Error fetching reminder setting:", error);
    return 1;
  }
}

export async function saveReminderDaysSetting(days: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No session');
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  try {
    await prisma.systemSetting.upsert({
      where: { key: 'reminder_days' },
      update: { value: days.toString() },
      create: { key: 'reminder_days', value: days.toString() }
    });
    revalidatePath('/admin/email-settings');
    return { success: true };
  } catch (error: any) {
    console.error("Error saving reminder setting:", error);
    return { success: false, error: error.message };
  }
}

export async function triggerTestEmail(email: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No session');
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  try {
    const result = await sendTestEmail(email);
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function triggerTemplateTestEmail(email: string, templateKey: string, templateContent: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No session');
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  try {
    const result = await sendTemplateTestEmail(email, templateKey, templateContent);
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

const defaultEmailTemplates = {
  email_tpl_agreed_coach: `Halo {{coachName}},

Jadwal sesi coaching Anda selanjutnya dengan Coachee {{coacheeName}} telah disepakati dan diinput ke dalam sistem.

Pelaksanaan pada tanggal: {{date}}

Harap persiapkan diri Anda.

Salam,
Tim Belian`,
  email_tpl_agreed_coachee: `Halo {{coacheeName}},

Jadwal sesi coaching Anda selanjutnya dengan Coach {{coachName}} telah disepakati dan diinput ke dalam sistem.

Pelaksanaan pada tanggal: {{date}}

Harap persiapkan evidens atau rencana aksi Anda sebelum sesi dimulai.

Salam,
Tim Belian`,
  email_tpl_reminder_coach: `Halo {{coachName}},

Ini adalah pengingat bahwa Anda memiliki jadwal sesi coaching dengan Coachee {{coacheeName}} yang akan datang.

Pelaksanaan pada tanggal: {{date}}

Jangan lupa untuk mempersiapkan diskusi terkait.

Salam,
Tim Belian`,
  email_tpl_reminder_coachee: `Halo {{coacheeName}},

Ini adalah pengingat bahwa Anda memiliki jadwal sesi coaching dengan Coach {{coachName}} yang akan datang.

Pelaksanaan pada tanggal: {{date}}

Pastikan Anda telah mengisi evidens dan progress action plan di sistem sebelum sesi dimulai.

Salam,
Tim Belian`
};

export async function getEmailTemplates() {
  const keys = Object.keys(defaultEmailTemplates);
  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: keys } }
  });
  
  const result: Record<string, string> = { ...defaultEmailTemplates };
  for (const s of settings) {
    if (s.value.trim() !== '') {
      result[s.key] = s.value;
    }
  }
  
  return result;
}

export async function saveEmailTemplates(templates: Record<string, string>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No session');
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  try {
    for (const [key, value] of Object.entries(templates)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }
    revalidatePath('/admin/email-settings');
    return { success: true };
  } catch (error: any) {
    console.error("Error saving email templates:", error);
    return { success: false, error: error.message };
  }
}



