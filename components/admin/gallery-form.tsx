"use client";

import { ArrowDown, ArrowUp, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
  addGalleryPhoto,
  deleteGalleryPhoto,
  discardGalleryUploads,
  getGalleryUploadSignature,
  moveGalleryPhoto,
  updateGalleryPhoto,
  type GalleryActionResult,
} from "@/app/admin/(dashboard)/gallery/actions";
import { FormAlert } from "@/components/forms/form-alert";
import { TextField } from "@/components/forms/field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CloudPhoto {
  publicId: string;
  url: string;
  width: number;
  height: number;
}

interface PhotoText {
  caption: string;
  altText: string;
  /** "" when the photo isn't linked to a product. */
  productSlug: string;
}

export interface GalleryPhoto extends PhotoText {
  id: string;
  image: CloudPhoto;
}

interface Product {
  slug: string;
  name: string;
}

const MAX_IMAGES = 120;
const MAX_BYTES = 10 * 1024 * 1024;
const NO_PRODUCT = "__none";
const EMPTY_TEXT: PhotoText = { caption: "", altText: "", productSlug: "" };

async function uploadFiles(files: File[]): Promise<{ photos: CloudPhoto[]; errors: string[] }> {
  const signature = await getGalleryUploadSignature();
  if ("error" in signature) return { photos: [], errors: [signature.error] };
  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const body = new FormData();
        body.append("file", file);
        for (const [key, value] of Object.entries(signature.fields)) body.append(key, value);
        const response = await fetch(signature.uploadUrl, { method: "POST", body });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message ?? `HTTP ${response.status}`);
        const photo: CloudPhoto = {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
        };
        return { photo };
      } catch (error) {
        return { error: `Couldn't upload ${file.name}: ${error instanceof Error ? error.message : "unknown error"}` };
      }
    }),
  );
  return {
    photos: results.flatMap((r) => (r.photo ? [r.photo] : [])),
    errors: results.flatMap((r) => (r.error ? [r.error] : [])),
  };
}

function notify(result: GalleryActionResult, title: string) {
  if (!result.ok) {
    toast.error(title.replace(/^\w+/, "Not"), { description: result.message, duration: 7000 });
    return false;
  }
  toast.success(title, {
    description: result.message,
    duration: result.message.includes("couldn't") ? 10000 : undefined,
  });
  return true;
}

/**
 * The /gallery photos, managed one at a time: each card saves, replaces or
 * deletes its own photo straight away. New uploads wait as drafts until
 * their caption and description are filled in.
 */
export function GalleryManager({ photos, products }: { photos: GalleryPhoto[]; products: Product[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<CloudPhoto[]>([]);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [moving, startMove] = useTransition();

  const productItems = [
    { value: NO_PRODUCT, label: "No link" },
    ...products.map((p) => ({ value: p.slug, label: p.name })),
  ];

  async function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length === 0) return;
    setUploadError(null);

    const room = MAX_IMAGES - photos.length - drafts.length - uploading;
    const accepted = files.filter((f) => f.type.startsWith("image/") && f.size <= MAX_BYTES).slice(0, room);
    const problems: string[] = [];
    if (accepted.length < files.length) {
      problems.push(`Some files were skipped: photos must be images under 10 MB, and the gallery holds at most ${MAX_IMAGES}.`);
    }
    if (accepted.length > 0) {
      setUploading((n) => n + accepted.length);
      const { photos: uploaded, errors } = await uploadFiles(accepted);
      setUploading((n) => n - accepted.length);
      setDrafts((current) => [...current, ...uploaded]);
      problems.push(...errors);
    }
    setUploadError(problems.length > 0 ? problems.join(" ") : null);
  }

  function onMove(id: string, by: -1 | 1) {
    startMove(async () => {
      const result = await moveGalleryPhoto(id, by);
      if (!result.ok) toast.error("Not moved", { description: result.message });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <FormAlert tone="info" title={`${photos.length} photo${photos.length === 1 ? "" : "s"} in the gallery`}>
        Photos appear on the gallery page in this order. Each needs a short caption (shown under the photo) and a
        description of what&apos;s in it (read aloud by screen readers). Edits go live when you press Save on that
        photo.
      </FormAlert>

      {photos.length === 0 && drafts.length === 0 && uploading === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No photos yet. Add some below.
        </p>
      ) : null}

      <ul className="space-y-4">
        {photos.map((photo, index) => (
          <PhotoCard
            // Remounts with the stored values after a save; moves keep in-progress edits.
            key={`${photo.id}:${photo.image.publicId}:${photo.caption}:${photo.altText}:${photo.productSlug}`}
            photo={photo}
            index={index}
            count={photos.length}
            productItems={productItems}
            moving={moving}
            onMove={onMove}
          />
        ))}
      </ul>

      {drafts.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">
            New photos <span className="font-normal text-muted-foreground">(not on the site yet)</span>
          </h2>
          <ul className="space-y-4">
            {drafts.map((draft) => (
              <DraftCard
                key={draft.publicId}
                image={draft}
                productItems={productItems}
                onDone={() => setDrafts((current) => current.filter((d) => d.publicId !== draft.publicId))}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {photos.length + drafts.length + uploading < MAX_IMAGES ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground">
          {uploading > 0 ? (
            <Loader2 className="size-6 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-6" aria-hidden="true" />
          )}
          {uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}
          <span className="text-xs">Images under 10 MB. You can pick several at once.</span>
          <input type="file" accept="image/*" multiple className="sr-only" onChange={onFiles} />
        </label>
      ) : null}
      {uploadError ? <FormAlert tone="error" title={uploadError} /> : null}
    </div>
  );
}

/** A photo already in the gallery: edit its text, replace it, move it or delete it. */
function PhotoCard({
  photo,
  index,
  count,
  productItems,
  moving,
  onMove,
}: {
  photo: GalleryPhoto;
  index: number;
  count: number;
  productItems: { value: string; label: string }[];
  moving: boolean;
  onMove: (id: string, by: -1 | 1) => void;
}) {
  const router = useRouter();
  const [text, setText] = useState<PhotoText>({
    caption: photo.caption,
    altText: photo.altText,
    productSlug: photo.productSlug,
  });
  const [replacement, setReplacement] = useState<CloudPhoto | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dirty =
    replacement !== null ||
    text.caption !== photo.caption ||
    text.altText !== photo.altText ||
    text.productSlug !== photo.productSlug;
  const busy = saving || deleting || replacing;
  const shown = replacement ?? photo.image;

  async function onReplace(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_BYTES) {
      toast.error("Not replaced", { description: "Photos must be images under 10 MB." });
      return;
    }
    setReplacing(true);
    const { photos, errors } = await uploadFiles([file]);
    setReplacing(false);
    if (errors.length > 0 || photos.length === 0) {
      toast.error("Not replaced", { description: errors[0] ?? "Upload failed." });
      return;
    }
    // A replacement that was itself replaced before saving is never used.
    if (replacement) void discardGalleryUploads([replacement.publicId]);
    setReplacement(photos[0]);
  }

  function onDiscard() {
    if (replacement) void discardGalleryUploads([replacement.publicId]);
    setReplacement(null);
    setText({ caption: photo.caption, altText: photo.altText, productSlug: photo.productSlug });
    setShowErrors(false);
  }

  function onSave() {
    if (!text.caption.trim() || !text.altText.trim()) {
      setShowErrors(true);
      return;
    }
    startSave(async () => {
      const result = await updateGalleryPhoto({ id: photo.id, image: replacement ?? undefined, ...text });
      if (notify(result, "Photo saved")) router.refresh();
    });
  }

  function onDelete() {
    startDelete(async () => {
      const result = await deleteGalleryPhoto(photo.id);
      if (!notify(result, "Photo deleted")) return;
      if (replacement) void discardGalleryUploads([replacement.publicId]);
      setConfirmOpen(false);
      router.refresh();
    });
  }

  const controls = (className: string) => (
    <div className={cn("flex gap-1", className)}>
      <IconButton label="Move up" disabled={index === 0 || moving || busy} onClick={() => onMove(photo.id, -1)}>
        <ArrowUp className="size-4" />
      </IconButton>
      <IconButton
        label="Move down"
        disabled={index === count - 1 || moving || busy}
        onClick={() => onMove(photo.id, 1)}
      >
        <ArrowDown className="size-4" />
      </IconButton>
    </div>
  );

  return (
    <li className={cn("rounded-xl border p-3 sm:p-4", dirty && "border-primary/50")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start justify-between gap-3 sm:block sm:space-y-2">
          <Thumbnail image={shown} badge={String(index + 1)} loading={replacing} />
          {controls("sm:hidden")}
          <label
            className={cn(
              buttonClass,
              "hidden w-32 sm:inline-flex",
              busy && "pointer-events-none opacity-50",
            )}
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Replace
            <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={onReplace} />
          </label>
        </div>

        <TextFields
          id={`photo-${photo.id}`}
          text={text}
          onChange={(patch) => setText((current) => ({ ...current, ...patch }))}
          showErrors={showErrors}
          productItems={productItems}
          disabled={busy}
        />

        {controls("hidden sm:flex sm:flex-col")}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
        <Button type="button" size="sm" onClick={onSave} disabled={!dirty || busy}>
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {saving ? "Saving…" : "Save"}
        </Button>
        {dirty ? (
          <Button type="button" size="sm" variant="outline" onClick={onDiscard} disabled={busy}>
            Discard changes
          </Button>
        ) : null}
        <label className={cn(buttonClass, "sm:hidden", busy && "pointer-events-none opacity-50")}>
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Replace photo
          <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={onReplace} />
        </label>
        {replacement ? <span className="text-xs text-muted-foreground">New photo chosen. Save to use it.</span> : null}

        <AlertDialog
          open={confirmOpen}
          // Stay open while the delete runs, so it can't be dismissed half-way.
          onOpenChange={(next) => {
            if (!deleting) setConfirmOpen(next);
          }}
        >
          <AlertDialogTrigger
            render={<Button type="button" size="sm" variant="destructive" className="ml-auto" disabled={busy} />}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="relative mx-auto aspect-3/4 w-24 overflow-hidden rounded-lg bg-muted">
                <Image src={photo.image.url} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <AlertDialogTitle>Delete “{photo.caption}”?</AlertDialogTitle>
              <AlertDialogDescription>
                The photo, its caption and description are removed from the gallery and the file is deleted from
                Cloudinary. This can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onDelete} disabled={deleting}>
                {deleting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                {deleting ? "Deleting…" : "Delete photo"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}

/** A freshly uploaded photo, waiting for its text before it's added to the gallery. */
function DraftCard({
  image,
  productItems,
  onDone,
}: {
  image: CloudPhoto;
  productItems: { value: string; label: string }[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [text, setText] = useState<PhotoText>(EMPTY_TEXT);
  const [showErrors, setShowErrors] = useState(false);
  const [adding, startAdd] = useTransition();

  function onAdd() {
    if (!text.caption.trim() || !text.altText.trim()) {
      setShowErrors(true);
      return;
    }
    startAdd(async () => {
      const result = await addGalleryPhoto({ image, ...text });
      if (!notify(result, "Photo added")) return;
      onDone();
      router.refresh();
    });
  }

  function onCancel() {
    void discardGalleryUploads([image.publicId]);
    onDone();
  }

  return (
    <li className="rounded-xl border border-dashed border-primary/50 p-3 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Thumbnail image={image} badge="New" />
        <TextFields
          id={`draft-${image.publicId.replace(/\W/g, "-")}`}
          text={text}
          onChange={(patch) => setText((current) => ({ ...current, ...patch }))}
          showErrors={showErrors}
          productItems={productItems}
          disabled={adding}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
        <Button type="button" size="sm" onClick={onAdd} disabled={adding}>
          {adding ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {adding ? "Adding…" : "Add to gallery"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={adding}>
          Cancel
        </Button>
      </div>
    </li>
  );
}

const buttonClass =
  "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-semibold hover:bg-muted";

function Thumbnail({ image, badge, loading }: { image: CloudPhoto; badge: string; loading?: boolean }) {
  return (
    <div className="relative aspect-3/4 w-28 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-32">
      <Image src={image.url} alt="" fill sizes="128px" className="object-cover" />
      <span className="absolute top-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs font-semibold text-ink-foreground tabular-nums">
        {badge}
      </span>
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center bg-background/60">
          <Loader2 className="size-6 animate-spin" aria-label="Uploading" />
        </span>
      ) : null}
    </div>
  );
}

function TextFields({
  id,
  text,
  onChange,
  showErrors,
  productItems,
  disabled,
}: {
  id: string;
  text: PhotoText;
  onChange: (patch: Partial<PhotoText>) => void;
  showErrors: boolean;
  productItems: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="grid min-w-0 flex-1 gap-4 lg:grid-cols-2">
      <TextField
        id={`${id}-caption`}
        label="Caption"
        value={text.caption}
        maxLength={120}
        placeholder="e.g. Gold sequins for the evening"
        error={showErrors && !text.caption.trim() ? "Add a caption." : undefined}
        disabled={disabled}
        onChange={(e) => onChange({ caption: e.target.value })}
      />
      <ProductSelect
        id={`${id}-product`}
        value={text.productSlug || NO_PRODUCT}
        items={productItems}
        disabled={disabled}
        onChange={(slug) => onChange({ productSlug: slug === NO_PRODUCT ? "" : slug })}
      />
      <TextField
        id={`${id}-alt`}
        label="Description"
        className="lg:col-span-2"
        value={text.altText}
        maxLength={300}
        placeholder="e.g. Woman in a gold and black sequin gown on stone steps"
        hint="What's in the photo, for people using screen readers."
        error={showErrors && !text.altText.trim() ? "Describe the photo." : undefined}
        disabled={disabled}
        onChange={(e) => onChange({ altText: e.target.value })}
      />
    </div>
  );
}

function ProductSelect({
  id,
  value,
  items,
  disabled,
  onChange,
}: {
  id: string;
  value: string;
  items: { value: string; label: string }[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        Links to product
        <span className="ml-1.5 font-normal text-muted-foreground">(optional)</span>
      </label>
      <Select
        items={items}
        value={value}
        disabled={disabled}
        onValueChange={(next) => onChange(typeof next === "string" ? next : NO_PRODUCT)}
      >
        <SelectTrigger
          id={id}
          className={cn(
            "h-12 w-full rounded-md bg-surface px-4 text-[0.9375rem] data-[size=default]:h-12",
            "hover:border-foreground/40 focus-visible:border-primary focus-visible:ring-primary/15",
          )}
        >
          <SelectValue placeholder="No link" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className="max-h-80">
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value} className="py-2 pl-2.5">
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
      className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30"
    >
      {children}
    </button>
  );
}
