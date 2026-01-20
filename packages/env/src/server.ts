import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    POLAR_ACCESS_TOKEN: z.string().min(1),
    POLAR_SUCCESS_URL: z.url(),
    POLAR_PRODUCT_ID: z.string().min(1),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    // Social auth providers
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    APPLE_CLIENT_ID: z.string().min(1),
    APPLE_CLIENT_SECRET: z.string().min(1),
    // Email
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().email().default("Advia <noreply@advia.app>"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
