import Image from "next/image";
import type { ReactNode } from "react";
import { PreviewNotice } from "@/components/ui/section";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid lg:min-h-[calc(100svh-var(--header-height))] lg:grid-cols-2">
      <div className="dark relative hidden overflow-hidden bg-ink lg:block">
        <Image
          src="/images/luxury-lace/1000258429-680x920.jpg"
          alt=""
          fill
          sizes="50vw"
          className="animate-ken-burns object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/20 to-transparent" />
        <p className="absolute right-12 bottom-12 left-12 font-heading text-5xl leading-[0.95] text-ink-foreground">
          Your fabrics, <em className="text-gold">saved for later.</em>
        </p>
      </div>
      <div className="flex items-center justify-center px-4 py-14 sm:px-6 lg:px-16">
        <div className="w-full max-w-md">
          {children}
          <PreviewNotice title="Accounts are in preview" className="mt-10">
            Sign-in isn&apos;t connected to a secure service yet, so no account is created and nothing
            you type is stored. Your cart stays on this device.
          </PreviewNotice>
        </div>
      </div>
    </div>
  );
}
