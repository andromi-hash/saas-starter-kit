import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashed,
      name: "Admin User",
    },
  });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      plan: "pro",
      status: "active",
    },
  });

  console.log("Seeded:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
