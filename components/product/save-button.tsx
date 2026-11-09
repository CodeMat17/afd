"use client";

import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { savedStore, useIdList } from "@/lib/id-list-store";
import { notify } from "@/lib/notify";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

/** Heart toggle for the device-local saved list. */
export function SaveButton({
  productId,
  productName,
  imageUrl,
  variant = "overlay",
  className,
}: {
  productId: string;
  productName: string;
  imageUrl?: string;
  variant?: "overlay" | "outline";
  className?: string;
}) {
  const hydrated = useHydrated();
  const saved = useIdList(savedStore).includes(productId) && hydrated;

  const onClick = () => {
    const nowSaved = savedStore.toggle(productId);
    notify(
      nowSaved
        ? { title: "Saved for later", description: productName, imageUrl, action: { label: "View saved", href: "/saved" } }
        : { title: "Removed from saved", description: productName, imageUrl },
      2800,
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={`Save ${productName}`}
      className={cn(
        "flex items-center justify-center rounded-full transition-[background-color,color,border-color,transform] duration-300 active:scale-90",
        variant === "overlay"
          ? "size-10 border border-white/20 bg-background/80 shadow-[0_8px_24px_-12px_rgb(15_12_10/0.6)] backdrop-blur-xl hover:bg-background"
          : "h-13 w-13 border border-foreground/20 hover:border-foreground",
        saved && "text-primary",
        className,
      )}
    >
      <motion.span
        key={saved ? "on" : "off"}
        initial={saved ? { scale: 0.5 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="flex"
      >
        <Heart className={cn("size-[1.1rem]", saved && "fill-current")} aria-hidden="true" />
      </motion.span>
    </button>
  );
}
