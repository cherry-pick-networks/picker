//
// Entra Bearer auth middleware: verify JWT and set entraClaims; else 401.
//

import type { Context, Next } from 'hono';
import { verifyEntraAccessToken } from '#api/app/entraClient.ts';

const AUTH_HEADER = 'Authorization';
const BEARER_PREFIX = 'Bearer ';

function getBearerToken(c: Context): string | null {
  const auth = c.req.header(AUTH_HEADER);
  if (auth == null || !auth.startsWith(BEARER_PREFIX)) {
    return null;
  }
  return auth.slice(BEARER_PREFIX.length).trim();
}

function unauthResponse(c: Context): Response {
  return c.json(
    { error: 'Missing or invalid Authorization' },
    401,
    { 'WWW-Authenticate': 'Bearer' },
  );
}

async function verifyAndNext(
  c: Context,
  next: Next,
  token: string,
  tenantId: string,
  clientId: string,
  issuer: string | undefined,
): Promise<Response | void> {
  try {
    const claims = await verifyEntraAccessToken(
      token,
      tenantId,
      clientId,
      issuer,
    );
    c.set('entraClaims', claims);
    return next();
  } catch {
    return c.json(
      { error: 'Invalid or expired token' },
      401,
      { 'WWW-Authenticate': 'Bearer' },
    );
  }
}

function getEntraEnv(): {
  tenantId: string;
  clientId: string;
  issuer: string | undefined;
} {
  const tenantId = Deno.env.get('ENTRA_TENANT_ID');
  const clientId = Deno.env.get('ENTRA_CLIENT_ID');
  const issuer = Deno.env.get('ENTRA_ISSUER');
  return {
    tenantId: tenantId ?? '',
    clientId: clientId ?? '',
    issuer: issuer ?? undefined,
  };
}

async function doEntraVerify(
  c: Context,
  next: Next,
  token: string,
): Promise<Response | void> {
  const { tenantId, clientId, issuer } = getEntraEnv();
  if (!tenantId || !clientId) {
    return c.json(
      { error: 'Server auth not configured' },
      503,
    );
  }
  return await verifyAndNext(
    c,
    next,
    token,
    tenantId,
    clientId,
    issuer,
  );
}

export async function requireEntraAuth(
  c: Context,
  next: Next,
): Promise<Response | void> {
  if (Deno.env.get('TEST_SKIP_ENTRA_AUTH') === '1') {
    return next();
  }
  const token = getBearerToken(c);
  if (!token) return unauthResponse(c);
  return await doEntraVerify(c, next, token);
}
