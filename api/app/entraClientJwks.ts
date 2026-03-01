//  Entra ID: fetch OpenID config and JWKS, cache, resolve key by kid.

const OPENID_PATH =
  '/v2.0/.well-known/openid-configuration';

interface OpenIdConfig {
  jwks_uri?: string;
  issuer?: string;
}

let cachedJwks: { keys: JsonWebKey[] } | null = null;
let cachedJwksUri: string | null = null;

export async function fetchOpenIdConfig(
  tenantId: string,
): Promise<OpenIdConfig> {
  const url =
    `https://login.microsoftonline.com/${tenantId}${OPENID_PATH}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Entra OpenID config failed: ${res.status}`,
    );
  }
  return res.json() as Promise<OpenIdConfig>;
}

async function fetchJwksRaw(
  jwksUri: string,
): Promise<{ keys: JsonWebKey[] }> {
  const res = await fetch(jwksUri);
  if (!res.ok) {
    throw new Error(
      `Entra JWKS fetch failed: ${res.status}`,
    );
  }
  return res.json() as Promise<{ keys: JsonWebKey[] }>;
}

function setCachedJwks(
  uri: string,
  data: { keys: JsonWebKey[] },
): void {
  cachedJwksUri = uri;
  cachedJwks = data;
}

async function fetchJwks(
  jwksUri: string,
): Promise<{ keys: JsonWebKey[] }> {
  if (cachedJwksUri === jwksUri && cachedJwks != null) {
    return cachedJwks;
  }
  const data = await fetchJwksRaw(jwksUri);
  setCachedJwks(jwksUri, data);
  return data;
}

function findKeyByKid(
  keys: JsonWebKey[],
  kid: string,
): JsonWebKey | null {
  for (const k of keys) {
    if ((k as { kid?: string }).kid === kid) return k;
  }
  return null;
}

export async function fetchKeysForTenant(
  tenantId: string,
): Promise<JsonWebKey[]> {
  const config = await fetchOpenIdConfig(tenantId);
  if (!config.jwks_uri) {
    throw new Error('OpenID config missing jwks_uri');
  }
  const { keys } = await fetchJwks(config.jwks_uri);
  return keys;
}

export async function getJwkForKid(
  tenantId: string,
  kid: string,
): Promise<JsonWebKey> {
  const keys = await fetchKeysForTenant(tenantId);
  const jwk = findKeyByKid(keys, kid);
  if (!jwk) {
    throw new Error(`JWKS has no key for kid ${kid}`);
  }
  return jwk;
}
