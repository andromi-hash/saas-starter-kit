import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, name } = signupSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email in use" });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });

    await prisma.subscription.create({
      data: { userId: user.id, plan: "free", status: "active" },
    });

    const token = generateToken({ id: user.id, email: user.email });
    res.status(201).json({ token, user: { id: user.id, email, name } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.flatten() });
    }
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email, name: user.name } });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { subscription: true },
      select: { id: true, email: true, name: true, subscription: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export { router as authRouter };
