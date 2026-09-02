import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function logAuditAction(userId: string, action: string, details: string) {
  try {
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown IP';
    const userAgent = headersList.get('user-agent') || 'Unknown Device';
    const city = headersList.get('x-vercel-ip-city') || 'Unknown City';
    const country = headersList.get('x-vercel-ip-country') || 'Unknown Country';
    const location = `${city}, ${country}`;

    await prisma.loginActivity.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        location,
        action,
        details
      }
    });
  } catch (error) {
    console.error("Failed to log audit action:", error);
  }
}
