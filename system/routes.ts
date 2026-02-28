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
  { method: "GET", path: "/kv" },
  { method: "POST", path: "/kv" },
  { method: "GET", path: "/kv/:key" },
  { method: "DELETE", path: "/kv/:key" },
  { method: "GET", path: "/profile/:id" },
  { method: "POST", path: "/profile" },
  { method: "PATCH", path: "/profile/:id" },
  { method: "GET", path: "/progress/:id" },
  { method: "PATCH", path: "/progress/:id" },
  { method: "GET", path: "/content/items/:id" },
  { method: "POST", path: "/content/items" },
  { method: "PATCH", path: "/content/items/:id" },
  { method: "GET", path: "/content/worksheets/:id" },
  { method: "POST", path: "/content/worksheets" },
  { method: "POST", path: "/content/worksheets/build-prompt" },
  { method: "GET", path: "/sources" },
  { method: "GET", path: "/sources/:id" },
  { method: "POST", path: "/sources" },
  { method: "POST", path: "/sources/:id/extract" },
  { method: "GET", path: "/data/identity-index" },
  { method: "GET", path: "/data/identity/:id" },
  { method: "GET", path: "/schedule/due" },
  { method: "GET", path: "/schedule/plan/weekly" },
  { method: "GET", path: "/schedule/plan/annual" },
  { method: "GET", path: "/schedule/items" },
  { method: "POST", path: "/schedule/items" },
  { method: "POST", path: "/schedule/items/:id/review" },
  { method: "GET", path: "/lexis/entries" },
  { method: "GET", path: "/scripts" },
  { method: "GET", path: "/scripts/:path*" },
  { method: "POST", path: "/scripts/:path*" },
  { method: "POST", path: "/script/mutate" },
];

export function registerRoutes(app: Hono): void {
  app.use("*", (c, next) => {
    if (c.req.method === "GET" && c.req.path === "/") return next();
    return requireEntraAuth(c, next);
  });
  registerRestHandlers(app);
  registerAstAndScripts(app);
}
