export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  jwtExpiresIn: "7d",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "sk_test_...",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_...",
  plans: {
    free: { priceId: null, name: "Free" },
    pro: { priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro", name: "Pro" },
    enterprise: { priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise", name: "Enterprise" },
  },
};
