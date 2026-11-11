"use client";

import { useEffect } from "react";
import { cartActions } from "@/lib/cart/store";

/** Empties the cart in Convex once the server has confirmed payment. */
export function ClearCart() {
  useEffect(() => cartActions.clear(), []);
  return null;
}
