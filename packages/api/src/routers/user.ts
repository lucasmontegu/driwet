import { z } from 'zod';
import { protectedProcedure } from '../index';
import { db } from '@advia/db';
import { user } from '@advia/db/schema/auth';
import { tripHistory } from '@advia/db/schema/routes';
import { eq, sql } from 'drizzle-orm';

export const userRouter = {
  getProfile: protectedProcedure.handler(async ({ context }) => {
    const userData = await db.query.user.findFirst({
      where: eq(user.id, context.session.user.id),
    });
    return userData;
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        theme: z.enum(['light', 'dark', 'auto']).optional(),
        language: z.enum(['en', 'es']).optional(),
        notificationsEnabled: z.boolean().optional(),
      })
    )
    .handler(async () => {
      // TODO: Add settings columns to user table or create separate settings table
      return { success: true };
    }),

  getStats: protectedProcedure.handler(async ({ context }) => {
    // Calculate real stats from trip history
    const stats = await db
      .select({
        stormsAvoided: sql<number>`coalesce(sum(${tripHistory.alertsAvoidedCount}), 0)`.as('storms_avoided'),
        moneySaved: sql<number>`coalesce(sum(cast(${tripHistory.estimatedSavings} as numeric)), 0)`.as('money_saved'),
        kmTraveled: sql<number>`coalesce(sum(cast(${tripHistory.distanceKm} as numeric)), 0)`.as('km_traveled'),
      })
      .from(tripHistory)
      .where(eq(tripHistory.userId, context.session.user.id));

    const result = stats[0];

    return {
      stormsAvoided: Number(result?.stormsAvoided) || 0,
      moneySaved: Number(result?.moneySaved) || 0,
      kmTraveled: Number(result?.kmTraveled) || 0,
    };
  }),
};
