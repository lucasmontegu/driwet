import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/query-client';
import { useTrialStore } from '@/stores/trial-store';
import { authClient } from '@/lib/auth-client';

export function useSubscriptionStatus() {
  const { setPremium } = useTrialStore();

  const query = useQuery({
    ...api.subscription.getStatus.queryOptions(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Sync with trial store when subscription status changes
  useEffect(() => {
    if (query.data) {
      setPremium(query.data.isActive);
    }
  }, [query.data, setPremium]);

  return query;
}

export function useSubscriptionCheckout() {
  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    try {
      // Use better-auth's polar checkout
      // This will open the Polar checkout page in a web browser
      await authClient.subscription.checkout({
        slug: plan,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  };

  const handlePortal = async () => {
    try {
      // Open the customer portal to manage subscription
      await authClient.subscription.portal();
    } catch (error) {
      console.error('Portal error:', error);
      throw error;
    }
  };

  return {
    checkout: handleCheckout,
    portal: handlePortal,
  };
}

export function useIsPremium() {
  const { isPremium, isTrialActive, checkTrialStatus } = useTrialStore();
  const { data: subscription, isLoading } = useSubscriptionStatus();

  // Check trial status on mount
  useEffect(() => {
    checkTrialStatus();
  }, [checkTrialStatus]);

  // User has premium access if:
  // 1. They have an active subscription, OR
  // 2. They are in trial period
  const hasPremiumAccess = subscription?.isActive || isTrialActive || isPremium;

  return {
    isPremium: hasPremiumAccess,
    isSubscribed: subscription?.isActive ?? false,
    plan: subscription?.plan ?? null,
    isLoading,
  };
}
