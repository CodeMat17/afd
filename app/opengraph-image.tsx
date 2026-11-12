import { renderOgCard } from "@/lib/og-card";
import { site } from "@/lib/site";

// Config exports must be literals for Next to read them statically.
export const alt = `${site.name} — African fabrics, clothing & accessories from Nairobi`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Nairobi showroom",
    title: site.name,
    subtitle: "Fabrics, clothing & accessories",
    photos: ["/images/wooven-kente/1000294627-680x920.jpg", "/images/ankara/1000848729-680x920.jpg"],
  });
}
