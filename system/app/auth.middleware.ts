/**
 * Entra Bearer auth middleware: verify JWT and set entraClaims; else 401.
 */

import type { Context, Next } from "hono";
import { verifyEntraAccessToken } from "#shared/infra/auth/entra.ts";

const AUTH_HEADER = "Authorization";
const BEARER_PREFIX = "Bearer ";

function getBearerToken(c: Context): string | null {
  const auth = c.req.header(AUTH_HEADER);
  if (auth == null || !auth.startsWith(BEARER_PREFIX)) return null;
  return auth.slice(BEARER_PREFIX.length).trim();
}

// function-length-ignore
export async function requireEntraAuth(
  c: Context,
  next: Next,
): Promise<Response | void> {
  if (Deno.env.get("TEST_SKIP_ENTRA_AUTH") === "1") return next();
  const token = getBearerToken(c);
  if (!token) {
    return c.json({ error: "Missing or invalid Authorization" }, 401, {
      "WWW-Authenticate": "Bearer",
    });
  }
  const tenantId = Deno.env.get("ENTRA_TENANT_ID");
  const clientId = Deno.env.get("ENTRA_CLIENT_ID");
  const issuer = Deno.env.get("ENTRA_ISSUER");
  if (!tenantId || !clientId) {
    return c.json({ error: "Server auth not configured" }, 503);
  }
  try {
    const claims = await verifyEntraAccessToken(
      token,
      tenantId,
      clientId,
      issuer ?? undefined,
    );
    c.set("entraClaims", claims);
    return next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401, {
      "WWW-Authenticate": "Bearer",
    });
  }
}
