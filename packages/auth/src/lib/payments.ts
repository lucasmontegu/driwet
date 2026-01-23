import { env } from "@driwet/env/server";
import { Polar } from "@polar-sh/sdk";

// Check if Polar is configured
export const isPolarConfigured = !!(
  env.POLAR_ACCESS_TOKEN &&
  env.POLAR_MONTHLY_PRODUCT_ID &&
  env.POLAR_YEARLY_PRODUCT_ID
);

// Lazy initialization to avoid errors when POLAR_ACCESS_TOKEN is not set
let _polarClient: Polar | null = null;

export function getPolarClient(): Polar {
  if (!env.POLAR_ACCESS_TOKEN) {
    throw new Error("POLAR_ACCESS_TOKEN is not configured");
  }
  if (!_polarClient) {
    _polarClient = new Polar({
      accessToken: env.POLAR_ACCESS_TOKEN,
      server: "sandbox",
    });
  }
  return _polarClient;
}

// For better-auth polar plugin (only create if configured)
export const polarClient = isPolarConfigured
  ? new Polar({
      accessToken: env.POLAR_ACCESS_TOKEN!,
      server: "sandbox",
    })
  : (null as unknown as Polar);
