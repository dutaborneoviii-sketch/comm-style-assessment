import nodemailer from 'nodemailer';
import { getEmailTemplates } from '@/app/actions/settings';

// Konfigurasi SMTP transporter
// Anda perlu menambahkan SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS di .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const DEFAULT_FROM = process.env.SMTP_FROM || '"Admin Belian" <noreply@belian.com>';

function replaceTemplateVars(template: string, coachName: string, coacheeName: string, dateStr: string) {
  const plainText = template
    .replace(/\{\{coachName\}\}/g, coachName)
    .replace(/\{\{coacheeName\}\}/g, coacheeName)
    .replace(/\{\{date\}\}/g, dateStr);
    
  const htmlContent = plainText.replace(/\n/g, '<br/>');
  
  return `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
    ${htmlContent}
  </div>`;
}

export async function sendTestEmail(to: string) {
  try {
    const info = await transporter.sendMail({
      from: DEFAULT_FROM,
      to,
      subject: "Test Pengiriman Email Sistem Coaching",
      text: "Halo, jika Anda menerima pesan ini maka pengaturan SMTP telah berfungsi dengan baik.",
      html: "<p>Halo,</p><p>Jika Anda menerima pesan ini maka pengaturan SMTP telah berfungsi dengan baik.</p>",
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Test email error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendTemplateTestEmail(to: string, templateKey: string, templateContent: string) {
  try {
    let subject = "Test Template Email";
    if (templateKey.includes('agreed_coach')) subject = "Test: Jadwal Baru Disepakati (Untuk Coach)";
    else if (templateKey.includes('agreed_coachee')) subject = "Test: Jadwal Baru Disepakati (Untuk Coachee)";
    else if (templateKey.includes('reminder_coach')) subject = "Test: Reminder Sesi H-X (Untuk Coach)";
    else if (templateKey.includes('reminder_coachee')) subject = "Test: Reminder Sesi H-X (Untuk Coachee)";

    const htmlContent = replaceTemplateVars(templateContent, "Coach Budi", "Andi", "30 Agustus 2026");
    const plainTextContent = templateContent
      .replace(/\{\{coachName\}\}/g, "Coach Budi")
      .replace(/\{\{coacheeName\}\}/g, "Andi")
      .replace(/\{\{date\}\}/g, "30 Agustus 2026");

    const info = await transporter.sendMail({
      from: DEFAULT_FROM,
      to,
      subject,
      text: plainTextContent,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Test template email error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendScheduleAgreedEmail(
  coachEmail: string, 
  coachName: string, 
  coacheeEmail: string, 
  coacheeName: string, 
  sessionDate: Date
) {
  const dateStr = sessionDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const templates = await getEmailTemplates();
  
  try {
    // Kirim ke Coach
    if (coachEmail) {
      const htmlBody = replaceTemplateVars(templates['email_tpl_agreed_coach'], coachName, coacheeName, dateStr);
      await transporter.sendMail({
        from: DEFAULT_FROM,
        to: coachEmail,
        subject: `Jadwal Baru Sesi Coaching dengan ${coacheeName}`,
        html: htmlBody
      });
    }

    // Kirim ke Coachee
    if (coacheeEmail) {
      const htmlBody = replaceTemplateVars(templates['email_tpl_agreed_coachee'], coachName, coacheeName, dateStr);
      await transporter.sendMail({
        from: DEFAULT_FROM,
        to: coacheeEmail,
        subject: `Jadwal Baru Sesi Coaching dengan Coach ${coachName}`,
        html: htmlBody
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Schedule Agreed email error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendReminderEmail(
  coachEmail: string, 
  coachName: string, 
  coacheeEmail: string, 
  coacheeName: string, 
  sessionDate: Date
) {
  const dateStr = sessionDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const templates = await getEmailTemplates();
  
  try {
    if (coachEmail) {
      const htmlBody = replaceTemplateVars(templates['email_tpl_reminder_coach'], coachName, coacheeName, dateStr);
      await transporter.sendMail({
        from: DEFAULT_FROM,
        to: coachEmail,
        subject: `Reminder: Sesi Coaching dengan ${coacheeName} pada ${dateStr}`,
        html: htmlBody
      });
    }

    if (coacheeEmail) {
      const htmlBody = replaceTemplateVars(templates['email_tpl_reminder_coachee'], coachName, coacheeName, dateStr);
      await transporter.sendMail({
        from: DEFAULT_FROM,
        to: coacheeEmail,
        subject: `Reminder: Sesi Coaching dengan Coach ${coachName} pada ${dateStr}`,
        html: htmlBody
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Reminder email error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendResetPasswordEmail(to: string, name: string, newPassword: string) {
  try {
    const htmlContent = `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <p>Halo ${name},</p>
        <p>Password akun BELIAN Anda telah direset oleh Administrator.</p>
        <p>Berikut adalah password baru Anda:</p>
        <h3 style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; display: inline-block; letter-spacing: 2px;">${newPassword}</h3>
        <p>Harap segera login menggunakan password ini dan ganti password Anda demi keamanan.</p>
        <p>Terima kasih,<br>Tim BELIAN</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: DEFAULT_FROM,
      to,
      subject: "Informasi Reset Password Akun BELIAN",
      text: `Halo ${name}, password baru Anda adalah: ${newPassword}. Harap segera login dan ganti password Anda.`,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Reset password email error:", error);
    return { success: false, error: error.message };
  }
}
