import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CommunicationGuide } from "@/components/communication-guide";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";



export default async function GuidePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, positionDetail: true, department: true }
  });

  const isAdmin = user?.role === "ADMIN";
  const isSDMAsistenDeputi = (user?.positionDetail?.startsWith('Asisten Deputi') && user?.department?.includes('SDMUK')) || user?.positionDetail?.includes('Asisten Deputi SDM, Umum dan Komunikasi');
  const showManagementButton = isAdmin || isSDMAsistenDeputi;

  return (
    <div className="space-y-6 w-full max-w-[1920px] mx-auto pt-8 pb-8 md:pt-8 md:pb-12 px-4 sm:px-6 lg:px-8 xl:px-12 relative">
      <CommunicationGuide />
    </div>
  );
}
