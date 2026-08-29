"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFeatureFlag, saveDepartmentFeatureFlag } from "@/app/actions/features";
import { BookOpen, RefreshCw, Loader2, Database, CheckCircle2, Clock, Plus, Trash2, HelpCircle, Layers, CheckSquare, PlusCircle, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type FeatureFlag = {
  id: string;
  featureKey: string;
  roleGroup: string;
  department: string | null;
  enabled: boolean;
  label: string;
  description: string;
};

const ROLE_GROUPS = ["Staf", "Asisten Deputi", "Deputi Direksi Wilayah"];
const DEPARTMENTS = [
  "Bagian Mutu Layanan Kepesertaan (KC)",
  "Bagian Mutu Layanan Fasilitas Kesehatan (KC)",
  "Bagian SDM, Umum dan Komunikasi (KC)",
  "Bagian Penjaminan Manfaat dan Utilisasi (KC)",
  "Bagian Kepesertaan (KC)",
  "Bagian Perencanaan, Keuangan dan Pemeriksaan (KC)",
  "Kedeputian Wilayah VIII",
  "Bidang SDM, Umum dan Komunikasi (SDMUK)",
  "Bidang Jaminan Pelayanan Kesehatan (JPK)",
  "Bidang Kepesertaan dan Mutu Layanan (KML)",
  "Bidang Perencanaan dan Keuangan (PK)",
  "Kepesertaan dan Penagihan Iuran (Kabupaten)",
  "Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan (Kabupaten)",
  "Kantor Kabupaten",
  "TI Wilayah"
];

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  panduan_komunikasi: <BookOpen className="w-4 h-4" />,
  ulangi_asesmen: <RefreshCw className="w-4 h-4" />,
  manajemen_bank_soal: <Database className="w-4 h-4" />,
  jangka_asesmen_ulang: <Clock className="w-4 h-4" />,
  rekapitulasi_coaching: <Table className="w-4 h-4" />,
};

const ROLE_COLORS: Record<string, string> = {
  Staf: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  "Asisten Deputi": "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "Deputi Direksi Wilayah": "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
};

function ToggleSwitch({
  flag,
  onToggle,
}: {
  flag: FeatureFlag;
  onToggle: (id: string, enabled: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticEnabled, setOptimisticEnabled] = useState(flag.enabled);

  const handleToggle = () => {
    const newVal = !optimisticEnabled;
    setOptimisticEnabled(newVal);
    startTransition(async () => {
      await onToggle(flag.id, newVal);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#57BC90] disabled:opacity-60 ${
        optimisticEnabled ? "bg-[#57BC90]" : "bg-slate-300 dark:bg-slate-600"
      }`}
      aria-label={`Toggle ${flag.label}`}
    >
      {isPending ? (
        <Loader2 className="absolute left-1/2 -translate-x-1/2 w-4 h-4 text-white animate-spin" />
      ) : (
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
            optimisticEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      )}
    </button>
  );
}

export function FeatureManager({ flags }: { flags: FeatureFlag[] }) {
  const router = useRouter();
  const [openAddDept, setOpenAddDept] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("panduan_komunikasi");
  const [selectedRole, setSelectedRole] = useState("Staf");
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  const [enabledStatus, setEnabledStatus] = useState(true);
  const [loading, setLoading] = useState(false);

  // Group global flags (where department is null)
  const globalFlags = flags.filter(f => f.department === null);
  // Group specific overrides (where department is NOT null)
  const departmentFlags = flags.filter(f => f.department !== null);

  const featureKeys = Array.from(new Set(globalFlags.map((f) => f.featureKey)));
  const uniqueFeatures = Array.from(new Set(flags.map((f) => ({ key: f.featureKey, label: f.label, desc: f.description }))));

  const handleToggle = async (id: string, enabled: boolean) => {
    await toggleFeatureFlag(id, enabled);
  };

  const handleAddOverride = async () => {
    setLoading(true);
    const targetFeature = uniqueFeatures.find(f => f.key === selectedFeature);
    await saveDepartmentFeatureFlag(
      selectedFeature,
      selectedRole,
      selectedDept,
      enabledStatus,
      targetFeature?.label || selectedFeature,
      targetFeature?.desc || ""
    );
    setLoading(false);
    setOpenAddDept(false);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Global Configuration Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#015249] dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#57BC90]" />
            Akses Global Per Jabatan
          </h2>
          
          <Dialog open={openAddDept} onOpenChange={setOpenAddDept}>
            <DialogTrigger render={
              <Button className="bg-[#015249] hover:bg-[#57BC90] text-white font-bold text-xs h-9 gap-2 rounded-xl">
                <PlusCircle className="w-4 h-4" />
                Spesifik Bidang Baru
              </Button>
            } />
            <DialogContent className="sm:max-w-[480px] bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-base font-black text-[#015249] dark:text-blue-400">Atur Spesifik Menu Per Bidang</DialogTitle>
                <DialogDescription className="text-xs">
                  Gunakan form ini untuk membuat pengecualian akses menu yang lebih spesifik bagi Jabatan & Bidang tertentu.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Pilih Fitur / Menu</label>
                  <select 
                    value={selectedFeature} 
                    onChange={e => setSelectedFeature(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-xs focus:ring-1 focus:ring-[#57BC90] text-slate-800 dark:text-slate-100"
                  >
                    {Array.from(new Set(flags.map(f => f.featureKey))).map(key => {
                      const label = flags.find(f => f.featureKey === key)?.label || key;
                      return <option key={key} value={key} className="text-black">{label}</option>;
                    })}
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Pilih Jabatan</label>
                  <select 
                    value={selectedRole} 
                    onChange={e => setSelectedRole(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-xs focus:ring-1 focus:ring-[#57BC90] text-slate-800 dark:text-slate-100"
                  >
                    {ROLE_GROUPS.map(rg => (
                      <option key={rg} value={rg} className="text-black">{rg}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Pilih Bidang</label>
                  <select 
                    value={selectedDept} 
                    onChange={e => setSelectedDept(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-xs focus:ring-1 focus:ring-[#57BC90] text-slate-800 dark:text-slate-100"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d} className="text-black">{d}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Status Akses</label>
                  <select 
                    value={enabledStatus ? "true" : "false"} 
                    onChange={e => setEnabledStatus(e.target.value === "true")}
                    className="flex h-9 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-xs focus:ring-1 focus:ring-[#57BC90] text-slate-800 dark:text-slate-100"
                  >
                    <option value="true" className="text-black">Aktif (Diberikan Akses)</option>
                    <option value="false" className="text-black">Nonaktif (Akses Dicabut)</option>
                  </select>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={() => setOpenAddDept(false)} className="rounded-xl">Batal</Button>
                <Button onClick={handleAddOverride} disabled={loading} size="sm" className="bg-[#015249] hover:bg-[#57BC90] text-white rounded-xl">
                  {loading ? "Menyimpan..." : "Simpan Pengecualian"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {featureKeys.map((featureKey) => {
            const flagsForFeature = globalFlags.filter((f) => f.featureKey === featureKey);
            const sampleFlag = flagsForFeature[0];

            return (
              <div key={featureKey} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
                <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#57BC90]/10 text-[#57BC90]">
                    {FEATURE_ICONS[featureKey] ?? <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{sampleFlag?.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sampleFlag?.description}</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ROLE_GROUPS.map((roleGroup) => {
                    const flag = flagsForFeature.find((f) => f.roleGroup === roleGroup);
                    if (!flag) return null;

                    return (
                      <div key={roleGroup} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${ROLE_COLORS[roleGroup]}`}>
                          {roleGroup}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] font-bold ${flag.enabled ? "text-[#57BC90]" : "text-muted-foreground"}`}>
                            {flag.enabled ? "Aktif" : "Nonaktif"}
                          </span>
                          <ToggleSwitch flag={flag} onToggle={handleToggle} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Specific Department Overrides Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#015249] dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#57BC90]" />
          Pengecualian Khusus Per Bidang & Jabatan
        </h2>

        {departmentFlags.length === 0 ? (
          <div className="bg-slate-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Pengecualian Spesifik</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">Semua hak akses menu saat ini mengikuti aturan global per kelompok jabatan di atas. Klik "Spesifik Bidang Baru" untuk membuat aturan khusus.</p>
          </div>
        ) : (
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Menu / Fitur</th>
                    <th className="px-5 py-3">Jabatan</th>
                    <th className="px-5 py-3">Bidang</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {departmentFlags.map((df) => (
                    <tr key={df.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors font-medium">
                      <td className="px-5 py-3 font-semibold text-[#015249] dark:text-blue-400">{df.label}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${ROLE_COLORS[df.roleGroup]}`}>
                          {df.roleGroup}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{df.department}</td>
                      <td className="px-5 py-3 text-center">
                        <ToggleSwitch flag={df} onToggle={handleToggle} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleToggle(df.id, !df.enabled)} 
                          className="h-7 w-7 text-slate-400 hover:text-red-600"
                          title="Hapus Override"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
