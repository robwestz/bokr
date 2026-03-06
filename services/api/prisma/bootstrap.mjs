import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@example.com";
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "Admin123!";

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  // SUPERADMIN membership
  // Note: role enum exists in DB. Use raw string.
  const existing = await prisma.membership.findFirst({ where: { userId: user.id, role: "SUPERADMIN" } });
  if (!existing) {
    await prisma.membership.create({ data: { userId: user.id, role: "SUPERADMIN" } });
  }

  console.log("[bootstrap] superadmin ready:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
