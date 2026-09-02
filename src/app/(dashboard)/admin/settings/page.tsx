import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCooldownSetting, updateCooldownSetting } from "@/app/actions/settings";
import { ArrowLeft, Clock, Save, Info } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/");

  const isAdmin = user.role === "ADMIN";

  // Check if they are allowed to see settings
  if (!isAdmin) {
    let userRoleGroup = user?.pangkat || user?.positionDetail || "Staf";

    const { isFeatureEnabled } = await import("@/app/actions/features");
    const isEnabled = await isFeatureEnabled("jangka_asesmen_ulang", userRoleGroup, user?.department, user?.employeeLocation);
    if (!isEnabled) {
      redirect("/profile");
    }
  }

  const currentCooldown = await getCooldownSetting();

  async function handleSaveSettings(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const u = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!u) throw new Error("User not found");
    const isAdmin = u.role === "ADMIN";
    const isAsistenDeputi = u?.pangkat === 'Manager' || u?.pangkat === 'Asisten Deputi' || u?.positionDetail?.startsWith('Asisten Deputi') || u?.positionDetail === 'Kepala Kabupaten';
    const isSDMAsistenDeputi = (isAsistenDeputi && u?.department?.includes('SDMUK')) || u?.positionDetail?.includes('Asisten Deputi SDM, Umum dan Komunikasi');
    if (!isAdmin && !isSDMAsistenDeputi) throw new Error("Forbidden");

    const cooldown = formData.get("cooldown") as string;
    await updateCooldownSetting(cooldown);
    redirect("/profile");
  }

  const options = [
    { value: "0", label: "Bebas (Tanpa Batas Waktu / Cooldown)" },
    { value: "1", label: "Setiap 1 Bulan" },
    { value: "2", label: "Setiap 2 Bulan" },
    { value: "3", label: "Setiap 3 Bulan (Rekomendasi)" },
    { value: "6", label: "Setiap 6 Bulan" },
    { value: "12", label: "Setiap 1 Tahun (12 Bulan)" },
  ];

  return (
    <div className="relative w-full space-y-6">
      <div className="max-w-2xl mx-auto space-y-6 w-full">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-[#57BC90]" />
            <h1 className="text-3xl font-extrabold text-[#015249] dark:text-white tracking-tight">Jangka Asesmen Ulang</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Atur batas waktu minimal yang harus dilewati pengguna sebelum diperbolehkan melakukan pengisian ulang kuesioner asesmen gaya komunikasi.
          </p>
        </div>

        {/* Info Banner */}
        <div className="w-full flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold mb-1">Mekanisme Pembatasan</p>
            <p className="text-blue-300/80">
              Ketika cooldown aktif (misal 3 Bulan), pengguna yang baru saja menyelesaikan asesmen tidak akan bisa mengklik tombol "Ulangi Asesmen" sampai 3 bulan terhitung sejak tanggal asesmen terakhir mereka.
            </p>
          </div>
        </div>

        {/* Form */}
        <form action={handleSaveSettings} className="w-full bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-2">
          <label htmlFor="cooldown" className="block text-sm font-bold text-foreground">
            Batas Waktu Pengisian Ulang
          </label>
          <select
            id="cooldown"
            name="cooldown"
            defaultValue={currentCooldown.toString()}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 text-foreground focus:outline-none focus:ring-2 focus:ring-[#57BC90]"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            className="inline-flex items-center justify-center h-11 px-6 bg-[#015249] hover:bg-[#013b34] text-white font-bold rounded-xl shadow-md transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Simpan Pengaturan
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
