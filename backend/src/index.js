import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { subscriptionsRouter } from "./routes/subscriptions.js";
import { apiKeysRouter } from "./routes/api-keys.js";
import { webhookRouter } from "./routes/webhook.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(morgan("dev"));

// Raw body for Stripe webhooks
app.use("/api/webhook", express.raw({ type: "application/json" }), webhookRouter);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/keys", apiKeysRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`SaaS API running on http://localhost:${config.port}`);
});

export default app;
