import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { FloatingCart } from "@/components/layout/floating-cart";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/providers";
import { catalog } from "@/lib/repository";
import { site } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — African textiles from Nairobi`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_KE",
    images: [{ url: "/images/wooven-kente/1000294627-680x920.jpg", width: 680, height: 920 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e7" },
    { media: "(prefers-color-scheme: dark)", color: "#171310" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const categories = await catalog.getCategories();
  const nav = categories.map(({ name, slug, tagline, imageUrl }) => ({
    name,
    slug,
    tagline,
    imageUrl,
  }));

  return (
    <html lang="en-KE" className={`${manrope.variable} ${cormorant.variable} antialiased`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-100 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Providers>
          {/* <AnnouncementBar /> */}
          <Header categories={nav} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer categories={nav} />
          <FloatingCart />
        </Providers>
      </body>
    </html>
  );
}
