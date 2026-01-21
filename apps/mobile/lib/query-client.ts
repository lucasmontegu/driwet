// apps/native/lib/query-client.ts
import type { AppRouterClient } from '@driwet/api/routers/index';

import { env } from '@driwet/env/mobile';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { authClient } from '@/lib/auth-client';

// Query client with persistence-friendly defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// AsyncStorage persister for offline-first support
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'driwet-query-cache',
});

// oRPC link with auth cookie forwarding
const link = new RPCLink({
  url: `${env.EXPO_PUBLIC_SERVER_URL}/api/rpc`,
  headers() {
    const headers = new Map<string, string>();
    const cookies = authClient.getCookie();
    if (cookies) {
      headers.set('Cookie', cookies);
    }
    return Object.fromEntries(headers);
  },
});

// Type-safe oRPC client
export const apiClient: AppRouterClient = createORPCClient(link);

// TanStack Query utilities for oRPC (provides useQuery/useMutation hooks)
export const api = createTanstackQueryUtils(apiClient);
