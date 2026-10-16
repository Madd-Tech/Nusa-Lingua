"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#FFFBF5", color: "#1C1917" }}>
        <main style={{ maxWidth: 480, margin: "15vh auto", padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Waduh, aplikasinya tersandung</h1>
          <p style={{ color: "#57534E" }}>Terjadi kesalahan tak terduga. Silakan coba lagi.</p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              padding: "12px 20px",
              borderRadius: 16,
              border: "none",
              borderBottom: "4px solid #145C33",
              background: "#1A7A43",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}
