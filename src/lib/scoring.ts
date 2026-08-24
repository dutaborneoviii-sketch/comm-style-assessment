export type AnswerCounts = {
  A: number;
  B: number;
  C: number;
  D: number;
};

export type StyleResult = {
  primaryStyle: string;
  secondaryStyle: string | null;
  isCombination: boolean;
};

export const STYLE_MAP: Record<keyof AnswerCounts, string> = {
  A: "Directive (Direct / The Driver)",
  B: "Expressive (Expressive / The Initiator)",
  C: "Harmonious (Relater / The Amiable)",
  D: "Analytical (Analytical / The Thinker)"
};

export function calculateStyle(counts: AnswerCounts): StyleResult {
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]) as [keyof AnswerCounts, number][];
  
  const [top1, score1] = sorted[0];
  const [top2, score2] = sorted[1];

  const TOTAL_QUESTIONS = 30;
  
  // Calculate percentage (Score / 30 * 100)
  const percent1 = (score1 / TOTAL_QUESTIONS) * 100;
  const percent2 = (score2 / TOTAL_QUESTIONS) * 100;
  
  // Calculate difference
  const difference = percent1 - percent2;

  // JIKA selisih persentase Peringkat 1 dan Peringkat 2 KURANG DARI ATAU SAMA DENGAN (<=) 8%, 
  // MAKA Gaya Komunikasi Final adalah KOMBINASI
  if (difference <= 8 && score2 > 0) {
    return {
      primaryStyle: STYLE_MAP[top1],
      secondaryStyle: STYLE_MAP[top2],
      isCombination: true
    };
  }

  // JIKA selisih persentase Peringkat 1 dan Peringkat 2 LEBIH DARI (>) 8%, 
  // MAKA Gaya Komunikasi Final diambil HANYA dari yang tertinggi
  return {
    primaryStyle: STYLE_MAP[top1],
    secondaryStyle: null,
    isCombination: false
  };
}

export const STYLE_COLORS: Record<string, string> = {
  "Directive (Direct / The Driver)": "bg-red-500 text-white",
  "Expressive (Expressive / The Initiator)": "bg-amber-500 text-white",
  "Harmonious (Relater / The Amiable)": "bg-emerald-500 text-white",
  "Analytical (Analytical / The Thinker)": "bg-indigo-500 text-white",
};

// Alias map: nilai lama di DB (nama pendek Bahasa Indonesia) → kunci lengkap
export const STYLE_ALIAS: Record<string, string> = {
  "Direktif": "Directive (Direct / The Driver)",
  "Ekspresif": "Expressive (Expressive / The Initiator)",
  "Harmonis": "Harmonious (Relater / The Amiable)",
  "Analitis": "Analytical (Analytical / The Thinker)",
  // Possible old English short keys
  "Directive": "Directive (Direct / The Driver)",
  "Expressive": "Expressive (Expressive / The Initiator)",
  "Harmonious": "Harmonious (Relater / The Amiable)",
  "Analytical": "Analytical (Analytical / The Thinker)",
};

export const STYLE_DESCRIPTIONS: Record<string, string> = {
  "Directive (Direct / The Driver)": "Fokus utama Anda adalah efisiensi, aksi, dan pencapaian target (hasil akhir).",
  "Expressive (Expressive / The Initiator)": "Fokus utama Anda adalah visi, inovasi, kolaborasi aktif, dan gambaran besar (big picture).",
  "Harmonious (Relater / The Amiable)": "Fokus utama Anda adalah keselarasan tim, empati, keandalan, dan lingkungan kerja yang suportif.",
  "Analytical (Analytical / The Thinker)": "Fokus utama Anda adalah akurasi, struktur, logika berlandaskan data, dan proses yang benar."
};

// Safe lookup: supports both full keys and old short-name keys
export function resolveStyleKey(style: string): string {
  return STYLE_ALIAS[style] ?? style;
}

export function getStyleDescription(style: string): string {
  if (!style) return "";
  if (style.includes(" + ")) {
    const [primary, secondary] = style.split(" + ");
    const desc1 = STYLE_DESCRIPTIONS[resolveStyleKey(primary)]?.replace("Fokus utama Anda adalah ", "").replace(".", "") || "";
    const desc2 = STYLE_DESCRIPTIONS[resolveStyleKey(secondary)]?.replace("Fokus utama Anda adalah ", "").replace(".", "") || "";
    if (desc1 && desc2) return `Fokus utama Anda adalah ${desc1} serta ${desc2}.`;
  }
  return STYLE_DESCRIPTIONS[resolveStyleKey(style)] ?? "";
}

export function getStyleTrait(style: string): string {
  if (!style) return "";
  if (style.includes(" + ")) {
    const [primary, secondary] = style.split(" + ");
    const trait1 = STYLE_TRAITS[resolveStyleKey(primary)]?.replace(".", "") || "";
    const trait2 = STYLE_TRAITS[resolveStyleKey(secondary)]?.replace(".", "") || "";
    if (trait1 && trait2) return `${trait1} & ${trait2}.`;
  }
  return STYLE_TRAITS[resolveStyleKey(style)] ?? "";
}

export function getStyleAdvice(style: string): string {
  if (!style) return "";
  if (style.includes(" + ")) {
    const [primary, secondary] = style.split(" + ");
    const adv1 = STYLE_ADVICE[resolveStyleKey(primary)] || "";
    const adv2 = STYLE_ADVICE[resolveStyleKey(secondary)] || "";
    if (adv1 && adv2) return `${adv1} Di sisi lain, ${adv2}`;
  }
  return STYLE_ADVICE[resolveStyleKey(style)] ?? "";
}

export function getStyleColor(style: string): string {
  return STYLE_COLORS[resolveStyleKey(style)] ?? "bg-gray-500 text-white";
}

export const STYLE_TRAITS: Record<string, string> = {
  "Directive (Direct / The Driver)": "Lugas, berorientasi pada penyelesaian masalah, tidak menyukai birokrasi yang panjang.",
  "Expressive (Expressive / The Initiator)": "Komunikator yang antusias, persuasif, memiliki energi yang tinggi, dan fleksibel.",
  "Harmonious (Relater / The Amiable)": "Pendengar aktif yang luar biasa, diplomatis, mengutamakan konsensus, stabil.",
  "Analytical (Analytical / The Thinker)": "Terorganisasi, presisi, berhati-hati dalam berargumen (hanya bicara bila ada fakta), sistematis."
};

export const STYLE_ADVICE: Record<string, string> = {
  "Directive (Direct / The Driver)": "Sampaikan poin utama di awal (konsep bottom-line first). Berikan opsi penyelesaian yang konkret alih-alih mengeluhkan masalah. Hindari rapat tanpa agenda yang jelas atau mempresentasikan detail teknis yang tidak mereka minta.",
  "Expressive (Expressive / The Initiator)": "Tunjukkan antusiasme Anda terhadap ide mereka. Diskusikan \"mengapa\" (why) sebelum \"bagaimana\" (how). Beri mereka ruang untuk bercerita, dan bantu merangkum percakapan di akhir agar poin tindakan (action items) tidak terlewatkan oleh ide-ide besar.",
  "Harmonious (Relater / The Amiable)": "Bangun kepercayaan (trust) dan koneksi profesional secara personal. Jangan memaksa mereka membuat keputusan saat itu juga (berikan waktu untuk menimbang efeknya bagi orang lain). Gunakan bahasa yang suportif dan konfirmasikan kesepakatan secara kolaboratif.",
  "Analytical (Analytical / The Thinker)": "Siapkan data, dokumen, atau fakta kuantitatif sebelum berdiskusi. Berikan penjelasan yang terstruktur secara kronologis. Hindari bahasa yang terlalu emosional atau menekan mereka untuk menyetujui sesuatu yang belum terbukti secara metodologis."
};
