/**
 * Allowlist data holder. Bootstrap sets loader; Source/Mirror use data only.
 */

import type { AllowlistData } from './allowlistTypes.ts';

let data: AllowlistData | null = null;
let loader: (() => Promise<AllowlistData>) | null = null;
let loadPromise: Promise<AllowlistData> | null = null;

export function setAllowlistData(d: AllowlistData): void {
  data = d;
}

export function getAllowlistData(): AllowlistData | null {
  return data;
}

export function setAllowlistLoader(fn: () => Promise<AllowlistData>): void {
  loader = fn;
}

export async function getAllowlistDataOrLoad(): Promise<AllowlistData> {
  if (data != null) return data;
  if (loader == null) {
    throw new Error('Allowlist loader not registered');
  }
  if (loadPromise == null) loadPromise = loader();
  data = await loadPromise;
  return data;
}
