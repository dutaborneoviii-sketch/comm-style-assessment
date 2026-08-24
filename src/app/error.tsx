"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-900 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-lg border border-red-200">
        <h2 className="text-xl font-bold mb-4">Terjadi Kesalahan Sistem</h2>
        <div className="bg-red-100 p-3 rounded text-sm mb-4 font-mono overflow-auto max-h-48 text-red-800">
          {error.message || "Unknown error"}
        </div>
        <button
          onClick={() => reset()}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
