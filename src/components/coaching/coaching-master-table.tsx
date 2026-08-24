"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageCircle, Calendar, Search, FileText, Sheet } from "lucide-react";
import { EditResponseDialog } from "@/components/coaching/edit-response-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function CoachingMasterTable({ logs, isDeputi }: { logs: any[], isDeputi: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter(log => {
    const query = searchQuery.toLowerCase();
    const coachName = (log.coach?.name || "").toLowerCase();
    const coacheeName = (log.coachee?.name || "").toLowerCase();
    const department = (log.coachee?.department || "").toLowerCase();
    const title = (log.title || "").toLowerCase();
    const notes = (log.notes || "").toLowerCase();
    
    return coachName.includes(query) || 
           coacheeName.includes(query) || 
           department.includes(query) || 
           title.includes(query) ||
           notes.includes(query);
  });

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rekap Coaching");

    worksheet.columns = [
      { header: "Tanggal", key: "tanggal", width: 15 },
      { header: "Asdep Bidang", key: "coach", width: 25 },
      { header: "Anggota Tim", key: "coachee", width: 30 },
      { header: "Topik & Catatan", key: "topik", width: 35 },
      { header: "Action Items", key: "actionItems", width: 45 },
      { header: "Tanggapan Coach", key: "response", width: 45 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0A3161" },
      };
      cell.font = {
        color: { argb: "FFFFFFFF" },
        bold: true,
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    filteredLogs.forEach((log: any) => {
      const row = worksheet.addRow({
        tanggal: new Date(log.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        coach: `${log.coach?.name || "-"}\nNPP: ${log.coach?.npp || "-"}`,
        coachee: `${log.coachee?.name || "-"}\n(${log.coachee?.department || "-"})\n${log.coachee?.assessments?.[0]?.primaryStyle ? `Gaya: ${log.coachee?.assessments[0].primaryStyle}` : ''}`.trim(),
        topik: `${log.title || "-"}\n\n${log.notes || "-"}`,
        actionItems: log.actionItems && log.actionItems.length > 0 ? log.actionItems.map((a: any) => `• ${a.text}`).join("\n") : "-",
        response: log.response ? log.response.split('@@@')[0] : "-",
      });

      row.eachCell((cell) => {
        cell.alignment = { vertical: "top", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: "FFEEEEEE" } },
          left: { style: "thin", color: { argb: "FFEEEEEE" } },
          bottom: { style: "thin", color: { argb: "FFEEEEEE" } },
          right: { style: "thin", color: { argb: "FFEEEEEE" } },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "Rekapitulasi_Coaching.xlsx");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for wide tables
    
    doc.setFontSize(16);
    doc.text("Rekapitulasi Sesi Coaching", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    const tableColumn = ["Tanggal", "Asdep Bidang", "Anggota Tim", "Topik", "Action Items", "Tanggapan Coach"];
    const tableRows = filteredLogs.map((log: any) => [
      new Date(log.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      log.coach?.name || '-',
      `${log.coachee?.name || '-'}\n(${log.coachee?.department || '-'})\n${log.coachee?.assessments?.[0]?.primaryStyle ? `Gaya: ${log.coachee?.assessments[0].primaryStyle}` : ''}`.trim(),
      log.title || '-',
      log.actionItems ? log.actionItems.map((a: any) => `• ${a.text}`).join('\n') : '-',
      log.response ? log.response.split('@@@')[0] : '-',
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [10, 49, 97], textColor: [255, 255, 255], halign: 'center' },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 35 },
        2: { cellWidth: 40 },
        3: { cellWidth: 45 },
        4: { cellWidth: 65 },
        5: { cellWidth: 65 },
        6: { cellWidth: 60 }
      }
    });

    doc.save("Rekapitulasi_Coaching.pdf");
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between px-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari berdasarkan nama, bidang, atau topik..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-[#57BC90]"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
            Menampilkan {filteredLogs.length} sesi
          </div>
          {filteredLogs.length > 0 && (
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
              <Button onClick={handleDownloadExcel} variant="outline" size="sm" className="h-9 gap-1.5 text-[#0f766e] hover:text-[#0f766e] hover:bg-teal-50 dark:hover:bg-teal-950/30 border-teal-200 dark:border-teal-900">
                <Sheet className="w-4 h-4" />
                <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="h-9 gap-1.5 text-[#be123c] hover:text-[#be123c] hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-0 overflow-x-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <MessageCircle className="w-8 h-8" />
            </div>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              {searchQuery ? "Tidak ditemukan sesi yang cocok" : "Belum Ada Sesi"}
            </p>
            <p className="text-slate-500 mt-2 max-w-md">
              {searchQuery ? "Coba gunakan kata kunci pencarian yang lain." : "Belum ada anggota yang mencatat aktivitas coaching."}
            </p>
          </div>
        ) : (
          <div className="w-full relative border-t border-slate-100 dark:border-slate-800">
            <Table className="w-full">
              <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-50/50 dark:from-slate-800/80 dark:to-slate-900/50 shadow-sm border-b-2 border-[#57BC90]/20">
                <TableRow className="hover:bg-transparent border-0">
                  <TableHead className="font-extrabold whitespace-nowrap px-6 py-5 text-[#015249] dark:text-blue-300 uppercase tracking-wider text-xs">Tanggal</TableHead>
                  <TableHead className="font-extrabold whitespace-nowrap px-6 text-[#015249] dark:text-blue-300 uppercase tracking-wider text-xs">Asdep Bidang</TableHead>
                  <TableHead className="font-extrabold whitespace-nowrap px-6 text-[#015249] dark:text-blue-300 uppercase tracking-wider text-xs">Anggota Tim</TableHead>
                  <TableHead className="font-extrabold px-6 min-w-[200px] text-[#015249] dark:text-blue-300 uppercase tracking-wider text-xs">Topik & Catatan</TableHead>
                  <TableHead className="font-extrabold px-6 min-w-[200px] text-[#015249] dark:text-blue-300 uppercase tracking-wider text-xs">Action Items</TableHead>
                  <TableHead className="font-extrabold px-6 min-w-[200px] text-[#015249] dark:text-blue-300 uppercase tracking-wider text-xs">Tanggapan Coach</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: any, idx: number) => (
                  <TableRow 
                    key={log.id} 
                    className={`group hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 hover:shadow-md ${idx % 2 === 0 ? 'bg-slate-50/30 dark:bg-slate-900/20' : 'bg-transparent'} border-b border-slate-100 dark:border-slate-800/60`}
                  >
                    <TableCell className="px-6 py-5 align-top relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-transparent group-hover:bg-[#57BC90] transition-colors duration-300 rounded-r-full"></div>
                      <div className="flex items-center gap-2 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-black/40 py-1.5 px-3 rounded-lg w-fit shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-700/50 group-hover:-translate-y-0.5 transition-transform">
                        <Calendar className="w-4 h-4 text-[#57BC90]" />
                        {new Date(log.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-foreground text-sm">{log.coach?.name || '-'}</p>
                        <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 w-fit">
                          NPP: {log.coach?.npp || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-1.5">
                        <p className="font-bold text-foreground text-sm">{log.coachee?.name || '-'}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 w-fit">
                            {log.coachee?.department || '-'}
                          </span>
                          {log.coachee?.assessments && log.coachee.assessments.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800 w-fit">
                              Gaya: {log.coachee.assessments[0].primaryStyle}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 align-top max-w-[300px]">
                      <p className="font-black text-[#015249] dark:text-blue-400 mb-2 text-sm">{log.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{log.notes}</p>
                    </TableCell>
                    <TableCell className="px-6 py-5 align-top max-w-[250px]">
                      {log.actionItems && log.actionItems.length > 0 ? (
                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30 shadow-inner group-hover:shadow-emerald-500/10 transition-shadow">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl -translate-y-8 translate-x-8"></div>
                          <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300 relative z-10 leading-relaxed space-y-1">
                            {log.actionItems.map((item: any, i: number) => (
                              <p key={i} className="whitespace-pre-wrap break-words">• {item.text}</p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-5 align-top max-w-[250px]">
                      {log.response ? (
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{log.response.split('@@@')[0]}</p>
                      ) : (
                        <span className="text-xs italic text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">-</span>
                      )}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
