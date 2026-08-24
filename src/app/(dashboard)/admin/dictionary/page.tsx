import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DictionaryUpload } from "./dictionary-upload";
import { prisma } from "@/lib/prisma";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DictionaryAdminPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, position: true, department: true }
  });

  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin) {
    let userRoleGroup = "Staf";
    if (user?.position === "Asisten Deputi") userRoleGroup = "Asisten Deputi";
    if (user?.position === "Deputi Direksi Wilayah") userRoleGroup = "Deputi Direksi Wilayah";

    const { isFeatureEnabled } = await import("@/app/actions/features");
    const isEnabled = await isFeatureEnabled("manajemen_kamus_panduan", userRoleGroup, user?.department);
    if (!isEnabled) {
      redirect("/profile");
    }
  }

  // Get last updated time
  const lastEntry = await prisma.communicationDictionary.findFirst({
    orderBy: { updatedAt: "desc" }
  });

  const lastUpdated = lastEntry 
    ? new Date(lastEntry.updatedAt).toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#015249] dark:text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-[#57BC90]" />
          Manajemen Kamus Panduan
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg max-w-3xl">
          Kelola konten Kamus Panduan Gaya Komunikasi secara dinamis menggunakan file Excel.
        </p>
      </div>

      <DictionaryUpload lastUpdated={lastUpdated} />
    </div>
  );
}
