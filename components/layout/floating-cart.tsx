"use client";

import { ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Suspense, useState } from "react";
import { useCartCount } from "@/lib/cart/use-cart";
import { overlay, useOverlay } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

/** Routes where a floating button would cover forms or the order summary. */
const HIDDEN_ON = ["/cart", "/checkout", "/account", "/contact"];

export function FloatingCart() {
  return (
    <Suspense fallback={null}>
      <FloatingCartInner />
    </Suspense>
  );
}

function FloatingCartInner() {
  const count = useCartCount();
  const pathname = usePathname();
  const drawerOpen = useOverlay() !== null;
  const { scrollY } = useScroll();
  const [pastHeader, setPastHeader] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setPastHeader(y > 320));

  const visible =
    count > 0 && pastHeader && !drawerOpen && !HIDDEN_ON.some((p) => pathname.startsWith(p));
  // Product pages show a sticky add-to-cart bar on small screens instead.
  const productPage = pathname.startsWith("/products/");

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className={cn(
            "fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40",
            productPage && "max-lg:hidden",
          )}
        >
          <button
            type="button"
            onClick={() => overlay.open("cart")}
            aria-haspopup="dialog"
            aria-label={`View cart, ${count} ${count === 1 ? "item" : "items"}`}
            className="relative flex size-14 items-center justify-center rounded-full bg-ink text-ink-foreground shadow-[0_18px_40px_-14px_rgb(31_26_22/0.7)] transition-transform hover:scale-105"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground tabular-nums ring-2 ring-background"
            >
              {count}
            </span>
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
