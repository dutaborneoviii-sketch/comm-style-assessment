import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FeatureManager } from "@/components/admin/feature-manager";
import { getFeatureFlags, getFeatureFlagsMap } from "@/app/actions/features";
import { ArrowLeft, ToggleLeft, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FeaturesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  
  let hasAccess = false;
  if (user?.role === "ADMIN") hasAccess = true;
  else if (user?.position === "Asisten Deputi") {
    const featuresMap = await getFeatureFlagsMap("Asisten Deputi", user.department);
    if (featuresMap.manajemen_menu_aplikasi) hasAccess = true;
  }

  if (!user || !hasAccess) redirect("/");

  const flags = await getFeatureFlags();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#015249] dark:text-white tracking-tight flex items-center gap-3">
          <ToggleLeft className="w-8 h-8 text-[#57BC90]" />
          Manajemen Menu Aplikasi
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Aktifkan atau nonaktifkan akses menu tertentu untuk setiap kelompok jabatan secara dinamis.
        </p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Cara Penggunaan</p>
          <p className="text-blue-300/80">
            Klik tombol toggle di sebelah kanan untuk mengaktifkan (hijau) atau menonaktifkan (abu-abu) setiap fitur per kelompok jabatan. Perubahan berlaku secara langsung dan real-time.
          </p>
        </div>
      </div>

      {/* Feature Manager */}
      <FeatureManager flags={flags} />
    </div>
  );
}
