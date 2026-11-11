import { handler } from "@/lib/auth-server";

// Forwards customer-account requests to Convex (see convex/http.ts).
export const { GET, POST } = handler;
