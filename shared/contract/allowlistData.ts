/**
 * Allowlist data holder. Bootstrap sets loader; Source/Mirror use data only.
 */

import type { AllowlistData } from './allowlistTypes.ts';

let data: AllowlistData | null = null;
let loader: (() => Promise<AllowlistData>) | null = null;
let loadPromise: Promise<AllowlistData> | null = null;

export function setAllowlistData(d: AllowlistData): void {
  data = d;
  return;
}

export function getAllowlistData(): AllowlistData | null {
  const out = data;
  return out;
}

export function setAllowlistLoader(fn: () => Promise<AllowlistData>): void {
  loader = fn;
  return;
}

async function ensureAllowlistLoaded(): Promise<AllowlistData> {
  if (loader == null) throw new Error('Allowlist loader not registered');
  if (loadPromise == null) loadPromise = loader();
  data = await loadPromise;
  return data;
}

export async function getAllowlistDataOrLoad(): Promise<AllowlistData> {
  if (data != null) return data;
  return await ensureAllowlistLoaded();
}
