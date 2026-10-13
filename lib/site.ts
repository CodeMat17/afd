/** Business facts supplied by the client. Keep every claim here verifiable. */
export const site = {
  name: "African Fabric and Designs",
  legalName: "African Fabric and Designs Kenya Ltd.",
  domain: "africanfabricanddesigns.com",
  url: "https://africanfabricanddesigns.com",
  description:
    "African textiles from our Nairobi showroom: Ankara, Woven Kente, Isiagu, Ankara Sequin and luxury lace.",
  address: {
    street: "Marcus Garvey Rd",
    city: "Nairobi",
    country: "Kenya",
  },
  phone: {
    display: "+254 710 660 524",
    href: "tel:+254710660524",
    whatsapp: "254710660524",
  },
  email: "sales@africanfabricanddesigns.com",
  currency: "USD" as const,
  maps: {
    url: "https://www.google.com/maps/place/African+Fabric+And+Designs+Kenya+Ltd./@-1.294248,36.7911309,17z/",
    embed:
      "https://maps.google.com/maps?q=African%20Fabric%20And%20Designs%20Kenya%20Ltd.&ll=-1.294248,36.7911309&z=17&output=embed",
  },
  logo: {
    src: "/logo.png",
    width: 115,
    height: 80,
    alt: "African Fabric and Designs Kenya Ltd.",
  },
} as const;

/**
 * Factual announcement. Set to `null` to hide the strip. Never advertise
 * discounts, free shipping or delivery promises that are not confirmed.
 */
export const announcement: { message: string; href?: string; linkLabel?: string } | null =
  {
    message: "Preview storefront — products and prices shown are test data.",
    href: "/contact",
    linkLabel: "Contact the showroom",
  };

export const primaryNav = [
  { label: "Shop", href: "/shop" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const policyNav = [
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;
