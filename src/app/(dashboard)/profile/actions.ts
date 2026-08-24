"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitCoachingResponse(logId: string, responseText: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Ensure the user has the right position
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.position !== 'Deputi Direksi Wilayah' && user?.role !== 'ADMIN') {
    throw new Error("Forbidden: Only Deputi Direksi Wilayah can evaluate coaching logs");
  }

  await prisma.coachingLog.update({
    where: { id: logId },
    data: { response: responseText },
  });

  revalidatePath('/profile');
  return { success: true };
}
