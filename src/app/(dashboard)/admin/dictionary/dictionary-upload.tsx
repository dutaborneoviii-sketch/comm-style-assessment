"use client";

import { useState } from "react";
import { uploadDictionaryAction, getTemplateDataAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import * as xlsx from "xlsx";

export function DictionaryUpload({ lastUpdated }: { lastUpdated: string | null }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const data = await getTemplateDataAction();
      const wb = xlsx.utils.book_new();
      
      const wsProfil = xlsx.utils.json_to_sheet(data.profilData);
      xlsx.utils.book_append_sheet(wb, wsProfil, "Profil Utama");

      const wsDetail = xlsx.utils.json_to_sheet(data.detailData);
      xlsx.utils.book_append_sheet(wb, wsDetail, "Detail Panduan");

      xlsx.writeFile(wb, "Template_Kamus_Gaya_Komunikasi.xlsx");
    } catch (error) {
      console.error("Gagal mengunduh template:", error);
      setMessage({ text: "Gagal menyusun template data.", type: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadDictionaryAction(formData);

    setIsUploading(false);
    if (res.success) {
      setMessage({ text: "Kamus berhasil diperbarui!", type: "success" });
      setFile(null);
    } else {
      setMessage({ text: res.error || "Gagal mengunggah kamus.", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Upload Data Kamus</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Perbarui seluruh konten panduan gaya komunikasi menggunakan file Excel.
            </p>
            {lastUpdated && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                Pembaruan terakhir: {lastUpdated}
              </p>
            )}
          </div>
          <Button onClick={handleDownloadTemplate} disabled={isDownloading} variant="outline" className="text-xs font-bold gap-2">
            {isDownloading ? <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            Unduh Template
          </Button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex items-center gap-4">
            <Input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex-1 cursor-pointer file:cursor-pointer"
            />
            <Button type="submit" disabled={!file || isUploading} className="gap-2 bg-[#015249] hover:bg-blue-700 text-white font-bold px-6">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </Button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
              <div>
                <h4 className="font-bold">{message.type === 'success' ? 'Berhasil' : 'Gagal'}</h4>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Petunjuk Pengisian</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>Pastikan file memiliki 2 sheet: <strong>Profil Utama</strong> dan <strong>Detail Panduan</strong>.</li>
          <li>Kolom <strong>Style_ID</strong> harus diisi sesuai ID gaya komunikasi (misal: <code>directive</code>, <code>expressive</code>, <code>dirAna</code>, dll).</li>
          <li>Untuk data berupa *list* atau daftar (seperti Suka / Hindari), gunakan baris baru (Alt+Enter di Excel) untuk memisahkan setiap poin.</li>
          <li>Pastikan nama kolom (Header) tidak diubah dari template aslinya.</li>
        </ul>
      </div>
    </div>
  );
}
