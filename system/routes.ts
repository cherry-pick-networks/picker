/**
 * Single source of route list for todo-check and main.ts registration.
 * Must match shared/prompt/to-do.md API surface table.
 */

import type { Hono } from "hono";
import { requireEntraAuth } from "#system/app/auth.middleware.ts";
import {
  registerAstAndScripts,
  registerRestHandlers,
} from "#system/app/routes-register.config.ts";

export const ROUTES: { method: string; path: string }[] = [
  { method: "GET", path: "/" },
  { method: "GET", path: "/identity/actors" },
  { method: "GET", path: "/identity/actors/:id" },
  { method: "POST", path: "/identity/actors" },
  { method: "PATCH", path: "/identity/actors/:id" },
  { method: "GET", path: "/scripts" },
  { method: "GET", path: "/scripts/:path*" },
  { method: "POST", path: "/scripts/:path*" },
  { method: "POST", path: "/script/mutate" },
  { method: "GET", path: "/sources" },
  { method: "GET", path: "/sources/:id" },
  { method: "POST", path: "/sources" },
  { method: "POST", path: "/sources/:id/extract" },
  { method: "GET", path: "/mirror/content/items/:id" },
  { method: "POST", path: "/mirror/content/items" },
  { method: "PATCH", path: "/mirror/content/items/:id" },
  { method: "GET", path: "/mirror/content/worksheets/:id" },
  { method: "POST", path: "/mirror/content/worksheets" },
  { method: "GET", path: "/mirror/lexis/entries" },
  { method: "GET", path: "/mirror/schedule/due" },
  { method: "GET", path: "/mirror/schedule/plan/weekly" },
  { method: "GET", path: "/mirror/schedule/plan/annual" },
  { method: "GET", path: "/mirror/schedule/items" },
  { method: "POST", path: "/mirror/schedule/items" },
  { method: "POST", path: "/mirror/schedule/items/:id/review" },
  { method: "GET", path: "/kv" },
  { method: "POST", path: "/kv" },
  { method: "GET", path: "/kv/:key" },
  { method: "DELETE", path: "/kv/:key" },
];

export function registerRoutes(app: Hono): void {
  app.use("*", (c, next) => {
    if (c.req.method === "GET" && c.req.path === "/") return next();
    return requireEntraAuth(c, next);
  });
  registerRestHandlers(app);
  registerAstAndScripts(app);
}
