/**
 * The showroom's phone, WhatsApp and email. The admin edits these in
 * /admin/settings; the values below are used until they first save.
 * Safe to import from client components.
 */
export interface ContactDetails {
  /** As displayed, e.g. "+254 710 660 524". */
  phone: string;
  /** As displayed; links use the digits only. */
  whatsapp: string;
  email: string;
}

export const DEFAULT_CONTACT: ContactDetails = {
  phone: "+254 710 660 524",
  whatsapp: "+254 710 660 524",
  email: "sales@africanfabricanddesigns.com",
};

/** "+254 710 660 524" → "tel:+254710660524". */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** "+254 710 660 524" → "254710660524", the form wa.me expects. */
export function whatsappDigits(number: string): string {
  return number.replace(/\D/g, "");
}
