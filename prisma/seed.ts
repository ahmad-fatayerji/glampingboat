// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {
      name: "Test User",
      avatar: "https://via.placeholder.com/150", // or any default avatar URL
    },
    create: {
      email: "test@test.com",
      name: "Test User",
      avatar: "https://via.placeholder.com/150",
    },
  });

  console.log("Seeded user:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
