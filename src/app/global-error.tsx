"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h2 style={{ color: 'red' }}>Terjadi Kesalahan Fatal Sistem</h2>
          <pre style={{ background: '#f8f8f8', padding: '10px', marginTop: '20px' }}>
            {error.message || "Unknown error"}
          </pre>
          <button onClick={() => reset()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
