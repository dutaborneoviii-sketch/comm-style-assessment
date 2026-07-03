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

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const difference = score1 - score2;
  
  // Kombinasi hanya terjadi jika perbedaan skor tipis (<= 25% dari total pertanyaan)
  // DAN skor kedua tidak nol (artinya memang ada kecenderungan ke gaya tersebut).
  if (difference <= (total * 0.25) && score2 > 0) {
    return {
      primaryStyle: STYLE_MAP[top1],
      secondaryStyle: STYLE_MAP[top2],
      isCombination: true
    };
  }

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

export const STYLE_DESCRIPTIONS: Record<string, string> = {
  "Directive (Direct / The Driver)": "Fokus utama Anda adalah efisiensi, aksi, dan pencapaian target (hasil akhir).",
  "Expressive (Expressive / The Initiator)": "Fokus utama Anda adalah visi, inovasi, kolaborasi aktif, dan gambaran besar (big picture).",
  "Harmonious (Relater / The Amiable)": "Fokus utama Anda adalah keselarasan tim, empati, keandalan, dan lingkungan kerja yang suportif.",
  "Analytical (Analytical / The Thinker)": "Fokus utama Anda adalah akurasi, struktur, logika berlandaskan data, dan proses yang benar."
};

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
