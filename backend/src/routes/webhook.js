import { Router } from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { config } from "../config.js";

const stripe = new Stripe(config.stripeSecretKey);
const prisma = new PrismaClient();
const router = Router();

router.post("/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send("Webhook Error");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = parseInt(session.client_reference_id, 10);
        const subscriptionId = session.subscription;

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeSubId: subscriptionId,
            plan: "pro",
            status: "active",
          },
          create: {
            userId,
            stripeSubId: subscriptionId,
            plan: "pro",
            status: "active",
          },
        });

        if (session.customer) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeId: session.customer },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await prisma.subscription.updateMany({
          where: { stripeSubId: subscription.id },
          data: {
            status: subscription.status,
            plan: subscription.items.data[0]?.price?.lookup_key || "free",
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).send("Webhook handler error");
  }
});

export { router as webhookRouter };
