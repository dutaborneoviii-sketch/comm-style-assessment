"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Definisi semua fitur yang bisa dikelola
const DEFAULT_FLAGS = [
  {
    featureKey: "panduan_komunikasi",
    label: "Panduan Gaya Komunikasi",
    description: "Menampilkan menu akses ke halaman panduan gaya komunikasi.",
    defaultEnabled: (roleGroup: string) => !["Pelaksana", "PTT/PATT"].includes(roleGroup),
  },
  {
    featureKey: "ulangi_asesmen",
    label: "Ulangi / Perbarui Asesmen",
    description: "Menampilkan tombol untuk mengulang kuesioner asesmen gaya komunikasi.",
    defaultEnabled: (roleGroup: string) => ["Pelaksana", "PTT/PATT"].includes(roleGroup),
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

const ROLE_GROUPS = ["Deputi Direksi Wilayah", "Senior Manager", "Manager", "Asisten Manager", "Pelaksana", "PTT/PATT"];

// Seed/upsert data — selalu jalankan agar flag baru langsung tersedia dengan department "GLOBAL"
export async function seedDefaultFlagsIfEmpty() {
  const count = await prisma.featureFlag.count({ where: { department: "GLOBAL" } });
  const expectedCount = DEFAULT_FLAGS.length * ROLE_GROUPS.length;
  if (count >= expectedCount) return;

  for (const flag of DEFAULT_FLAGS) {
    for (const roleGroup of ROLE_GROUPS) {
      const existing = await prisma.featureFlag.findUnique({
        where: { featureKey_roleGroup_department_location: { featureKey: flag.featureKey, roleGroup, department: "GLOBAL", location: "GLOBAL" } },
      });
      if (!existing) {
        await prisma.featureFlag.create({
          data: {
            featureKey: flag.featureKey,
            roleGroup,
            department: "GLOBAL",
            location: "GLOBAL",
            enabled: flag.defaultEnabled(roleGroup),
            label: flag.label,
            description: flag.description,
          },
        });
      }
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
  location: string | null,
  enabled: boolean,
  label: string,
  description: string
) {
  const deptValue = department || "GLOBAL";
  const locValue = location || "GLOBAL";
  const existing = await prisma.featureFlag.findUnique({
    where: {
      featureKey_roleGroup_department_location: {
        featureKey,
        roleGroup,
        department: deptValue,
        location: locValue
      }
    }
  });

  if (existing) {
    await prisma.featureFlag.update({
      where: { id: existing.id },
      data: { enabled }
    });
  } else {
    await prisma.featureFlag.create({
      data: {
        featureKey,
        roleGroup,
        department: deptValue,
        location: locValue,
        enabled,
        label,
        description
      }
    });
  }

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
  department?: string | null,
  location?: string | null
): Promise<boolean> {
  await seedDefaultFlagsIfEmpty();
  const normalizedDept = normalizeDepartment(department);
  const normalizedLoc = location || "GLOBAL";
  
  // 1. Coba cari spesifik department & location
  if (normalizedDept && normalizedDept !== "GLOBAL" && normalizedLoc !== "GLOBAL") {
    const locFlag = await prisma.featureFlag.findUnique({
      where: {
        featureKey_roleGroup_department_location: {
          featureKey,
          roleGroup,
          department: normalizedDept,
          location: normalizedLoc
        }
      }
    });
    if (locFlag !== null) return locFlag.enabled;
  }

  // 2. Coba cari spesifik department & GLOBAL location
  if (normalizedDept && normalizedDept !== "GLOBAL") {
    const deptFlag = await prisma.featureFlag.findUnique({
      where: {
        featureKey_roleGroup_department_location: {
          featureKey,
          roleGroup,
          department: normalizedDept,
          location: "GLOBAL"
        }
      }
    });
    if (deptFlag !== null) {
      return deptFlag.enabled;
    }
  }

  // 3. Fallback ke flag global (department "GLOBAL", location "GLOBAL")
  const globalFlag = await prisma.featureFlag.findUnique({
    where: {
      featureKey_roleGroup_department_location: {
        featureKey,
        roleGroup,
        department: "GLOBAL",
        location: "GLOBAL"
      }
    }
  });
  return globalFlag?.enabled ?? false;
}

// Ambil semua flags sekaligus sebagai map untuk performa (di-resolve berdasarkan department dan roleGroup user saat ini)
export async function getFeatureFlagsMap(
  roleGroup: string,
  department?: string | null,
  location?: string | null
): Promise<Record<string, boolean>> {
  await seedDefaultFlagsIfEmpty();
  const normalizedDept = normalizeDepartment(department);
  const normalizedLoc = location || "GLOBAL";
  
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
    // Cari specific location dahulu
    const locSpecific = (normalizedDept && normalizedDept !== "GLOBAL" && normalizedLoc !== "GLOBAL") 
        ? list.find(f => f.department === normalizedDept && f.location === normalizedLoc) 
        : null;
        
    if (locSpecific) {
      map[featureKey] = locSpecific.enabled;
    } else {
      // Cari specific department dahulu
      const deptSpecific = (normalizedDept && normalizedDept !== "GLOBAL") ? list.find(f => f.department === normalizedDept && f.location === "GLOBAL") : null;
      if (deptSpecific) {
        map[featureKey] = deptSpecific.enabled;
      } else {
        const global = list.find(f => f.department === "GLOBAL" && f.location === "GLOBAL");
        map[featureKey] = global ? global.enabled : false;
      }
    }
  }

  return map;
}
