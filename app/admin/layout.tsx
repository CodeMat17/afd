import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

/**
 * `data-admin-root` hides the storefront header, footer and floating cart
 * (see globals.css), so the admin gets its own full-screen frame.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div data-admin-root="">
      {children}
      <Toaster richColors closeButton position="top-center" />
    </div>
  );
}
