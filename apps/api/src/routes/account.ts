import type { FastifyInstance } from 'fastify';
import { requireSession } from '../middleware/require-session.js';
import { getCustomerByUserId } from '../services/customer-service.js';
import { getActiveSubscription } from '../services/subscription-service.js';
import { billingPlans } from '../config/billing.js';

export async function accountRoutes(app: FastifyInstance) {
  app.get('/v1/account', { preHandler: requireSession }, async (request, reply) => {
    const customer = await getCustomerByUserId(request.currentUser!.id);
    if (!customer) {
      return reply.code(404).send({ error: 'NO_CUSTOMER', message: 'No customer account found.' });
    }

    const subscription = await getActiveSubscription(customer.id);
    const plan = billingPlans.find(p => p.code === (subscription ? subscription.planName : customer.defaultPlan ?? 'free'))
      ?? billingPlans.find(p => p.code === 'free')
      ?? null;

    return reply.send({
      data: {
        customer: {
          id: customer.id,
          email: customer.email,
          displayName: customer.name,
          defaultPlan: customer.defaultPlan,
        },
        subscription: subscription
          ? {
              id: subscription.id,
              planName: subscription.planName,
              status: subscription.status,
              monthlyQuota: subscription.monthlyQuota,
              rpmLimit: subscription.rpmLimit,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
              billingPeriodStart: subscription.billingPeriodStart,
              billingPeriodEnd: subscription.billingPeriodEnd,
            }
          : null,
        plan,
      },
    });
  });
}
