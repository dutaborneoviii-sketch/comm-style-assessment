"use client";

import { useState } from "react";
import { saveReminderDaysSetting, saveEmailTemplates, triggerTestEmail, triggerTemplateTestEmail } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Mail, Save, CheckCircle, AlertCircle, FileText, Send } from "lucide-react";

interface EmailSettingsClientProps {
  initialReminderDays: number;
  initialTemplates: Record<string, string>;
}

export default function EmailSettingsClient({ initialReminderDays, initialTemplates }: EmailSettingsClientProps) {
  const [reminderDays, setReminderDays] = useState(initialReminderDays.toString());
  const [templates, setTemplates] = useState<Record<string, string>>(initialTemplates);
  const [testEmail, setTestEmail] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const resultDays = await saveReminderDaysSetting(parseInt(reminderDays, 10));
      const resultTpl = await saveEmailTemplates(templates);
      
      if (resultDays.success && resultTpl.success) {
        setSaveMessage({ type: 'success', text: 'Pengaturan berhasil disimpan.' });
      } else {
        setSaveMessage({ type: 'error', text: resultDays.error || resultTpl.error || 'Terjadi kesalahan.' });
      }
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'Terjadi kesalahan.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setTestMessage({ type: 'error', text: 'Format email tidak valid.' });
      return;
    }
    
    setIsTesting(true);
    setTestMessage(null);
    try {
      const result = await triggerTestEmail(testEmail);
      if (result.success) {
        setTestMessage({ type: 'success', text: 'Email simulasi berhasil dikirim!' });
      } else {
        setTestMessage({ type: 'error', text: `Gagal mengirim: ${result.error}` });
      }
    } catch (error: any) {
      setTestMessage({ type: 'error', text: error.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestTemplate = async (templateKey: string) => {
    if (!testEmail) {
      setSaveMessage({ type: 'error', text: 'Masukkan alamat email di panel "Simulasi Pengiriman Email" terlebih dahulu untuk menguji template.' });
      return;
    }
    
    setIsTestingKey(templateKey);
    setSaveMessage(null);
    try {
      const content = templates[templateKey] || '';
      const result = await triggerTemplateTestEmail(testEmail, templateKey, content);
      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Email template berhasil dikirim ke ' + testEmail });
      } else {
        setSaveMessage({ type: 'error', text: `Gagal mengirim: ${result.error}` });
      }
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setIsTestingKey(null);
    }
  };

  const handleTemplateChange = (key: string, value: string) => {
    setTemplates(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Jadwal Reminder (H-X)
          </CardTitle>
          <CardDescription>
            Atur berapa hari sebelum pelaksanaan (Hari H) email notifikasi pengingat sesi coaching akan dikirimkan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Waktu Pengiriman</label>
            <select 
              value={reminderDays} 
              onChange={(e) => setReminderDays(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
            >
              <option value="1">H-1 (1 Hari Sebelumnya)</option>
              <option value="2">H-2 (2 Hari Sebelumnya)</option>
              <option value="3">H-3 (3 Hari Sebelumnya)</option>
              <option value="4">H-4 (4 Hari Sebelumnya)</option>
              <option value="5">H-5 (5 Hari Sebelumnya)</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Email reminder akan dikirim setiap pukul 00:00 - 08:00 pada hari tersebut melalui Cron Job.
            </p>
          </div>

          {saveMessage && (
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${saveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'}`}>
              {saveMessage.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
              <div className="text-sm font-medium">{saveMessage.text}</div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Pengaturan
          </Button>
        </CardFooter>
      </Card>

      {/* Test Email Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-500" />
            Simulasi Pengiriman Email
          </CardTitle>
          <CardDescription>
            Masukkan alamat email Anda untuk menguji coba konfigurasi SMTP sistem saat ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Tujuan Tester</label>
            <Input 
              type="email" 
              placeholder="nama@email.com" 
              value={testEmail} 
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>

          {testMessage && (
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${testMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'}`}>
              {testMessage.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
              <div className="text-sm font-medium break-all">{testMessage.text}</div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleTestEmail} disabled={isTesting || !testEmail} className="w-full">
            {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
            Test Kirim Notifikasi
          </Button>
        </CardFooter>
      </Card>
      </div>

      {/* Templates Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Kustomisasi Template Email
          </CardTitle>
          <CardDescription>
            Ubah isi dari email yang akan dikirimkan. Gunakan kode variabel berikut di dalam teks Anda:
            <br/><br/>
            <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">{"{{coachName}}"}</code> : Nama Coach<br/>
            <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">{"{{coacheeName}}"}</code> : Nama Coachee<br/>
            <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">{"{{date}}"}</code> : Tanggal Pelaksanaan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Jadwal Baru Disepakati (Untuk Coach)</label>
              <Button variant="outline" size="sm" onClick={() => handleTestTemplate('email_tpl_agreed_coach')} disabled={isTestingKey === 'email_tpl_agreed_coach'}>
                {isTestingKey === 'email_tpl_agreed_coach' ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />}
                Test Kirim
              </Button>
            </div>
            <textarea 
              value={templates['email_tpl_agreed_coach'] || ''}
              onChange={(e) => handleTemplateChange('email_tpl_agreed_coach', e.target.value)}
              className="w-full min-h-[150px] p-3 text-sm rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Jadwal Baru Disepakati (Untuk Coachee)</label>
              <Button variant="outline" size="sm" onClick={() => handleTestTemplate('email_tpl_agreed_coachee')} disabled={isTestingKey === 'email_tpl_agreed_coachee'}>
                {isTestingKey === 'email_tpl_agreed_coachee' ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />}
                Test Kirim
              </Button>
            </div>
            <textarea 
              value={templates['email_tpl_agreed_coachee'] || ''}
              onChange={(e) => handleTemplateChange('email_tpl_agreed_coachee', e.target.value)}
              className="w-full min-h-[150px] p-3 text-sm rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 font-mono"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reminder Sesi H-X (Untuk Coach)</label>
              <Button variant="outline" size="sm" onClick={() => handleTestTemplate('email_tpl_reminder_coach')} disabled={isTestingKey === 'email_tpl_reminder_coach'}>
                {isTestingKey === 'email_tpl_reminder_coach' ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />}
                Test Kirim
              </Button>
            </div>
            <textarea 
              value={templates['email_tpl_reminder_coach'] || ''}
              onChange={(e) => handleTemplateChange('email_tpl_reminder_coach', e.target.value)}
              className="w-full min-h-[150px] p-3 text-sm rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 font-mono"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reminder Sesi H-X (Untuk Coachee)</label>
              <Button variant="outline" size="sm" onClick={() => handleTestTemplate('email_tpl_reminder_coachee')} disabled={isTestingKey === 'email_tpl_reminder_coachee'}>
                {isTestingKey === 'email_tpl_reminder_coachee' ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />}
                Test Kirim
              </Button>
            </div>
            <textarea 
              value={templates['email_tpl_reminder_coachee'] || ''}
              onChange={(e) => handleTemplateChange('email_tpl_reminder_coachee', e.target.value)}
              className="w-full min-h-[150px] p-3 text-sm rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 font-mono"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-end gap-4">
          {saveMessage && (
            <div className={`w-full flex items-start gap-3 p-4 rounded-lg border ${saveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'}`}>
              {saveMessage.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
              <div className="text-sm font-medium">{saveMessage.text}</div>
            </div>
          )}
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Semua Pengaturan
          </Button>
        </CardFooter>
      </Card>

    </div>
  );
}
