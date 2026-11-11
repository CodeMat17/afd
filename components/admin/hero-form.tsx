"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { getHeroUploadSignature, saveHero } from "@/app/admin/(dashboard)/hero/actions";
import { FormAlert } from "@/components/forms/form-alert";
import { Button } from "@/components/ui/button";

export interface HeroPhoto {
  publicId: string;
  url: string;
  width: number;
  height: number;
}

const MIN_IMAGES = 9;
const MAX_IMAGES = 15;
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Upload, order and remove the hero photos. Nothing reaches the home page
 * until "Save hero" is pressed.
 */
export function HeroForm({ images: saved, updatedAt }: { images: HeroPhoto[]; updatedAt: string | null }) {
  const router = useRouter();
  const [images, setImages] = useState<HeroPhoto[]>(saved);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty =
    images.length !== saved.length || images.some((image, i) => image.publicId !== saved[i]?.publicId);
  const tooFew = images.length < MIN_IMAGES;

  async function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length === 0) return;
    setUploadError(null);

    const room = MAX_IMAGES - images.length - uploading;
    const accepted = files.filter((f) => f.type.startsWith("image/") && f.size <= MAX_BYTES).slice(0, room);
    if (accepted.length < files.length) {
      setUploadError(
        `Some files were skipped: photos must be images under 10 MB, and the hero holds at most ${MAX_IMAGES}.`,
      );
    }
    if (accepted.length === 0) return;

    const signature = await getHeroUploadSignature();
    if ("error" in signature) {
      setUploadError(signature.error);
      return;
    }

    setUploading((n) => n + accepted.length);
    await Promise.all(
      accepted.map(async (file) => {
        try {
          const body = new FormData();
          body.append("file", file);
          for (const [key, value] of Object.entries(signature.fields)) body.append(key, value);
          const response = await fetch(signature.uploadUrl, { method: "POST", body });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error?.message ?? `HTTP ${response.status}`);
          setImages((current) => [
            ...current,
            { publicId: result.public_id, url: result.secure_url, width: result.width, height: result.height },
          ]);
        } catch (error) {
          setUploadError(`Couldn't upload ${file.name}: ${error instanceof Error ? error.message : "unknown error"}`);
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  }

  const move = (index: number, by: -1 | 1) =>
    setImages((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return next;
    });

  function onSave() {
    startTransition(async () => {
      const result = await saveHero(images);
      if (!result.ok) {
        toast.error("Not saved", { description: result.message, duration: 7000 });
        return;
      }
      toast.success("Hero saved", {
        description: result.message,
        duration: result.message.includes("couldn't") ? 10000 : undefined,
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <FormAlert tone="info" title={`${images.length} photos (${MIN_IMAGES}–${MAX_IMAGES} required)`}>
        {tooFew
          ? `The hero needs at least ${MIN_IMAGES} photos and holds up to ${MAX_IMAGES}. Add ${MIN_IMAGES - images.length} more to save.`
          : images.length === MAX_IMAGES
            ? `That's the maximum. Remove a photo to add a different one.`
            : `Ready to save. You can add up to ${MAX_IMAGES - images.length} more.`}
      </FormAlert>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {images.map((image, index) => (
          <li key={image.publicId} className="space-y-2 rounded-xl border p-2">
            <div className="relative aspect-17/23 overflow-hidden rounded-lg bg-muted">
              <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />
              <span className="absolute top-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs font-semibold text-ink-foreground tabular-nums">
                {index + 1}
              </span>
            </div>
            <div className="flex justify-between">
              <div className="flex">
                <IconButton label="Move earlier" disabled={index === 0} onClick={() => move(index, -1)}>
                  <ArrowLeft className="size-4" />
                </IconButton>
                <IconButton label="Move later" disabled={index === images.length - 1} onClick={() => move(index, 1)}>
                  <ArrowRight className="size-4" />
                </IconButton>
              </div>
              <IconButton
                label="Remove photo"
                onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4 text-destructive" />
              </IconButton>
            </div>
          </li>
        ))}
        {images.length + uploading < MAX_IMAGES ? (
          <li>
            <label className="flex aspect-17/23 h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground">
              {uploading > 0 ? (
                <Loader2 className="size-6 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="size-6" aria-hidden="true" />
              )}
              {uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}
              <input type="file" accept="image/*" multiple className="sr-only" onChange={onFiles} />
            </label>
          </li>
        ) : null}
      </ul>
      {uploadError ? <FormAlert tone="error" title={uploadError} /> : null}

      <p className="text-sm text-muted-foreground">
        Portrait photos work best (about 3:4). Photos are dealt across the columns in this order. Removed photos are
        deleted from Cloudinary when you save.
      </p>

      <div className="flex flex-wrap items-center gap-4 border-t pt-6">
        <Button type="button" size="lg" onClick={onSave} disabled={pending || uploading > 0 || !dirty || tooFew}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "Saving…" : "Save hero"}
        </Button>
        {dirty ? (
          <Button type="button" variant="outline" size="lg" disabled={pending} onClick={() => setImages(saved)}>
            Discard changes
          </Button>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {dirty && tooFew
            ? `Add ${MIN_IMAGES - images.length} more photo${MIN_IMAGES - images.length === 1 ? "" : "s"} to save. The home page keeps the current hero until then.`
            : dirty
            ? "Unsaved changes. The home page keeps the current hero until you save."
            : updatedAt
              ? `Last saved ${updatedAt}.`
              : "Not saved yet."}
        </p>
      </div>
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30"
    >
      {children}
    </button>
  );
}
