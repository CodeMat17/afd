import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_CONTACT, type ContactDetails } from "@/lib/contact";
import { api, convexClient } from "@/lib/convex/server";

/** Saving contact details in /admin/settings calls `updateTag(CONTACT_TAG)`. */
export const CONTACT_TAG = "contact";

/**
 * The showroom's contact details, cached until the admin changes them.
 * Falls back to the defaults before Convex is connected or anything is saved.
 */
export async function getContactDetails(): Promise<ContactDetails> {
  "use cache";
  cacheTag(CONTACT_TAG);
  cacheLife("max");

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return DEFAULT_CONTACT;
  const row = await convexClient().query(api.contact.get, {});
  return row ? { phone: row.phone, whatsapp: row.whatsapp, email: row.email } : DEFAULT_CONTACT;
}
