"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="eyebrow text-primary">Something went wrong</p>
      <h1 className="mt-4 font-heading text-5xl leading-[0.95] sm:text-6xl">
        A loose thread <em className="text-primary">somewhere.</em>
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        This page couldn&apos;t be displayed. Please try again — if it keeps happening, contact us.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={() => retry()}>
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
