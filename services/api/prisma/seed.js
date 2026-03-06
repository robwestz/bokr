import { PrismaClient, Role, MenuType } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
    const email = "admin@example.com";
    const passwordHash = await bcrypt.hash("Admin123!", 10);
    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, passwordHash },
    });
    await prisma.membership.create({
        data: { userId: user.id, role: Role.SUPERADMIN }
    });
    const restaurant = await prisma.restaurant.upsert({
        where: { slug: "demo-restaurant" },
        update: {},
        create: { name: "Demo Restaurant", slug: "demo-restaurant", timezone: "Indian/Maldives" },
    });
    await prisma.membership.create({
        data: { userId: user.id, role: Role.RESTAURANT_ADMIN, restaurantId: restaurant.id }
    });
    await prisma.menu.upsert({
        where: { restaurantId_type: { restaurantId: restaurant.id, type: MenuType.MAIN } },
        update: { content: "Welcome! Paste your menu here.", isPublished: true },
        create: { restaurantId: restaurant.id, type: MenuType.MAIN, content: "Welcome! Paste your menu here.", isPublished: true },
    });
    console.log("[seed] done");
}
main().finally(() => prisma.$disconnect());
