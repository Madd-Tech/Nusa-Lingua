import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const runtime = "edge";
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(160deg, #FFF3D6 0%, #FFFBF5 60%)",
          color: "#1C1917",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 88, height: 88, borderRadius: 26, background: "#1A7A43", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, background: "#E3A008" }} />
          </div>
          <div style={{ fontSize: 52, fontWeight: 800 }}>
            Nusa<span style={{ color: "#1F8A4C" }}>Lingua</span>
          </div>
        </div>
        <div style={{ marginTop: 48, fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{SITE.tagline}</div>
        <div style={{ marginTop: 24, fontSize: 32, color: "#57534E" }}>Bahasa daerah · Budaya · Teman ngobrol AI</div>
      </div>
    ),
    size,
  );
}
