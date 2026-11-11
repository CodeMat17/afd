import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";

const app = defineApp();
// Customer accounts (Better Auth). Its tables live in their own component,
// separate from the shop's tables in schema.ts.
app.use(betterAuth);

export default app;
