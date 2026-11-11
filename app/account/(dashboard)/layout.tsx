import { Suspense, type ReactNode } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { Container, PageHeader } from "@/components/ui/section";
import { requireCustomer } from "@/lib/auth-server";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageHeader eyebrow="Your account" title="Account" />
      <Container className="grid gap-8 py-10 pb-24 lg:grid-cols-[14rem_1fr] lg:gap-16 lg:py-14">
        <aside>
          <AccountNav />
        </aside>
        <div>
          {/* Reading the session happens per request, so it streams in here. */}
          <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-muted" />}>
            <SignedIn>{children}</SignedIn>
          </Suspense>
        </div>
      </Container>
    </>
  );
}

/** Signed-out visitors are sent to the sign-in page. */
async function SignedIn({ children }: { children: ReactNode }) {
  await requireCustomer();
  return children;
}
