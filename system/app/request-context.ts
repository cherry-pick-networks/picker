/**
 * Request context: agent vs external. Sensitive data is only
 * returned when the request is treated as agent (internal).
 */

import type { Context } from "hono";

const HEADER_CLIENT = "X-Client";
const AGENT_VALUE = "agent";

function isAgentByHeader(c: Context): boolean {
  const header = c.req.header(HEADER_CLIENT);
  const envValue = Deno.env.get("AGENT_HEADER_VALUE");
  return header === AGENT_VALUE || (envValue != null && header === envValue);
}

/** True if request is from an agent (internal); then full PII is allowed. */
export function isAgentRequest(c: Context): boolean {
  if (isAgentByHeader(c)) return true;
  const key = Deno.env.get("INTERNAL_API_KEY");
  const auth = key != null ? c.req.header("Authorization") : null;
  return auth === `Bearer ${key}`;
}
