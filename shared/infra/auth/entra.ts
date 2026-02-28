/**
 * Entra ID (Azure AD) OAuth 2.0 access token verification.
 * Fetches JWKS from OpenID discovery, verifies signature and aud/exp/iss.
 */

import { decode, verify } from 'djwt';

const OPENID_PATH = '/v2.0/.well-known/openid-configuration';

export interface EntraClaims {
  aud?: string | string[];
  exp?: number;
  iss?: string;
  sub?: string;
  [k: string]: unknown;
}

interface OpenIdConfig {
  jwks_uri?: string;
  issuer?: string;
}

let cachedJwks: { keys: JsonWebKey[] } | null = null;
let cachedJwksUri: string | null = null;

async function fetchOpenIdConfig(tenantId: string): Promise<OpenIdConfig> {
  const url = `https://login.microsoftonline.com/${tenantId}${OPENID_PATH}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Entra OpenID config failed: ${res.status}`);
  return res.json() as Promise<OpenIdConfig>;
}

async function fetchJwksRaw(jwksUri: string): Promise<{ keys: JsonWebKey[] }> {
  const res = await fetch(jwksUri);
  if (!res.ok) throw new Error(`Entra JWKS fetch failed: ${res.status}`);
  return res.json() as Promise<{ keys: JsonWebKey[] }>;
}

function setCachedJwks(uri: string, data: { keys: JsonWebKey[] }): void {
  cachedJwksUri = uri;
  cachedJwks = data;
}

async function fetchJwks(jwksUri: string): Promise<{ keys: JsonWebKey[] }> {
  if (cachedJwksUri === jwksUri && cachedJwks != null) return cachedJwks;
  const data = await fetchJwksRaw(jwksUri);
  setCachedJwks(jwksUri, data);
  return data;
}

function findKeyByKid(keys: JsonWebKey[], kid: string): JsonWebKey | null {
  for (const k of keys) {
    if ((k as { kid?: string }).kid === kid) return k;
  }
  return null;
}

async function importJwkToVerifyKey(jwk: JsonWebKey): Promise<CryptoKey> {
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  return key;
}

/** Verifies an Entra access token and returns claims. Throws on invalid. */
// function-length-ignore
export async function verifyEntraAccessToken(
  token: string,
  tenantId: string,
  clientId: string,
  issuer?: string,
): Promise<EntraClaims> {
  const [header] = decode(token);
  const kid = (header as { kid?: string }).kid;
  if (!kid) throw new Error('JWT header missing kid');

  const config = await fetchOpenIdConfig(tenantId);
  const jwksUri = config.jwks_uri;
  if (!jwksUri) throw new Error('OpenID config missing jwks_uri');

  const { keys } = await fetchJwks(jwksUri);
  const jwk = findKeyByKid(keys, kid);
  if (!jwk) throw new Error(`JWKS has no key for kid ${kid}`);

  const key = await importJwkToVerifyKey(jwk);
  const payload = await verify(token, key, {
    audience: clientId,
  });
  const expectedIssuer = issuer ??
    `https://login.microsoftonline.com/${tenantId}/v2.0`;
  if (payload.iss !== expectedIssuer) {
    throw new Error('JWT iss claim does not match expected issuer');
  }
  return payload as EntraClaims;
}
