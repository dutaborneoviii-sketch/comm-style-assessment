"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getUserAccess } from "@/lib/access";

export async function getUsers() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!getUserAccess(currentUser as any).isAdmin) throw new Error("Forbidden");

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      npp: true,
      name: true,
      email: true,
      workUnit: true,
      employeeLocation: true,
      department: true,
      pangkat: true,
      positionDetail: true,
      role: true,
      status: true,
      createdAt: true,
      loginLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true }
      }
    }
  });
}

export async function approveUser(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!getUserAccess(currentUser as any).isAdmin) throw new Error("Forbidden");

  try {
    await prisma.user.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
    
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error approving user:", error);
    return { error: "Gagal menyetujui pengguna." };
  }
}

export async function toggleUserStatus(id: string, currentStatus: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!getUserAccess(currentUser as any).isAdmin) throw new Error("Forbidden");

  // Prevent admin from deactivating themselves
  if (id === session.user.id) {
    return { error: "Anda tidak dapat menonaktifkan akun Anda sendiri." };
  }

  const newStatus = currentStatus === 'APPROVED' ? 'INACTIVE' : 'APPROVED';

  try {
    await prisma.user.update({
      where: { id },
      data: { status: newStatus }
    });
    
    revalidatePath("/admin/users");
    return { success: true, newStatus };
  } catch (error: any) {
    console.error("Error toggling user status:", error);
    return { error: "Gagal mengubah status pengguna." };
  }
}

export async function createUser(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!getUserAccess(currentUser as any).isAdmin) throw new Error("Forbidden");

  // Basic validation
  if (!data.npp) throw new Error("NPP is required");
  
  // Check if NPP already exists
  const existingUser = await prisma.user.findUnique({ where: { npp: data.npp } });
  if (existingUser) {
    return { error: "NPP sudah digunakan oleh pengguna lain." };
  }

  // Set default password if none provided
  const passwordToHash = data.password || "password123";
  const hashedPassword = await bcrypt.hash(passwordToHash, 10);

  try {
    if (data.department) {
      await prisma.department.upsert({
        where: { name: data.department },
        update: {},
        create: { name: data.department }
      });
    }

    const newUser = await prisma.user.create({
      data: {
        npp: data.npp,
        name: data.name || `User ${data.npp}`,
        email: data.email || null,
        password: hashedPassword,
        workUnit: data.workUnit || null,
        employeeLocation: data.employeeLocation || null,
        department: data.department || null,
        pangkat: data.pangkat || null,
        positionDetail: data.positionDetail || null,
        role: data.role || "USER",
      }
    });
    
    revalidatePath("/admin/users");
    return { success: true, user: newUser };
  } catch (error: any) {
    console.error("Error creating user:", error);
    return { error: `Gagal membuat pengguna: ${error.message || error}` };
  }
}

export async function updateUser(id: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!getUserAccess(currentUser as any).isAdmin) throw new Error("Forbidden");

  try {
    if (data.department) {
      await prisma.department.upsert({
        where: { name: data.department },
        update: {},
        create: { name: data.department }
      });
    }

    const updateData: any = {
      npp: data.npp,
      name: data.name,
      email: data.email || null,
      workUnit: data.workUnit,
      employeeLocation: data.employeeLocation,
      department: data.department,
      pangkat: data.pangkat,
      positionDetail: data.positionDetail,
      role: data.role,
    };

    if (data.password && data.password.trim() !== "") {
      updateData.password = await bcrypt.hash(data.password, 10);
      updateData.passwordUpdatedAt = new Date();
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });
    
    await logAuditAction(session.user.id, "UPDATE_USER", `Mengubah data user: ${data.name || data.npp}`);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user:", error);
    return { error: "Gagal memperbarui pengguna." };
  }
}

import { logAuditAction } from "@/lib/audit";

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi tidak valid. Silakan login ulang." };
  
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!getUserAccess(currentUser as any).isAdmin) return { error: "Akses ditolak. Hanya admin yang dapat menghapus pengguna." };

  if (id === session.user.id) {
    return { error: "Anda tidak dapat menghapus akun Anda sendiri." };
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    await prisma.user.delete({
      where: { id }
    });
    
    if (targetUser) {
      await logAuditAction(session.user.id, "DELETE_USER", `Menghapus user: ${targetUser.name} (${targetUser.npp})`);
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { error: "Gagal menghapus pengguna." };
  }
}

function generateRandomPassword(): string {
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let password = "";
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  password += numberChars[Math.floor(Math.random() * numberChars.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  for (let i = 4; i < 10; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

import { sendResetPasswordEmail } from '@/lib/mailer';

export async function changeSelfPassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi tidak valid. Silakan login ulang." };
  
  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return { error: "Semua kolom password harus diisi." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Password baru dan konfirmasi tidak cocok." };
  }

  if (newPassword.length < 8) {
    return { error: "Password baru harus memiliki minimal 8 karakter." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.password) {
    return { error: "Pengguna tidak ditemukan atau tidak memiliki password." };
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword) {
    return { error: "Password lama yang Anda masukkan salah." };
  }

  try {
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword, passwordUpdatedAt: new Date() }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error changing self password:", error);
    return { error: "Gagal mengubah password. Silakan coba lagi." };
  }
}

export async function forgotPassword(formData: FormData) {
  const npp = formData.get("npp") as string;
  if (!npp) return { error: "NPP wajib diisi." };

  const targetUser = await prisma.user.findUnique({ where: { npp } });
  if (!targetUser) {
    // We shouldn't reveal if the NPP exists or not for security, but usually internal apps do.
    return { error: "Pengguna dengan NPP tersebut tidak ditemukan." };
  }

  if (!targetUser.email) {
    return { error: "Pengguna tidak memiliki email terdaftar. Silakan hubungi Administrator." };
  }

  const rawPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  try {
    await prisma.user.update({
      where: { npp },
      data: { password: hashedPassword }
    });

    const emailResult = await sendResetPasswordEmail(targetUser.email, targetUser.name || 'Pengguna', rawPassword);
    
    if (emailResult.success) {
      return { success: true, message: `Password baru telah dikirim ke email: ${targetUser.email}` };
    } else {
      return { error: "Gagal mengirim email. Silakan hubungi Administrator." };
    }
  } catch (error: any) {
    console.error("Error in forgotPassword:", error);
    return { error: "Terjadi kesalahan pada sistem." };
  }
}

export async function resetUserPassword(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi tidak valid. Silakan login ulang." };
  
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!getUserAccess(currentUser as any).isAdmin) return { error: "Akses ditolak. Hanya admin yang dapat mereset password." };

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) return { error: "Pengguna tidak ditemukan." };

  const rawPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  try {
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword, passwordUpdatedAt: new Date() }
    });

    let emailSent = false;
    if (targetUser.email) {
      const emailResult = await sendResetPasswordEmail(targetUser.email, targetUser.name || 'Pengguna', rawPassword);
      emailSent = emailResult.success;
    }

    revalidatePath("/admin/users");
    return { success: true, password: rawPassword, emailSent, hasEmail: !!targetUser.email };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { error: "Gagal meriset password." };
  }
}

export async function resetUserAssessment(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi tidak valid. Silakan login ulang." };
  
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!getUserAccess(currentUser as any).isAdmin) return { error: "Akses ditolak. Hanya admin yang dapat mereset asesmen." };

  try {
    const deleteResult = await prisma.assessment.deleteMany({
      where: { userId: id }
    });

    revalidatePath("/admin/users");
    return { success: true, count: deleteResult.count };
  } catch (error: any) {
    console.error("Error resetting assessment:", error);
    return { error: "Gagal mereset asesmen pengguna." };
  }
}

import * as XLSX from "xlsx";

export async function migrateUsers(base64Data: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi tidak valid. Silakan login ulang." };
  
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!getUserAccess(currentUser as any).isAdmin) return { error: "Akses ditolak. Hanya admin yang dapat mengimpor pengguna." };

  try {
    const buffer = Buffer.from(base64Data, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    if (rows.length === 0) {
      return { error: "File excel kosong atau tidak valid." };
    }

    const results: { name: string; npp: string; email: string; workUnit: string; employeeLocation: string; department: string; pangkat: string; positionDetail?: string; role: string; passwordGenerated: string; status: "SUCCESS" | "FAILED"; message?: string }[] = [];

    const nppsToImport = rows.map((r: any) => String(r.npp || r.NPP || "").trim()).filter(Boolean);
    const existingUsers = await prisma.user.findMany({
      where: { npp: { in: nppsToImport } },
      select: { id: true, name: true, npp: true, email: true, role: true, department: true, pangkat: true, positionDetail: true, workUnit: true, employeeLocation: true }
    });
    const existingNppMap = new Map(existingUsers.map(u => [u.npp, u]));

    for (const row of rows) {
      const npp = String(row.npp || row.NPP || "").trim();
      const name = String(row.name || row.nama || row.Nama || row["Nama User"] || "").trim();
      const email = String(row.email || row.Email || row["Email (Opsional)"] || "").trim();
      const workUnit = String(row.satuankerja || row.Satuankerja || row.workUnit || row["Satuan Kerja"] || "").trim();
      const department = String(row.department || row.bidang || row.Bidang || "").trim();
      const pangkat = String(row.pangkat || row.Pangkat || row.jabatan || row.Jabatan || row.position || "").trim();
      const role = String(row.role || row.peran || row.Peran || row["Hak Akses (Role)"] || "USER").trim().toUpperCase();
      const employeeLocation = String(row.lokasipegawai || row["Lokasi Pegawai"] || row.lokasi_pegawai || row.employeeLocation || "").trim();
      const positionDetail = String(row.positionDetail || row.detailjabatan || row["Detail Jabatan"] || row.detail_jabatan || "").trim();

      if (!npp) {
        results.push({
          name: name || "-",
          npp: "-",
          email: email || "-",
          workUnit: workUnit || "-",
          employeeLocation: employeeLocation || "-",
          department: department || "-",
          pangkat: pangkat || "-",
          positionDetail: positionDetail || "-",
          role: role || "USER",
          passwordGenerated: "-",
          status: "FAILED",
          message: "NPP kosong"
        });
        continue;
      }

      // Check if user already exists
      const existingUser = existingNppMap.get(npp);
      if (existingUser) {
        results.push({
          name: name || existingUser.name || "-",
          npp,
          email: email || existingUser.email || "-",
          workUnit: workUnit || existingUser.workUnit || "-",
          employeeLocation: employeeLocation || existingUser.employeeLocation || "-",
          department: department || existingUser.department || "-",
          pangkat: pangkat || existingUser.pangkat || "-",
          positionDetail: positionDetail || existingUser.positionDetail || "-",
          role: role || existingUser.role || "USER",
          passwordGenerated: "-",
          status: "FAILED",
          message: "NPP sudah terdaftar"
        });
        continue;
      }

      if (department) {
        // Auto-create department if it doesn't exist
        try {
          await prisma.department.upsert({
            where: { name: department },
            update: {},
            create: { name: department },
          });
        } catch (error) {
          // Ignore
        }
      }

      const generatedPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      try {
        await prisma.user.create({
          data: {
            npp,
            name: name || `User ${npp}`,
            email: email || null,
            workUnit: workUnit || null,
            password: hashedPassword,
            department: department || null,
            pangkat: pangkat || null,
            positionDetail: positionDetail || null,
            employeeLocation: employeeLocation || null,
            role: (role === "ADMIN" || role === "USER") ? role : "USER",
            status: "APPROVED"
          }
        });

        results.push({
          name: name || `User ${npp}`,
          npp,
          email: email || "-",
          workUnit: workUnit || "-",
          employeeLocation: employeeLocation || "-",
          department: department || "-",
          pangkat: pangkat || "-",
          positionDetail: positionDetail || "-",
          role: role === "ADMIN" ? "ADMIN" : "USER",
          passwordGenerated: generatedPassword,
          status: "SUCCESS"
        });
      } catch (err: any) {
        results.push({
          name: name || "-",
          npp,
          email: email || "-",
          workUnit: workUnit || "-",
          employeeLocation: employeeLocation || "-",
          department: department || "-",
          pangkat: pangkat || "-",
          positionDetail: positionDetail || "-",
          role: role || "USER",
          passwordGenerated: "-",
          status: "FAILED",
          message: "Error database: " + err.message
        });
      }
    }

    return { success: true, results };
  } catch (err: any) {
    console.error("Migration error:", err);
    return { error: "Terjadi kesalahan memproses file excel: " + err.message };
  }
}
