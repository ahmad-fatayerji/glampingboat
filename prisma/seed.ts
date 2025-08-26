// command to seed the db : npx prisma db seed
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1) Upsert a test user (credentials demo)
  const testUser = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: { name: "Test User", avatar: "https://via.placeholder.com/150" },
    create: { email: "test@test.com", name: "Test User", avatar: "https://via.placeholder.com/150" },
  });
  console.log("Seeded user:", testUser.email);

  // 2) Upsert the Gmail user you sign in with via Google so we can attach a reservation
  const gmailEmail = "ahmad.fatayerji2004@gmail.com";
  const gmailUser = await prisma.user.upsert({
    where: { email: gmailEmail },
    update: { name: "Ahmad" },
    create: { email: gmailEmail, name: "Ahmad" },
  });
  console.log("Upserted gmail user:", gmailUser.email);

  // Upsert the available options
  const options = [
    {
      name: "Linge de lit (Housses, couette et oreiller)",
      priceHt: 12.5,
      description: "Prix par personne",
    },
    {
      name: "Barre support + hamac pont arrière",
      priceHt: 0.0,
      description: "Location hamac sur pont",
    },
    {
      name: "Barre support vélo pont arrière",
      priceHt: 0.0,
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

  // 3) Create a sample reservation for the gmail user (only if none exists yet)
  const existing = await prisma.reservation.findFirst({ where: { userId: gmailUser.id } });
  if (!existing) {
    // Choose dates: start in ~30 days for 5 nights
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 5);

    const adults = 2;
    const children = 1;

    // Pricing model (example values)
    const nightlyBaseHt = 180; // base per night HT
    const nights = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
    const basePriceHt = nightlyBaseHt * nights;

    // Fetch two options for illustration
    const bedLinen = await prisma.option.findUnique({ where: { name: "Linge de lit (Housses, couette et oreiller)" } });
    const cleaning = await prisma.option.findUnique({ where: { name: "Frais de nettoyage" } });

    const optionItems: { optionId: string; quantity: number; totalPriceHt: number }[] = [];
    if (bedLinen) {
      const qty = adults + children; // one per person
      optionItems.push({ optionId: bedLinen.id, quantity: qty, totalPriceHt: bedLinen.priceHt * qty });
    }
    if (cleaning) {
      optionItems.push({ optionId: cleaning.id, quantity: 1, totalPriceHt: cleaning.priceHt });
    }

    const optionsPriceHt = optionItems.reduce((s, i) => s + i.totalPriceHt, 0);
    const subtotalHt = basePriceHt + optionsPriceHt;
    const tvaRate = 0.2; // 20% VAT
    const tvaHt = subtotalHt * tvaRate;
    const taxSejourPerNight = 1.5; // tourist tax per night TTC (example)
    const taxSejourTtc = taxSejourPerNight * nights * (adults + children);
    const totalTtc = subtotalHt + tvaHt + taxSejourTtc;
    const depositAmount = parseFloat((totalTtc * 0.3).toFixed(2));
    const balanceAmount = parseFloat((totalTtc - depositAmount).toFixed(2));
    const securityDeposit = 500; // example fixed amount

    const reservation = await prisma.reservation.create({
      data: {
        userId: gmailUser.id,
        startDate,
        endDate,
        adults,
        children,
        basePriceHt,
        optionsPriceHt,
        subtotalHt,
        tvaHt,
        taxSejourTtc,
        totalTtc,
        depositAmount,
        balanceAmount,
        securityDeposit,
        items: { create: optionItems.map(i => ({ ...i })) },
      },
      include: { items: true },
    });
    console.log("Created sample reservation for", gmailUser.email, reservation.id);
  } else {
    console.log("Reservation already exists for gmail user, skipping creation.");
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
