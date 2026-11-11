import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/admin-forms";
import { ADMIN_HOME, safeAdminPath } from "@/lib/admin/session";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Sign in" };

export default function AdminLoginPage(props: PageProps<"/admin/login">) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <Image
          src="/images/wooven-kente/1000294627-680x920.jpg"
          alt=""
          fill
          preload
          sizes="55vw"
          className="animate-ken-burns object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-ink/10" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-ink-foreground">
          <p className="eyebrow text-ink-muted">{site.name}</p>
          <p className="mt-4 max-w-md font-heading text-5xl leading-[1.05] font-medium text-balance">
            Everything your store needs, in one calm place.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
            Orders, products, stock and checkout — managed from here.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to the store
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <span className="mb-8 inline-flex w-fit rounded-xl bg-ivory p-2 ring-1 ring-foreground/5">
            <Image src={site.logo.src} alt={site.logo.alt} width={site.logo.width} height={site.logo.height} className="h-12 w-auto" />
          </span>
          <p className="eyebrow text-primary">Store admin</p>
          <h1 className="mt-2 font-heading text-5xl leading-[1.05] font-medium">Welcome back</h1>
          <p className="mt-3 mb-8 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Sign in with the admin password to manage your shop.
          </p>
          <Suspense fallback={<LoginForm />}>
            <Form {...props} />
          </Suspense>
          <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
            Staff only. You stay signed in for 8 hours on this device.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Carries `?next=` through the form so the admin returns to where they were. */
async function Form({ searchParams }: PageProps<"/admin/login">) {
  const next = safeAdminPath((await searchParams).next);
  return <LoginForm next={next === ADMIN_HOME ? undefined : next} />;
}
