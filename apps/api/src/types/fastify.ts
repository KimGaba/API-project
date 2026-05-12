import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    apiAuth?: {
      source: 'db' | 'env';
      customerId: string | null;
      apiKeyId: string | null;
      keyPrefix: string | null;
      usageCategory: 'search' | 'lookup' | 'changes' | 'other';
      usageLogged?: boolean;
    };
    authSession?: {
      id: string;
      userId: string;
      customerId: string | null;
      sessionTokenHash: string;
      expiresAt: string;
      lastSeenAt: string;
    } | null;
    currentUser?: {
      id: string;
      email: string;
      displayName: string | null;
      avatarUrl: string | null;
      emailVerified: boolean;
      status: string;
      lastLoginAt: string | null;
      createdAt: string;
    } | null;
    requestStartMs?: number;
  }
}

export {};
