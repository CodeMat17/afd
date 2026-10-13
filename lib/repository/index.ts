import "server-only";

import { mockRepository } from "@/lib/repository/mock";
import type { CatalogRepository } from "@/lib/repository/types";

/**
 * The active catalogue source. Swap for a Convex implementation in the
 * backend phase; nothing else needs to change.
 */
export const catalog: CatalogRepository = mockRepository;

export type { CatalogRepository } from "@/lib/repository/types";
