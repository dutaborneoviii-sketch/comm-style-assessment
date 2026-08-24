"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { uploadQuestionsExcel } from "@/lib/actions";
import { UploadCloud, Loader2, FileSpreadsheet, CheckCircle2, AlertCircle, DownloadCloud } from "lucide-react";
import * as xlsx from 'xlsx';

export function UploadExcel() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    // Buat data template (baris pertama adalah judul kolom)
    const templateData = [
      {
        No: 1,
        Pertanyaan: "Contoh: Saat berada di bawah tekanan, Anda cenderung...",
        A: "Mengambil kendali dan bertindak cepat",
        B: "Mencari dukungan dan berbicara dengan orang lain",
        C: "Mengalah dan menghindari konflik",
        D: "Menganalisis situasi secara mendalam sendirian"
      }
    ];

    // Buat worksheet dan workbook
    const ws = xlsx.utils.json_to_sheet(templateData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Template_Pertanyaan");

    // Atur lebar kolom agar rapi
    ws["!cols"] = [
      { wch: 5 },   // No
      { wch: 50 },  // Pertanyaan
      { wch: 40 },  // A
      { wch: 40 },  // B
      { wch: 40 },  // C
      { wch: 40 }   // D
    ];

    // Unduh file
    xlsx.writeFile(wb, "Template_Kuesioner_COGNIT.xlsx");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      setError("Harap unggah file Excel berformat .xlsx");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await uploadQuestionsExcel(formData);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal mengunggah file. Pastikan format kolom sesuai panduan.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 text-slate-800 dark:text-slate-200 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="space-y-1 max-w-xl">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#57BC90]" />
            Impor dari Excel
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Unggah file .xlsx untuk mengganti seluruh pertanyaan sekaligus.<br /> 
            Kolom wajib: <strong>Pertanyaan, A, B, C, D</strong>. Aksi ini akan menghapus semua soal yang lama.
          </p>
        </div>
        
        <div className="shrink-0 flex items-center gap-3 flex-wrap">
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            className="border-[#57BC90] text-[#57BC90] hover:bg-[#57BC90]/10"
          >
            <DownloadCloud className="w-4 h-4 mr-2" />
            Unduh Template
          </Button>

          <input
            type="file"
            accept=".xlsx"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-[#015249] hover:bg-[#013b34] text-white shadow-md shadow-[#015249]/20"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4 mr-2" />
            )}
            {isUploading ? "Memproses..." : "Pilih File .xlsx"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-100">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 border border-green-100">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Berhasil! Seluruh pertanyaan telah diperbarui dari file Excel.</span>
        </div>
      )}
    </div>
  );
}
