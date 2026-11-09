import type { Metadata } from "next";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { SavedView } from "@/components/saved/saved-view";
import { Container, PageHeader } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Saved",
  robots: { index: false },
};

export default function SavedPage() {
  return (
    <>
      <PageHeader
        eyebrow="Your shortlist"
        title={
          <>
            Saved <em>fabrics</em>
          </>
        }
      />
      <Container className="py-10 pb-20 lg:py-14">
        <SavedView />
      </Container>
      <RecentlyViewed className="border-t bg-surface py-20" />
    </>
  );
}
