import type { ReactNode } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { Container, PageHeader } from "@/components/ui/section";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageHeader eyebrow="Your account" title="Account" />
      <Container className="grid gap-8 py-10 pb-24 lg:grid-cols-[14rem_1fr] lg:gap-16 lg:py-14">
        <aside>
          <AccountNav />
        </aside>
        <div>{children}</div>
      </Container>
    </>
  );
}
