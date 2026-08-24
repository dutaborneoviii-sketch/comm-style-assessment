"use server";

import * as xlsx from "xlsx";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function uploadDictionaryAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "File tidak ditemukan." };
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: "buffer" });

    // Ensure sheets exist
    const profilSheet = workbook.Sheets["Profil Utama"];
    const detailSheet = workbook.Sheets["Detail Panduan"];

    if (!profilSheet || !detailSheet) {
      return { 
        success: false, 
        error: "Format salah. Pastikan Excel memiliki sheet bernama 'Profil Utama' dan 'Detail Panduan'." 
      };
    }

    const profils: any[] = xlsx.utils.sheet_to_json(profilSheet);
    const details: any[] = xlsx.utils.sheet_to_json(detailSheet);

    // Grouping by Style_ID
    const dictMap = new Map<string, any>();

    for (const p of profils) {
      if (!p.Style_ID) continue;
      dictMap.set(p.Style_ID.trim(), {
        title: p.Title || "",
        subtitle: p.Subtitle || "",
        profil: p.Profil || "",
        suka: p.Suka ? p.Suka.toString().split('\n').filter(Boolean) : [],
        hindari: p.Hindari ? p.Hindari.toString().split('\n').filter(Boolean) : [],
        strategi: p.Strategi || "",
        rows: []
      });
    }

    for (const d of details) {
      if (!d.Style_ID) continue;
      const styleId = d.Style_ID.trim();
      if (dictMap.has(styleId)) {
        const style = dictMap.get(styleId);
        style.rows.push({
          cara: d.Judul_Panduan || "", // Map to cara/panduan
          penjelasan: d.Penjelasan || "",
          caraCoaching: d.Tindakan || "", // Map to caraCoaching/donts
          contohKalimat: d.Contoh_Kalimat || "" // Map to contohKalimat/contoh
        });
      }
    }

    // Save to DB
    const tx = Array.from(dictMap.entries()).map(([id, content]) => {
      return prisma.communicationDictionary.upsert({
        where: { id },
        update: { content: JSON.stringify(content) },
        create: { id, content: JSON.stringify(content) }
      });
    });

    await prisma.$transaction(tx);

    revalidatePath("/guide");
    revalidatePath("/admin/dictionary");

    return { success: true };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { success: false, error: "Gagal memproses file: " + (error.message || "Kesalahan tidak diketahui") };
  }
}

import { communicationStyles } from "@/components/communication-guide";

export async function getTemplateDataAction() {
  const dictEntries = await prisma.communicationDictionary.findMany();
  const dictMap = new Map(dictEntries.map(e => [e.id, JSON.parse(e.content)]));

  const stylesWithData = communicationStyles.map(style => ({
    id: style.id,
    fullGuide: dictMap.get(style.id) || style.fullGuide
  }));

  const profilData: any[] = [];
  const detailData: any[] = [];

  stylesWithData.forEach(style => {
    const guide = style.fullGuide;
    profilData.push({
      Style_ID: style.id,
      Title: guide.title || "",
      Subtitle: guide.subtitle || "",
      Profil: guide.profil || "",
      Suka: Array.isArray(guide.suka) ? guide.suka.join("\n") : (guide.suka || ""),
      Hindari: Array.isArray(guide.hindari) ? guide.hindari.join("\n") : (guide.hindari || ""),
      Strategi: guide.strategi || ""
    });

    if (guide.rows && Array.isArray(guide.rows)) {
      guide.rows.forEach((row: any) => {
        detailData.push({
          Style_ID: style.id,
          Judul_Panduan: row.panduan || row.cara || "",
          Penjelasan: row.penjelasan || "",
          Tindakan: row.caraCoaching || row.donts || "",
          Contoh_Kalimat: row.contohKalimat || row.contoh || ""
        });
      });
    }
  });

  return { profilData, detailData };
}
