import { db } from "@advia/db";
import * as schema from "@advia/db/schema/auth";
import { env } from "@advia/env/server";
import { expo } from "@better-auth/expo";
import { magicLink } from "better-auth/plugins";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { polarClient } from "./lib/payments";
import { sendMagicLinkEmail } from "./lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN, "advia://", "exp://"],
  emailAndPassword: {
    enabled: false,
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
    magicLink({
      sendMagicLink: async ({ email, url, token }) => {
        // Check if the callback URL indicates a native app request
        const parsedUrl = new URL(url);
        const callbackURL = parsedUrl.searchParams.get("callbackURL") || "";
        const isNativeApp = callbackURL.startsWith("/(app)") || callbackURL.includes("advia://");

        // For native apps, create a deep link URL
        let finalUrl = url;
        if (isNativeApp) {
          // Replace the web callback with the native deep link
          // The native app will handle advia://auth/magic-link?token=...
          const nativeDeepLink = `advia://auth/magic-link?token=${token}`;
          finalUrl = nativeDeepLink;
        }

        await sendMagicLinkEmail({
          email,
          url: finalUrl,
          isNativeApp,
        });
      },
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: false,
      enableCustomerPortal: true,
      use: [
        checkout({
          products: [
            {
              productId: env.POLAR_MONTHLY_PRODUCT_ID,
              slug: "monthly",
            },
            {
              productId: env.POLAR_YEARLY_PRODUCT_ID,
              slug: "yearly",
            },
          ],
          successUrl: "advia://subscription/success",
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
    nextCookies(),
    expo(),
  ],
});
