import { Router } from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.user.id },
      select: { id: true, name: true, key: true, lastUsed: true, createdAt: true },
    });
    res.json(keys);
  } catch (err) {
    next(err);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { name } = req.body;
    const key = `sk_${crypto.randomBytes(32).toString("hex")}`;

    const apiKey = await prisma.apiKey.create({
      data: { key, name: name || "Untitled", userId: req.user.id },
    });

    res.status(201).json({ id: apiKey.id, name: apiKey.name, key: apiKey.key });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    await prisma.apiKey.deleteMany({
      where: { id: parseInt(req.params.id, 10), userId: req.user.id },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export { router as apiKeysRouter };
