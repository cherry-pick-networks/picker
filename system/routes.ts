/**
 * Single source of route list for scope-check and main.ts registration.
 * Must match shared/prompt/boundary.md API surface table.
 */

import type { Hono } from "hono";
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
  { method: "POST", path: "/content/worksheets/generate" },
  { method: "POST", path: "/content/worksheets/build-prompt" },
  { method: "GET", path: "/sources" },
  { method: "GET", path: "/sources/:id" },
  { method: "POST", path: "/sources" },
  { method: "GET", path: "/data/extracted-index" },
  { method: "GET", path: "/data/identity-index" },
  { method: "GET", path: "/data/extracted/:id" },
  { method: "GET", path: "/data/identity/:id" },
  { method: "GET", path: "/ast" },
  { method: "GET", path: "/ast-demo" },
  { method: "POST", path: "/ast/apply" },
  { method: "GET", path: "/scripts" },
  { method: "GET", path: "/scripts/:path*" },
  { method: "POST", path: "/scripts/:path*" },
];

export function registerRoutes(app: Hono): void {
  registerRestHandlers(app);
  registerAstAndScripts(app);
}
