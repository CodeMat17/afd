"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Deletes a product after confirming in a modal. `compact` is the icon
 * button used in the products table; otherwise a full button (edit page).
 * `redirectTo` navigates away afterwards, for pages that showed the product.
 */
export function DeleteProductButton({
  id,
  name,
  compact,
  redirectTo,
}: {
  id: string;
  name: string;
  compact?: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (!result.ok) {
        toast.error("Not deleted", { description: result.message, duration: 7000 });
        return;
      }
      setOpen(false);
      toast.success(`Deleted “${name}”`, {
        description: result.message,
        duration: result.message.includes("couldn't") ? 10000 : undefined,
      });
      if (redirectTo) router.replace(redirectTo);
      else router.refresh();
    });
  }

  return (
    <AlertDialog
      open={open}
      // Stay open while the delete runs, so it can't be dismissed half-way.
      onOpenChange={(next) => {
        if (!pending) setOpen(next);
      }}
    >
      <AlertDialogTrigger
        render={
          compact ? (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              aria-label={`Delete ${name}`}
              title="Delete product"
            />
          ) : (
            <Button type="button" variant="destructive" />
          )
        }
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {compact ? null : "Delete product"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete “{name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            It&apos;s removed from the storefront, its photos are deleted from Cloudinary and its stock history is
            cleared. Past orders keep their details. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {pending ? "Deleting…" : "Delete product"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
