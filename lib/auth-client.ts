import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** Browser-side customer auth. Requests go to /api/auth/* on this site. */
export const authClient = createAuthClient({
  plugins: [convexClient()],
});
