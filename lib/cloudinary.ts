import "server-only";

import { createHash } from "node:crypto";

/**
 * Cloudinary holds every catalogue photo; Convex stores only the reference
 * (public ID, URL, dimensions). The API secret stays on the server: the
 * browser uploads straight to Cloudinary with a short-lived signature.
 */

export const PRODUCT_FOLDER = "afd/products";
/** Home page hero photos, uploaded from /admin/hero. */
export const HERO_FOLDER = "afd/hero";

/** Applied on upload so phone-camera originals aren't stored at full size. */
const INCOMING_TRANSFORMATION = "c_limit,w_2400,h_2400";

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
  );
}

function config(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set.");
  }
  return { cloudName, apiKey, apiSecret };
}

/** Cloudinary's request signature: sorted `k=v` pairs + secret, SHA-1. */
function sign(params: Record<string, string>, apiSecret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(payload + apiSecret).digest("hex");
}

export interface UploadSignature {
  uploadUrl: string;
  /** Every field to send alongside `file` in the multipart upload. */
  fields: Record<string, string>;
}

/** A signature valid for one hour, restricted to one folder (products by default). */
export function createUploadSignature(folder: string = PRODUCT_FOLDER): UploadSignature {
  const { cloudName, apiKey, apiSecret } = config();
  const params = {
    folder,
    timestamp: String(Math.floor(Date.now() / 1000)),
    transformation: INCOMING_TRANSFORMATION,
  };
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    fields: { ...params, api_key: apiKey, signature: sign(params, apiSecret) },
  };
}

/** True for delivery URLs of images in this account (rejects forged form input). */
export function isOwnImage(publicId: string, url: string): boolean {
  const { cloudName } = config();
  return (
    /^[\w\-/]{1,255}$/.test(publicId) &&
    url.startsWith(`https://res.cloudinary.com/${cloudName}/image/upload/`) &&
    url.includes(`/${publicId}.`)
  );
}

/**
 * Remove images from Cloudinary (and purge them from its CDN). A failure
 * leaves an unused file behind rather than breaking the caller, so it's
 * logged and reported through the return value instead of thrown.
 * Returns true when every image is gone (or there was nothing to delete).
 */
export async function deleteImages(publicIds: string[]): Promise<boolean> {
  const ids = [...new Set(publicIds)];
  if (ids.length === 0) return true;
  if (!isCloudinaryConfigured()) {
    console.error("[cloudinary] not configured; left behind", ids);
    return false;
  }
  const { cloudName, apiKey, apiSecret } = config();
  const auth = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
  let ok = true;
  // The Admin API takes up to 100 public IDs per call.
  for (let start = 0; start < ids.length; start += 100) {
    const batch = ids.slice(start, start + 100);
    const query = new URLSearchParams({ invalidate: "true" });
    for (const id of batch) query.append("public_ids[]", id);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?${query}`, {
        method: "DELETE",
        headers: { Authorization: auth },
      });
      if (!response.ok) {
        console.error("[cloudinary] delete failed", response.status, await response.text());
        ok = false;
        continue;
      }
      // { deleted: { "<id>": "deleted" | "not_found" } } — already gone counts as success.
      const body = (await response.json().catch(() => ({}))) as { deleted?: Record<string, string> };
      const failed = batch.filter((id) => {
        const outcome = body.deleted?.[id];
        return outcome !== undefined && outcome !== "deleted" && outcome !== "not_found";
      });
      if (failed.length > 0) {
        console.error("[cloudinary] some images were not deleted", failed, body.deleted);
        ok = false;
      }
    } catch (error) {
      console.error("[cloudinary] delete failed", error);
      ok = false;
    }
  }
  return ok;
}
