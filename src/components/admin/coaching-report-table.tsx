'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, UserCircle2, FileSpreadsheet, FileText, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';

function MetricCell({ count, names, activeClass, inactiveClass, isLast = false }: { count: number, names?: string[], activeClass: string, inactiveClass: string, isLast?: boolean }) {
  if (count === 0) {
    return (
      <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${inactiveClass}`}>
        -
      </div>
    );
  }
  
  return (
    <div className="relative group/tooltip flex justify-center">
      <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors cursor-help ${activeClass}`}>
        {count}
      </div>
      
      {names && names.length > 0 && (
        <div className={`absolute bottom-full mb-2 hidden group-hover/tooltip:block bg-slate-800 dark:bg-zinc-800 text-white text-[11px] rounded-lg px-3 py-2 z-50 shadow-xl border border-slate-700/50 w-max max-w-[200px] text-left ${isLast ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
          <div className="font-bold text-slate-300 mb-1 pb-1 border-b border-slate-700/50">Daftar Anggota:</div>
          <div className="flex flex-col gap-0.5">
            {names.map((name, i) => (
              <div key={i} className="truncate">{name}</div>
            ))}
          </div>
          <div className={`absolute top-full border-4 border-transparent border-t-slate-800 dark:border-t-zinc-800 ${isLast ? 'right-3' : 'left-1/2 -translate-x-1/2'}`}></div>
        </div>
      )}
    </div>
  );
}

export type CoachingReportType = {
  id: string;
  name: string | null;
  department: string | null;
  position: string | null;
  totalSesi: number;
  selesai: number;
  proses: number;
  belumMulai: number;
  totalSesiNames: string[];
  selesaiNames: string[];
  prosesNames: string[];
  belumMulaiNames: string[];
  members: { name: string; status: string }[];
};

export function CoachingReportTable({ reports }: { reports: CoachingReportType[] }) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getInitials = (name: string) => {
    if (!name) return "NA";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const exportToExcel = () => {
    const wsData: any[][] = [];
    
    // Excel Top Table
    wsData.push(["Rincian Kedeputian Wilayah VIII"]);
    wsData.push(["No", "Nama Pimpinan", "Jabatan", "Bidang", "Sesi Selesai", "Sedang Proses", "Belum Mulai"]);
    
    reports.forEach((r, idx) => {
      wsData.push([
        idx + 1,
        r.name || "-",
        r.position || "-",
        r.department || "-",
        r.selesai,
        r.proses,
        r.belumMulai
      ]);
    });
    
    wsData.push(["", "", "", "", "", "", ""]);
    wsData.push(["", "", "", "", "", "", ""]);

    // Excel Bottom Tables
    reports.forEach((r, idx) => {
      if (r.members && r.members.length > 0) {
        // Title above table
        wsData.push([`Rincian Anggota: ${r.department || "-"}`]);
        
        // Header per Bidang
        wsData.push(["No", "Nama Pimpinan", "Jabatan", "Sesi Selesai", "Sedang Proses", "Belum Mulai"]);
        
        // Leader as first row
        wsData.push([
          1,
          r.name || "-",
          r.position || "-",
          r.selesai,
          r.proses,
          r.belumMulai
        ]);
        
        // Members
        r.members.forEach((m, mIdx) => {
          wsData.push([mIdx + 2, m.name, (m as any).position || "-", m.status, "", ""]);
        });
        
        // Gap between tables
        wsData.push(["", "", "", "", "", ""]);
        wsData.push(["", "", "", "", "", ""]);
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekapitulasi");
    XLSX.writeFile(wb, `Laporan_Coaching_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(16);
    doc.text("Rekapitulasi Coaching", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    let currentY = 28;
    
    // Top Table Data
    const topTableData = reports.map((r, idx) => [
      idx + 1,
      r.name || "-",
      r.position || "-",
      r.department || "-",
      r.selesai,
      r.proses,
      r.belumMulai
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["No", "Nama Pimpinan", "Jabatan", "Bidang", "Sesi Selesai", "Sedang Proses", "Belum Mulai"]],
      body: topTableData,
      theme: 'grid',
      headStyles: { fillColor: [1, 82, 73] },
      styles: { fontSize: 8 },
      margin: { bottom: 15 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Bottom Tables
    reports.forEach((r, idx) => {
      if (r.members && r.members.length > 0) {
        if (currentY > 170) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Rincian Anggota: ${r.department || "-"}`, 14, currentY);
        currentY += 4;

        const tableData: any[] = [];
        
        // Leader as first row
        tableData.push([
          1,
          r.name || "-",
          r.position || "-",
          r.selesai,
          r.proses,
          r.belumMulai
        ]);
        
        r.members.forEach((m, mIdx) => {
          tableData.push([
            { content: String(mIdx + 2), colSpan: 1 }, 
            { content: m.name, colSpan: 1 }, 
            { content: (m as any).position || "-", colSpan: 1 },
            { content: m.status, colSpan: 3 }
          ]);
        });

        autoTable(doc, {
          startY: currentY,
          head: [["No", "Nama Pimpinan", "Jabatan", "Sesi Selesai", "Sedang Proses", "Belum Mulai"]],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [1, 82, 73] },
          styles: { fontSize: 8 },
          margin: { bottom: 15 }
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }
    });

    doc.save(`Laporan_Coaching_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Action Bar */}
      <div className="flex justify-end items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-[#f9fdfc] dark:bg-zinc-950/50">
        <div className="flex gap-2">
          <Button 
            onClick={exportToExcel}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 text-emerald-600 dark:border-emerald-900 dark:hover:bg-emerald-900/30 dark:text-emerald-500"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Download Excel</span>
          </Button>
          <Button 
            onClick={exportToPDF}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-rose-600 dark:border-rose-900 dark:hover:bg-rose-900/30 dark:text-rose-500"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto md:overflow-visible pb-20">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#f2fafa] dark:bg-[#015249]/20 text-[#015249] dark:text-[#57BC90] font-bold border-b border-slate-200 dark:border-slate-800/50">
          <tr>
            <th className="px-4 py-4 rounded-tl-xl w-10"></th>
            <th className="px-2 py-4 w-12">No</th>
            <th className="px-6 py-4">Nama Pimpinan</th>
            <th className="px-6 py-4">Jabatan</th>
            <th className="px-6 py-4">Bidang</th>
            <th className="px-4 py-4 text-center">Jumlah Sesi</th>
            <th className="px-4 py-4 text-center text-emerald-600 dark:text-emerald-400">Selesai Coaching</th>
            <th className="px-4 py-4 text-center text-blue-600 dark:text-blue-400">Proses Coaching</th>
            <th className="px-4 py-4 text-center text-amber-600 dark:text-amber-400 rounded-tr-xl">Belum Mulai</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {reports.map((report, index) => {
            const isExpanded = !!expandedRows[report.id];
            
            return (
              <React.Fragment key={report.id}>
                <tr 
                  className={`hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer ${isExpanded ? 'bg-slate-50/50 dark:bg-zinc-900/30' : ''}`}
                  onClick={() => toggleRow(report.id)}
                >
                  <td className="px-4 py-4 text-slate-400">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-[#015249] dark:text-[#57BC90]" /> : <ChevronRight className="w-5 h-5" />}
                  </td>
                  <td className="px-2 py-4 text-slate-400 dark:text-slate-500 font-medium">
                    {String.fromCharCode(65 + index)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#015249]/10 to-[#57BC90]/20 flex items-center justify-center text-[#015249] dark:text-[#57BC90] font-bold text-xs ring-2 ring-white dark:ring-zinc-950 group-hover:scale-110 transition-transform">
                        {getInitials(report.name || "")}
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wide">
                        {report.name || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                      {report.position || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                      {report.department || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <MetricCell 
                      count={report.totalSesi} 
                      names={report.totalSesiNames} 
                      activeClass="bg-[#164732] text-white shadow-sm" 
                      inactiveClass="bg-slate-100 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500" 
                    />
                  </td>
                  <td className="px-4 py-4">
                    <MetricCell 
                      count={report.selesai} 
                      names={report.selesaiNames} 
                      activeClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                      inactiveClass="text-slate-300 dark:text-slate-600" 
                    />
                  </td>
                  <td className="px-4 py-4">
                    <MetricCell 
                      count={report.proses} 
                      names={report.prosesNames} 
                      activeClass="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" 
                      inactiveClass="text-slate-300 dark:text-slate-600" 
                    />
                  </td>
                  <td className="px-4 py-4">
                    <MetricCell 
                      count={report.belumMulai} 
                      names={report.belumMulaiNames} 
                      activeClass="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" 
                      inactiveClass="text-slate-300 dark:text-slate-600"
                      isLast={true}
                    />
                  </td>
                </tr>
                
                {/* Expanded Details Row */}
                {isExpanded && (
                  <tr>
                    <td colSpan={9} className="p-0 border-b-0">
                      <div className="bg-[#f2fafa]/50 dark:bg-[#015249]/5 border-t border-slate-100 dark:border-slate-800/50 px-10 py-6 overflow-hidden animation-collapse">
                        <div className="flex flex-col gap-4">
                          <h4 className="font-extrabold text-[#015249] dark:text-[#57BC90] flex items-center gap-2">
                            Rincian Anggota: {report.department || "N/A"}
                          </h4>
                          
                          {report.members.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {report.members.map((member, mIdx) => {
                                const hasSession = member.status !== 'Belum Mengikuti Sesi Coaching';
                                
                                return (
                                  <div key={mIdx} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${hasSession ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                                      <UserCircle2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        {mIdx + 1}. {member.name}
                                      </span>
                                      <span className={`text-xs font-medium mt-0.5 ${hasSession ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}`}>
                                        {member.status}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                              Tidak ada data anggota di bidang ini.
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {reports.length === 0 && (
            <tr>
              <td colSpan={9} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Search className="w-8 h-8 text-slate-300" />
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Tidak ada data pimpinan.</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
}
