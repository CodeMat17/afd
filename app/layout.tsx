import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { FloatingCart } from "@/components/layout/floating-cart";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Providers } from "@/components/providers";
import { CatalogProvider } from "@/components/providers/catalog-provider";
import { ContactProvider } from "@/components/providers/contact-provider";
import { SearchDialog } from "@/components/search/search-dialog";
import { flattenCategories } from "@/lib/catalog-tree";
import { getContactDetails } from "@/lib/contact-server";
import { catalog, getCatalogTree } from "@/lib/repository";
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
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — African fabrics, clothing & accessories`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_KE",
    // Default image comes from app/opengraph-image.tsx.
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
  const [departments, products, contact] = await Promise.all([
    getCatalogTree(),
    catalog.getProducts(),
    getContactDetails(),
  ]);

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
          <ContactProvider value={contact}>
            <CatalogProvider products={products} departments={departments} categories={flattenCategories(departments)}>
              {/* <AnnouncementBar /> */}
              {/* `data-site-chrome` is hidden inside the admin (see globals.css). */}
              <div data-site-chrome="" className="contents">
                <Header departments={departments} />
              </div>
              <main id="main" className="flex-1">
                {children}
              </main>
              <div data-site-chrome="" className="contents">
                <Footer departments={departments} contact={contact} />
                <FloatingCart />
              </div>
              <CartDrawer />
              <SearchDialog />
            </CatalogProvider>
          </ContactProvider>
        </Providers>
      </body>
    </html>
  );
}
