"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_CONTACT, type ContactDetails } from "@/lib/contact";

const ContactContext = createContext<ContactDetails>(DEFAULT_CONTACT);

/** Hands the admin-managed contact details (read in the root layout) to client components. */
export function ContactProvider({ value, children }: { value: ContactDetails; children: ReactNode }) {
  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useContact(): ContactDetails {
  return useContext(ContactContext);
}
