import { getReminderDaysSetting, getEmailTemplates } from "@/app/actions/settings";
import EmailSettingsClient from "./email-settings-client";

export const metadata = {
  title: 'Pengaturan Email - Administrator',
};

export default async function EmailSettingsPage() {
  const currentReminderDays = await getReminderDaysSetting();
  const currentTemplates = await getEmailTemplates();

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto mt-16 md:mt-0">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Pengaturan Email & Notifikasi</h1>
          <p className="text-muted-foreground text-sm">
            Atur penjadwalan email notifikasi, kustomisasi template pesan, dan uji coba sistem pengiriman SMTP Anda.
          </p>
        </div>
      </div>

      <EmailSettingsClient 
        initialReminderDays={currentReminderDays} 
        initialTemplates={currentTemplates}
      />
    </div>
  );
}
