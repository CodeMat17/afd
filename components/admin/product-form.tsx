"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Fragment,
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { FormAlert } from "@/components/forms/form-alert";
import { TextAreaField, TextField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUploadSignature, saveProduct, type ProductFormState } from "@/app/admin/(dashboard)/products/actions";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { fieldRules, SIZE_LABELS } from "@/lib/admin/product-fields";
import { scrollToTop } from "@/lib/scroll";
import { cn } from "@/lib/utils";

export interface AdminImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  altText: string;
}

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  price: string;
  description: string;
  colours: string;
  stockQuantity: string;
  material: string;
  pieceLength: string;
  care: string;
  patternNotes: string;
  bust: string;
  waist: string;
  chest: string;
  trouser: string;
  shoulder: string;
  sleeve: string;
  topLength: string;
  hips: string;
  dressLength: string;
  isAvailable: boolean;
  isFeatured: boolean;
  images: AdminImage[];
}

export interface CategoryOption {
  department: string;
  departmentSlug: string;
  /** `nextSku` is what a new product in that category would be assigned. */
  categories: { id: string; name: string; slug: string; nextSku: string }[];
}

const MAX_IMAGES = 12;

const readOnlyClass =
  "[&_input]:cursor-default [&_input]:bg-muted [&_input]:font-mono [&_input]:tracking-wide [&_input]:hover:border-input";
const MAX_BYTES = 10 * 1024 * 1024;

export function ProductForm({
  values,
  categoryOptions,
  notice,
}: {
  values: ProductFormValues;
  categoryOptions: CategoryOption[];
  notice?: string;
}) {
  const isNew = !values.id;
  const router = useRouter();
  const [images, setImages] = useState<AdminImage[]>(values.images);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(values.categoryId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ProductFormState, FormData>(async (prev, formData) => {
    const result = await saveProduct(prev, formData);
    setErrors(result?.errors ?? {});
    if (result?.ok) {
      toast.success(result.created ? "Product created" : "Saved", { description: result.message });
      // An updated product returns to the list. Navigating here, not in an
      // effect, matters: the save refreshes this page, and a changed stock
      // level remounts the form, which would drop the result before an
      // effect could see it.
      if (!isNew) {
        router.push("/admin/products");
        return result;
      }
    } else if (result) {
      toast.error("Not saved", { description: result.message, duration: 7000 });
    }
    // Only a newly created product clears the form, ready for the next one.
    if (result?.created) {
      formRef.current?.reset();
      setImages([]);
      setCategoryId("");
      setUploadError(null);
    }
    return result;
  }, null);

  // Submitting through onSubmit (not <form action>) stops React from resetting
  // the inputs after every submit, so a rejected form keeps what was typed.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  }

  // After creating a product, go back to the top of the cleared form; after a
  // rejected save, go to the first field to fix. (Updates navigate away above.)
  useEffect(() => {
    if (!state || !formRef.current) return;
    if (state.ok) {
      if (isNew) scrollToTop();
      return;
    }
    const first = formRef.current.querySelector<HTMLElement>("[aria-invalid='true'], [data-invalid]");
    if (first) {
      first.scrollIntoView({ behavior: "smooth", block: "center" });
      first.focus({ preventScroll: true });
    }
  }, [state, isNew]);

  // Editing a field clears its error message.
  function clearError(name: string) {
    if (!errors[name]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }
  const group = categoryOptions.find((g) => g.categories.some((c) => c.id === categoryId));
  const category = group?.categories.find((c) => c.id === categoryId);
  const rules = group && category ? fieldRules(group.departmentSlug, category.slug) : null;
  const isFabric = group?.departmentSlug === "fabrics";
  const skuShown = isNew ? (category?.nextSku ?? "") : values.sku;
  const shown = state ?? (notice ? { ok: true, message: notice } : null);
  const alert = shown ? (
    <FormAlert
      tone={shown.ok ? "info" : "error"}
      title={state?.created ? "Product created" : shown.ok ? "Saved" : "Not saved"}
    >
      {shown.message}
      {state?.created ? (
        <>
          {" "}
          <a href={`/admin/products/${state.created.id}`} className="underline">
            Edit it
          </a>{" "}
          or{" "}
          <a href={`/products/${state.created.slug}`} target="_blank" rel="noreferrer" className="underline">
            view it
          </a>
          .
        </>
      ) : null}
    </FormAlert>
  ) : null;

  async function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length === 0) return;
    setUploadError(null);

    const room = MAX_IMAGES - images.length;
    const accepted = files.filter((f) => f.type.startsWith("image/") && f.size <= MAX_BYTES).slice(0, room);
    if (accepted.length < files.length) {
      setUploadError(`Some files were skipped: photos must be images under 10 MB, up to ${MAX_IMAGES} per product.`);
    }
    if (accepted.length === 0) return;

    const signature = await getUploadSignature();
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
            {
              publicId: result.public_id,
              url: result.secure_url,
              width: result.width,
              height: result.height,
              altText: "",
            },
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

  return (
    <div className="space-y-10">
      <form
        ref={formRef}
        onSubmit={onSubmit}
        onInput={(e) => clearError((e.target as HTMLInputElement).name)}
        className="space-y-8"
      >
        {/* Success shows at the top, where the page scrolls to after a save;
            errors stay by the submit button, next to the marked fields. */}
        {shown?.ok ? alert : null}
        {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
        <input type="hidden" name="images" value={JSON.stringify(images)} />

        <section className="space-y-4">
          <h2 className="font-heading text-2xl">Photos</h2>
          <p className="text-sm text-muted-foreground">
            Uploaded to Cloudinary. The first photo is the main one; use the arrows to reorder.
          </p>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <li key={image.publicId} className="space-y-2 rounded-xl border p-2">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                  <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />
                  {index === 0 ? (
                    <span className="absolute top-2 left-2 rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-ink-foreground">
                      Main
                    </span>
                  ) : null}
                </div>
                <label className="sr-only" htmlFor={`alt-${index}`}>
                  Description of photo {index + 1}
                </label>
                <input
                  id={`alt-${index}`}
                  value={image.altText}
                  placeholder="Describe the photo"
                  onChange={(e) =>
                    setImages((current) =>
                      current.map((img, i) => (i === index ? { ...img, altText: e.target.value } : img)),
                    )
                  }
                  className="h-9 w-full rounded-md border border-input bg-surface px-2 text-xs"
                />
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
                <label className="flex aspect-[3/4] h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground">
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
          {errors.images ? (
            <p tabIndex={-1} data-invalid="" role="alert" className="text-xs font-medium text-destructive">
              {errors.images}
            </p>
          ) : null}
        </section>

        <section className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <h2 className="font-heading text-2xl">Category</h2>
            <p className="text-sm text-muted-foreground">The category decides which details the product needs.</p>
          </div>
          <SelectField
            id="categoryId"
            label="Category"
            value={categoryId}
            onChange={(next) => {
              setCategoryId(next);
              clearError("categoryId");
            }}
            options={categoryOptions}
            error={errors.categoryId}
          />
          {/* No name attribute: the SKU is never submitted; the server assigns it. */}
          <TextField
            id="sku"
            name=""
            label="SKU"
            required={false}
            readOnly
            aria-readonly="true"
            tabIndex={-1}
            value={skuShown}
            placeholder={isNew ? "Choose a category first" : undefined}
            hint={
              isNew
                ? "Generated from the category when you save. Can't be edited."
                : "Assigned when the product was created. Can't be edited."
            }
            className={readOnlyClass}
          />
        </section>

        {rules ? (
          <>
            <section className="grid gap-5 sm:grid-cols-2">
              <h2 className="font-heading text-2xl sm:col-span-2">Details</h2>
              {/* The URL slug is derived from the name on the server; there's nothing to enter. */}
              <TextField id="name" error={errors.name} label="Name" defaultValue={values.name} className="sm:col-span-2" />
              {!isNew ? (
                <p className="-mt-3 text-xs text-muted-foreground sm:col-span-2">
                  Live at{" "}
                  <a href={`/products/${values.slug}`} target="_blank" rel="noreferrer" className="underline">
                    /products/{values.slug}
                  </a>
                  . Renaming keeps this link, so anything already shared still works.
                </p>
              ) : null}
              <TextField id="price" error={errors.price} label="Price (USD, per piece)" inputMode="decimal" defaultValue={values.price} />
              {/* The level this form was opened with, so a sale made meanwhile isn't overwritten. */}
              {!isNew ? <input type="hidden" name="stockExpected" value={values.stockQuantity} /> : null}
              <TextField
                id="stockQuantity"
                error={errors.stockQuantity}
                label="Pieces in stock"
                inputMode="numeric"
                pattern="\d*"
                autoComplete="off"
                defaultValue={values.stockQuantity}
                placeholder={isNew ? "e.g. 12" : "Count the shelf and enter the number"}
                onChange={() => clearError("stockQuantity")}
                hint={
                  !isNew && values.stockQuantity === ""
                    ? "Not counted yet. Enter how many pieces you have so the shop can tell when it sells out."
                    : "0 means sold out: customers can't order it. Paid online orders take pieces off automatically."
                }
              />
              <TextAreaField
                id="description"
                error={errors.description}
                label="Description"
                defaultValue={values.description}
                maxLength={2000}
                placeholder={
                  isFabric
                    ? "e.g. Bold gold blooms on a deep indigo ground. A crisp, medium-weight wax print that holds its shape, ideal for structured dresses, wrappers and head ties."
                    : "e.g. A flowing wrap dress in vibrant Ankara print, with a fitted waist and flutter sleeves. Perfect for weddings, parties and special occasions."
                }
                hint="Two or three sentences in your own words: what it looks like (colours, pattern), how it feels, and what it's good for. The opening sentence also appears in Google results and link previews, so make it count. Up to 2,000 characters."
                className="sm:col-span-2"
              />
              <TextField
                id="colours" error={errors.colours}
                label="Colours"
                defaultValue={values.colours}
                hint="Comma separated, e.g. Yellow, Royal blue, Black"
                className="sm:col-span-2"
              />
            </section>

            <section className="grid gap-5 sm:grid-cols-2">
              <h2 className="font-heading text-2xl sm:col-span-2">{isFabric ? "About the fabric" : "About the piece"}</h2>
              <TextField
                id="material" error={errors.material}
                label="Material"
                defaultValue={values.material}
                placeholder={isFabric ? "e.g. 100% cotton wax print" : "e.g. Cotton Ankara, lined"}
              />
              {rules.pieceLength ? (
                <TextField
                  id="pieceLength" error={errors.pieceLength}
                  label="Piece length"
                  defaultValue={values.pieceLength}
                  placeholder="e.g. 6 yards"
                  hint="How much fabric one piece is."
                />
              ) : null}
              <TextField
                id="care" error={errors.care}
                label="Care"
                defaultValue={values.care}
                placeholder="e.g. Hand wash cold, iron on reverse"
                className={rules.pieceLength ? "sm:col-span-2" : undefined}
              />
              <TextField
                id="patternNotes" error={errors.patternNotes}
                label={isFabric ? "Pattern notes" : "Notes"}
                optional
                defaultValue={values.patternNotes}
                placeholder={
                  isFabric ? "e.g. Border on both ends, all-over floral field" : "e.g. Comes with matching head tie"
                }
                hint="Shown as “Notes” on the product page."
                className="sm:col-span-2"
              />
            </section>

            {rules.sizes.length > 0 ? (
              <section className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                <div className="col-span-full space-y-1">
                  <h2 className="font-heading text-2xl">Garment sizes</h2>
                  <p className="text-sm text-muted-foreground">
                    Measurements of the finished garment, with units, e.g. “38 in” or “97 cm”.
                  </p>
                </div>
                {rules.sizes.map((key) => (
                  <TextField key={key} id={key} error={errors[key]} label={SIZE_LABELS[key]} defaultValue={values[key]} />
                ))}
              </section>
            ) : null}

            <section className="flex flex-wrap gap-6 text-sm font-semibold">
              <Checkbox name="isAvailable" label="Available to buy" defaultChecked={values.isAvailable} />
              <Checkbox name="isFeatured" label="Featured on the home page" defaultChecked={values.isFeatured} />
            </section>
          </>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Choose a category to fill in the rest of the product.
          </p>
        )}

        {shown && !shown.ok ? alert : null}
        <Button type="submit" size="lg" disabled={pending || uploading > 0 || !rules}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {values.id ? "Save changes" : "Create product"}
        </Button>
      </form>

      {values.id ? (
        <div className="space-y-3 border-t pt-8">
          <h2 className="font-heading text-2xl">Delete product</h2>
          <p className="text-sm text-muted-foreground">
            Removes it from the storefront and deletes its photos from Cloudinary. Past orders keep their details.
          </p>
          <DeleteProductButton id={values.id} name={values.name} redirectTo="/admin/products" />
        </div>
      ) : null}
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

function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  const id = useId();
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2">
      <input id={id} type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-primary" />
      {label}
    </label>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: CategoryOption[];
  error?: string;
}) {
  const items = options.flatMap((group) => group.categories.map((c) => ({ value: c.id, label: c.name })));
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <Select
        name={id}
        required
        items={items}
        value={value || null}
        onValueChange={(next) => onChange(typeof next === "string" ? next : "")}
      >
        <SelectTrigger
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-12 w-full rounded-md bg-surface px-4 text-[0.9375rem] data-[size=default]:h-12",
            "hover:border-foreground/40 focus-visible:border-primary focus-visible:ring-primary/15",
          )}
        >
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className="max-h-80">
          {options.map((group, index) => (
            <Fragment key={group.department}>
              {index > 0 ? <SelectSeparator /> : null}
              <SelectGroup>
                <SelectLabel>{group.department}</SelectLabel>
                {group.categories.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="py-2 pl-2.5">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </Fragment>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
