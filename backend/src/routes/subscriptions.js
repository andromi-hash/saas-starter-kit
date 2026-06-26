import { Router } from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { config } from "../config.js";

const stripe = new Stripe(config.stripeSecretKey);
const prisma = new PrismaClient();
const router = Router();

router.get("/plans", (req, res) => {
  res.json(config.plans);
});

router.get("/current", authenticate, async (req, res, next) => {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    });
    res.json(sub);
  } catch (err) {
    next(err);
  }
});

router.post("/create-checkout", authenticate, async (req, res, next) => {
  try {
    const { priceId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: user.stripeId || undefined,
      client_reference_id: user.id.toString(),
      success_url: `${config.frontendUrl}/billing?success=true`,
      cancel_url: `${config.frontendUrl}/billing?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

router.post("/create-portal", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user.stripeId) {
      return res.status(400).json({ error: "No Stripe customer ID" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeId,
      return_url: `${config.frontendUrl}/billing`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

export { router as subscriptionsRouter };
