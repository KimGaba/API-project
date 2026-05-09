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
    requestStartMs?: number;
  }
}

export {};
