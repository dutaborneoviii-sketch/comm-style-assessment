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
  pangkat: string | null;
  positionDetail: string | null;
  employeeLocation: string | null;
  totalSesi: number;
  selesai: number;
  proses: number;
  belumMulai: number;
  totalSesiNames: string[];
  selesaiNames: string[];
  prosesNames: string[];
  belumMulaiNames: string[];
  members: { name: string; status: string; pangkat?: string; positionDetail?: string }[];
};

export function CoachingReportTable({ reports }: { reports: CoachingReportType[] }) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const locations = Array.from(new Set(reports.map(r => r.employeeLocation).filter(Boolean))) as string[];
  locations.sort();

  const filteredReports = (!locationFilter || locationFilter === "all") 
    ? reports 
    : reports.filter(r => r.employeeLocation?.toLowerCase().includes(locationFilter.toLowerCase()));

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
    wsData.push(["No", "Nama Pimpinan", "Detail Jabatan", "Lokasi Pegawai", "Sesi Selesai", "Sedang Proses", "Belum Mulai"]);
    
    filteredReports.forEach((r, idx) => {
      wsData.push([
        idx + 1,
        r.name || "-",
        r.positionDetail || "-",
        r.employeeLocation || "-",
        r.selesai,
        r.proses,
        r.belumMulai
      ]);
    });
    
    wsData.push(["", "", "", "", "", "", ""]);
    wsData.push(["", "", "", "", "", "", ""]);

    // Excel Bottom Tables
    filteredReports.forEach((r, idx) => {
      if (r.pangkat !== 'Deputi Direksi Wilayah' && r.members && r.members.length > 0) {
        // Title above table
        wsData.push([`Rincian Anggota: ${r.department || "-"} (${r.employeeLocation || "-"})`]);
        
        // Header per Bidang
        wsData.push(["No", "Nama Pimpinan", "Detail Jabatan", "Sesi Selesai", "Sedang Proses", "Belum Mulai"]);
        
        // Leader as first row
        wsData.push([
          1,
          r.name || "-",
          r.positionDetail || "-",
          r.selesai,
          r.proses,
          r.belumMulai
        ]);
        
        // Members
        r.members.forEach((m, mIdx) => {
          wsData.push([
            mIdx + 2, 
            m.name, 
            m.positionDetail || "-", 
            (m as any).selesai || 0, 
            (m as any).proses || 0, 
            (m as any).belumMulai || 0
          ]);
        });
        
        // Gap between tables
        wsData.push(["", "", "", "", "", "", ""]);
        wsData.push(["", "", "", "", "", "", ""]);
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
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 283, 15, { align: 'right' });

    let currentY = 24;
    
    // Top Table Data
    const topTableData = filteredReports.map((r, idx) => [
      idx + 1,
      r.name || "-",
      r.positionDetail || "-",
      r.employeeLocation || "-",
      r.selesai,
      r.proses,
      r.belumMulai
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["No", "Nama Pimpinan", "Detail Jabatan", "Lokasi Pegawai", "Sesi Selesai", "Sedang Proses", "Belum Mulai"]],
      body: topTableData,
      theme: 'grid',
      headStyles: { fillColor: [1, 82, 73], halign: 'center' },
      styles: { fontSize: 8 },
      margin: { bottom: 15 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Bottom Tables Data
    filteredReports.forEach((r, idx) => {
      if (r.pangkat !== 'Deputi Direksi Wilayah' && r.members && r.members.length > 0) {
        if (currentY > 170) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Rincian Anggota: ${r.department || "-"} (${r.employeeLocation || "-"})`, 14, currentY);
        currentY += 4;

        const tableData: any[] = [];
        
        // Leader as first row
        tableData.push([
          1,
          r.name || "-",
          r.positionDetail || "-",
          r.selesai,
          r.proses,
          r.belumMulai
        ]);
        
        r.members.forEach((m, mIdx) => {
          tableData.push([
            String(mIdx + 2), 
            m.name, 
            m.positionDetail || "-",
            String((m as any).selesai || 0),
            String((m as any).proses || 0),
            String((m as any).belumMulai || 0)
          ]);
        });

        autoTable(doc, {
          startY: currentY,
          head: [["No", "Nama Pimpinan", "Detail Jabatan", "Sesi Selesai", "Sedang Proses", "Belum Mulai"]],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [1, 82, 73], halign: 'center' },
          styles: { fontSize: 8 },
          margin: { bottom: 15 },
          didParseCell: function (data) {
            if (data.section === 'body' && data.row.index === 0) {
              if (data.column.index >= 3 && data.column.index <= 5) {
                data.cell.styles.fillColor = [238, 245, 219];
              }
            }
          }
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }
    });

    doc.save(`Laporan_Coaching_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 border-b border-slate-200 dark:border-slate-800 bg-[#f9fdfc] dark:bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <label htmlFor="locationFilter" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Filter Lokasi Pegawai:
          </label>
          <div className="relative w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Semua Lokasi (Ketik untuk mencari...)"
                value={locationFilter === 'all' ? '' : locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 rounded-md text-sm pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#57BC90]"
              />
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full"
              >
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute top-full mt-1 left-0 w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto py-1">
                  <div 
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"
                    onClick={() => { setLocationFilter('all'); setIsDropdownOpen(false); }}
                  >
                    Semua Lokasi
                  </div>
                  {locations.filter(loc => loc.toLowerCase().includes(locationFilter === 'all' ? '' : locationFilter.toLowerCase())).map(loc => (
                    <div 
                      key={loc}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"
                      onClick={() => { setLocationFilter(loc); setIsDropdownOpen(false); }}
                    >
                      {loc}
                    </div>
                  ))}
                  {locations.filter(loc => loc.toLowerCase().includes(locationFilter === 'all' ? '' : locationFilter.toLowerCase())).length === 0 && (
                    <div className="px-3 py-3 text-sm text-center text-slate-500 italic">
                      Lokasi tidak ditemukan
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
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
      
      <div className="overflow-x-auto pb-20">
        <div className="bg-white dark:bg-zinc-950">
          <table className="w-full text-sm text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#015249] text-white">
                <th className="px-4 py-3 w-10 font-semibold rounded-l-full"></th>
                <th className="px-2 py-3 w-12 font-semibold">No</th>
                <th className="px-4 py-3 font-semibold">Nama Pimpinan</th>
                <th className="px-4 py-3 font-semibold">Detail Jabatan</th>
                <th className="px-4 py-3 font-semibold">Lokasi Pegawai</th>
                <th className="px-4 py-3 text-center font-semibold">Jumlah Sesi</th>
                <th className="px-4 py-3 text-center font-semibold text-emerald-300">Selesai</th>
                <th className="px-4 py-3 text-center font-semibold text-blue-300">Proses</th>
                <th className="px-4 py-3 text-center font-semibold text-amber-300 rounded-r-full">Belum Mulai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredReports.map((report, index) => {
                const isExpanded = !!expandedRows[report.id];
                const isClickable = report.pangkat !== 'Deputi Direksi Wilayah';
                
                return (
                  <React.Fragment key={report.id}>
                    <tr 
                      className={`transition-colors ${isClickable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900/50' : ''} ${isExpanded ? 'bg-slate-50/50 dark:bg-zinc-900/30' : 'bg-white dark:bg-zinc-950'}`}
                      onClick={() => isClickable && toggleRow(report.id)}
                    >
                      <td className="px-4 py-4 text-slate-400">
                        {isClickable && (
                          <div className="w-6 h-6 flex items-center justify-center text-slate-400">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-4 text-slate-500 font-medium">
                        {String.fromCharCode(65 + index)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {report.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-slate-600 dark:text-slate-400 text-xs">
                          {report.positionDetail || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-slate-600 dark:text-slate-400 text-xs">
                          {report.employeeLocation || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <MetricCell 
                          count={report.totalSesi} 
                          names={report.totalSesiNames} 
                          activeClass="bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200" 
                          inactiveClass="bg-slate-50 text-slate-300 dark:bg-zinc-900 dark:text-slate-600" 
                        />
                      </td>
                      <td className="px-4 py-4">
                        <MetricCell 
                          count={report.selesai} 
                          names={report.selesaiNames} 
                          activeClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" 
                          inactiveClass="text-slate-300 dark:text-slate-600" 
                        />
                      </td>
                      <td className="px-4 py-4">
                        <MetricCell 
                          count={report.proses} 
                          names={report.prosesNames} 
                          activeClass="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" 
                          inactiveClass="text-slate-300 dark:text-slate-600" 
                        />
                      </td>
                      <td className="px-4 py-4">
                        <MetricCell 
                          count={report.belumMulai} 
                          names={report.belumMulaiNames} 
                          activeClass="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" 
                          inactiveClass="text-slate-300 dark:text-slate-600" 
                          isLast={true}
                        />
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} className="p-0 border-b-0">
                          <div className="bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-slate-800 px-6 py-5">
                            <h4 className="text-xs font-semibold text-slate-500 mb-4">
                              Rincian Anggota
                            </h4>
                            
                            {report.members.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {report.members.map((member, mIdx) => {
                                  const hasSession = member.status !== 'Belum Mengikuti Sesi Coaching';
                                  
                                  return (
                                    <div key={mIdx} className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${hasSession ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500' : 'bg-slate-200 text-slate-400 dark:bg-zinc-800 dark:text-slate-600'}`}>
                                        <UserCircle2 className="w-4 h-4" />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                          {mIdx + 1}. {member.name}
                                        </span>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[250px]" title={(member as any).employeeLocation || "-"}>
                                          {(member as any).employeeLocation || "-"}
                                        </p>
                                        <span className={`text-[11px] mt-0.5 ${hasSession ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>
                                          {member.status}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-sm text-slate-500 py-2">
                                Tidak ada data anggota.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data pimpinan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
