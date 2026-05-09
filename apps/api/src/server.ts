import { env } from './config/env.js';
import { buildApp } from './app.js';

const app = await buildApp();

try {
  await app.listen({
    host: env.HOST,
    port: env.PORT
  });
} catch (error) {
  app.log.error(error, 'Failed to start server');
  process.exit(1);
}
