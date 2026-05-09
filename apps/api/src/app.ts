import Fastify from 'fastify';
import { env } from './config/env.js';
import { registerBasePlugins } from './plugins/register-base.js';
import { registerRoutes } from './routes/index.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL
    }
  });

  await registerBasePlugins(app);
  await registerRoutes(app);

  return app;
}
