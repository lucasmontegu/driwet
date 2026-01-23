import { db } from "@driwet/db";
import * as schema from "@driwet/db/schema/auth";
import { env } from "@driwet/env/server";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

// Initialize Polar SDK client
const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.NODE_ENV === "production" ? "production" : "sandbox",
});


export const auth = betterAuth({
  experimental: {
    joins: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
    usePlural: true,
  }),
  trustedOrigins: [env.CORS_ORIGIN, "driwet://", "exp://"],
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Refresh session expiry every day when used
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    apple: {
      clientId: env.APPLE_CLIENT_ID,
      clientSecret: env.APPLE_CLIENT_SECRET,
    },
  },
  plugins: [
    organization({
      teams: { enabled: true },
    }),
    nextCookies(),
    expo(),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      use: [
        checkout({
          products: [
            { productId: env.POLAR_MONTHLY_PRODUCT_ID, slug: "monthly" },
            { productId: env.POLAR_YEARLY_PRODUCT_ID, slug: "yearly" },
          ],
          successUrl: "driwet://subscription/success",
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
});

// Export polar client for direct API access
export { polarClient };
