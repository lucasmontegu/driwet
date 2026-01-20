import { protectedProcedure } from '../index';
import { polarClient } from '@advia/auth/lib/payments';

export const subscriptionRouter = {
  getStatus: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;

    try {
      // Get customer by user metadata (email)
      const customers = await polarClient.customers.list({
        email: context.session.user.email,
        limit: 1,
      });

      if (!customers.result.items.length) {
        return {
          isActive: false,
          plan: null,
          expiresAt: null,
          customerId: null,
        };
      }

      const customer = customers.result.items[0];

      // Get active subscriptions for this customer
      const subscriptions = await polarClient.subscriptions.list({
        customerId: customer.id,
        active: true,
        limit: 1,
      });

      if (!subscriptions.result.items.length) {
        return {
          isActive: false,
          plan: null,
          expiresAt: null,
          customerId: customer.id,
        };
      }

      const subscription = subscriptions.result.items[0];

      // Determine plan type based on recurring interval
      const plan = subscription.recurringInterval === 'year' ? 'yearly' : 'monthly';

      return {
        isActive: true,
        plan,
        expiresAt: subscription.currentPeriodEnd,
        customerId: customer.id,
        subscriptionId: subscription.id,
      };
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return {
        isActive: false,
        plan: null,
        expiresAt: null,
        customerId: null,
      };
    }
  }),
};
