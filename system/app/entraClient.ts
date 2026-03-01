//
// Entra ID (Azure AD) OAuth 2.0 access token verification.
// Fetches JWKS from OpenID discovery, verifies signature and aud/exp/iss.
//

import { decode, verify } from 'djwt';
import { getJwkForKid } from './entraClientJwks.ts';

export interface EntraClaims {
  aud?: string | string[];
  exp?: number;
  iss?: string;
  sub?: string;
  [k: string]: unknown;
}

async function importJwkToVerifyKey(
  jwk: JsonWebKey,
): Promise<CryptoKey> {
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  return key;
}

function getKidFromHeader(token: string): string {
  const [header] = decode(token);
  const kid = (header as { kid?: string }).kid;
  if (!kid) throw new Error('JWT header missing kid');
  return kid;
}

async function loadKeyAndVerify(
  token: string,
  kid: string,
  tenantId: string,
  clientId: string,
): Promise<Record<string, unknown>> {
  const jwk = await getJwkForKid(tenantId, kid);
  const key = await importJwkToVerifyKey(jwk);
  const payload = await verify(token, key, {
    audience: clientId,
  });
  return payload as Record<string, unknown>;
}

function assertIssuer(
  payload: Record<string, unknown>,
  tenantId: string,
  issuer?: string,
): void {
  const expected = issuer ??
    `https://login.microsoftonline.com/${tenantId}/v2.0`;
  if (payload.iss !== expected) {
    throw new Error(
      'JWT iss claim does not match expected issuer',
    );
  }
}

export async function verifyEntraAccessToken(
  token: string,
  tenantId: string,
  clientId: string,
  issuer?: string,
): Promise<EntraClaims> {
  const kid = getKidFromHeader(token);
  const payload = await loadKeyAndVerify(
    token,
    kid,
    tenantId,
    clientId,
  );
  assertIssuer(payload, tenantId, issuer);
  return payload as EntraClaims;
}
