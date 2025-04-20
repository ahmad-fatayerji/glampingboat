// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1) Upsert a test user
  const user = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {
      name: "Test User",
      avatar: "https://via.placeholder.com/150",
    },
    create: {
      email: "test@test.com",
      name: "Test User",
      avatar: "https://via.placeholder.com/150",
    },
  });
  console.log("Seeded user:", user.email);

  // Upsert the available options
  const options = [
    {
      name: "Linge de lit (Housses, couette et oreiller)",
      priceHt: 12.5,
      description: "Prix par personne",
    },
    {
      name: "Barre support + hamac pont arrière",
      priceHt: 20.0,
      description: "Location hamac sur pont",
    },
    {
      name: "Barre support vélo pont arrière",
      priceHt: 12.5,
      description: "Emplacement porte-vélo",
    },
    {
      name: "Frais de nettoyage",
      priceHt: 75.0,
      description: "Nettoyage final du bateau",
    },
  ] as const;

  for (const opt of options) {
    const rec = await prisma.option.upsert({
      where: { name: opt.name },
      update: {
        priceHt: opt.priceHt,
        description: opt.description,
      },
      create: {
        name: opt.name,
        priceHt: opt.priceHt,
        description: opt.description,
      },
    });
    console.log("Seeded option:", rec.name);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
