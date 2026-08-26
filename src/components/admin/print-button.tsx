"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm">
      Simpan ke PDF
    </button>
  );
}
