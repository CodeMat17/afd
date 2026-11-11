import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Sign-in, sign-up, password reset, etc. The storefront forwards
// /api/auth/* here (app/api/auth/[...all]/route.ts).
authComponent.registerRoutes(http, createAuth);

export default http;
