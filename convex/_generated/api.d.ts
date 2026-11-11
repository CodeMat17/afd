/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as carts from "../carts.js";
import type * as catalog from "../catalog.js";
import type * as contact from "../contact.js";
import type * as gallery from "../gallery.js";
import type * as hero from "../hero.js";
import type * as lib_images from "../lib/images.js";
import type * as lib_serverAuth from "../lib/serverAuth.js";
import type * as lib_sku from "../lib/sku.js";
import type * as loginAttempts from "../loginAttempts.js";
import type * as orders from "../orders.js";
import type * as settings from "../settings.js";
import type * as stock from "../stock.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  carts: typeof carts;
  catalog: typeof catalog;
  contact: typeof contact;
  gallery: typeof gallery;
  hero: typeof hero;
  "lib/images": typeof lib_images;
  "lib/serverAuth": typeof lib_serverAuth;
  "lib/sku": typeof lib_sku;
  loginAttempts: typeof loginAttempts;
  orders: typeof orders;
  settings: typeof settings;
  stock: typeof stock;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
