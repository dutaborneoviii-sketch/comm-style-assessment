"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Definisi semua fitur yang bisa dikelola
const DEFAULT_FLAGS = [
  {
    featureKey: "panduan_komunikasi",
    label: "Panduan Gaya Komunikasi",
    description: "Menampilkan menu akses ke halaman panduan gaya komunikasi.",
    defaultEnabled: (roleGroup: string) => roleGroup !== "Staf",
  },
  {
    featureKey: "ulangi_asesmen",
    label: "Ulangi / Perbarui Asesmen",
    description: "Menampilkan tombol untuk mengulang kuesioner asesmen gaya komunikasi.",
    defaultEnabled: (roleGroup: string) => roleGroup === "Staf",
  },
  {
    featureKey: "manajemen_bank_soal",
    label: "Manajemen Bank Soal",
    description: "Menampilkan akses ke halaman manajemen bank soal dan pertanyaan asesmen.",
    defaultEnabled: (_roleGroup: string) => false, // Default: nonaktif untuk semua kecuali Admin
  },
  {
    featureKey: "manajemen_kamus_panduan",
    label: "Manajemen Kamus Panduan",
    description: "Menampilkan akses ke halaman manajemen kamus dan interpretasi panduan gaya komunikasi.",
    defaultEnabled: (_roleGroup: string) => false, // Default: nonaktif untuk semua kecuali Admin
  },
  {
    featureKey: "jangka_asesmen_ulang",
    label: "Jangka Asesmen Ulang",
    description: "Menampilkan akses ke halaman pengaturan jangka waktu minimal pengisian ulang asesmen.",
    defaultEnabled: (_roleGroup: string) => false, // Default: nonaktif untuk semua kecuali Admin
  },
  {
    featureKey: "manajemen_menu_aplikasi",
    label: "Manajemen Menu Aplikasi",
    description: "Menampilkan akses ke halaman manajemen fitur aplikasi.",
    defaultEnabled: (_roleGroup: string) => false, // Default: nonaktif untuk semua kecuali Admin
  },
  {
    featureKey: "rekapitulasi_coaching",
    label: "Rekapitulasi Coaching",
    description: "Menampilkan menu rekapitulasi data coaching pegawai.",
    defaultEnabled: (_roleGroup: string) => false, // Default: nonaktif untuk semua kecuali Admin
  },
];

const ROLE_GROUPS = ["Staf", "Asisten Deputi", "Deputi Direksi Wilayah"];

// Seed/upsert data — selalu jalankan agar flag baru langsung tersedia dengan department "GLOBAL"
export async function seedDefaultFlagsIfEmpty() {
  const count = await prisma.featureFlag.count();
  const expectedCount = DEFAULT_FLAGS.length * ROLE_GROUPS.length;
  if (count >= expectedCount) return;

  for (const flag of DEFAULT_FLAGS) {
    for (const roleGroup of ROLE_GROUPS) {
      await prisma.featureFlag.upsert({
        where: { featureKey_roleGroup_department: { featureKey: flag.featureKey, roleGroup, department: "GLOBAL" } },
        update: {}, // Jangan timpa nilai yang sudah diubah admin
        create: {
          featureKey: flag.featureKey,
          roleGroup,
          department: "GLOBAL",
          enabled: flag.defaultEnabled(roleGroup),
          label: flag.label,
          description: flag.description,
        },
      });
    }
  }
}

// Ambil semua flag
export async function getFeatureFlags() {
  await seedDefaultFlagsIfEmpty();
  return prisma.featureFlag.findMany({
    orderBy: [{ featureKey: "asc" }, { roleGroup: "asc" }, { department: "asc" }],
  });
}

// Toggle status enabled
export async function toggleFeatureFlag(id: string, enabled: boolean) {
  await prisma.featureFlag.update({
    where: { id },
    data: { enabled },
  });
  revalidatePath("/profile");
  revalidatePath("/admin/features");
}

// Tambah atau Update custom department flag override
export async function saveDepartmentFeatureFlag(
  featureKey: string,
  roleGroup: string,
  department: string | null,
  enabled: boolean,
  label: string,
  description: string
) {
  const deptValue = department || "GLOBAL";
  await prisma.featureFlag.upsert({
    where: {
      featureKey_roleGroup_department: {
        featureKey,
        roleGroup,
        department: deptValue
      }
    },
    update: { enabled },
    create: {
      featureKey,
      roleGroup,
      department: deptValue,
      enabled,
      label,
      description
    }
  });

  revalidatePath("/profile");
  revalidatePath("/admin/features");
  return { success: true };
}

// Helper: cek apakah fitur aktif untuk role group dan department tertentu
function normalizeDepartment(dept?: string | null) {
  if (!dept) return null;
  if (dept === "Bidang SDM, Umum, dan Komunikasi" || dept === "SDM, Umum dan Komunikasi" || dept === "SDM, Umum, dan Komunikasi") {
    return "Bidang SDM, Umum dan Komunikasi (SDMUK)";
  }
  return dept;
}

export async function isFeatureEnabled(
  featureKey: string,
  roleGroup: string,
  department?: string | null
): Promise<boolean> {
  await seedDefaultFlagsIfEmpty();
  const normalizedDept = normalizeDepartment(department);
  
  if (normalizedDept && normalizedDept !== "GLOBAL") {
    // Coba cari kecocokan spesifik department dahulu
    const deptFlag = await prisma.featureFlag.findUnique({
      where: {
        featureKey_roleGroup_department: {
          featureKey,
          roleGroup,
          department: normalizedDept
        }
      }
    });
    if (deptFlag !== null) {
      return deptFlag.enabled;
    }
  }

  // Fallback ke flag global (department "GLOBAL")
  const globalFlag = await prisma.featureFlag.findUnique({
    where: {
      featureKey_roleGroup_department: {
        featureKey,
        roleGroup,
        department: "GLOBAL"
      }
    }
  });
  return globalFlag?.enabled ?? false;
}

// Ambil semua flags sekaligus sebagai map untuk performa (di-resolve berdasarkan department dan roleGroup user saat ini)
export async function getFeatureFlagsMap(
  roleGroup: string,
  department?: string | null
): Promise<Record<string, boolean>> {
  await seedDefaultFlagsIfEmpty();
  const normalizedDept = normalizeDepartment(department);
  
  // Ambil semua flags untuk role group tertentu
  const flags = await prisma.featureFlag.findMany({
    where: { roleGroup }
  });

  const map: Record<string, boolean> = {};

  // Kelompokkan flags berdasarkan featureKey
  const grouped: Record<string, typeof flags> = {};
  for (const f of flags) {
    if (!grouped[f.featureKey]) grouped[f.featureKey] = [];
    grouped[f.featureKey].push(f);
  }

  // Resolve untuk setiap featureKey
  for (const featureKey in grouped) {
    const list = grouped[featureKey];
    // Cari specific department dahulu
    const deptSpecific = (normalizedDept && normalizedDept !== "GLOBAL") ? list.find(f => f.department === normalizedDept) : null;
    if (deptSpecific) {
      map[featureKey] = deptSpecific.enabled;
    } else {
      const global = list.find(f => f.department === "GLOBAL");
      map[featureKey] = global ? global.enabled : false;
    }
  }

  return map;
}
