// Seed script: fills the database with SAMPLE cars for testing.
// Run it with:  npx prisma db seed
//
// ⚠️ These cars and prices are made up. Replace them with Yebbie's real
// cars once the admin dashboard is built (Step 10).

import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

// Prices below are in CEDIS for readability; we × 100 to store pesewas.
const cedis = (amount: number) => amount * 100;

const sampleCars = [
  {
    make: "Toyota",
    model: "Land Cruiser Prado",
    year: 2020,
    color: "Red",
    plateNumber: "SAMPLE-001",
    bodyType: "SUV",
    transmission: "AUTOMATIC",
    fuelType: "PETROL",
    seats: 7,
    mileage: 64000,
    salePrice: cedis(780000),
    featured: true,
    description: "Spacious 7-seater, ideal for family trips and upcountry travel.",
  },
  {
    make: "Toyota",
    model: "Corolla",
    year: 2019,
    color: "Silver",
    plateNumber: "SAMPLE-002",
    bodyType: "SEDAN",
    transmission: "AUTOMATIC",
    fuelType: "PETROL",
    seats: 5,
    mileage: 82000,
    salePrice: cedis(185000),
    featured: true,
    description: "Reliable and fuel-efficient. Clean and ready to drive.",
  },
  {
    make: "Hyundai",
    model: "Elantra",
    year: 2018,
    color: "White",
    plateNumber: "SAMPLE-003",
    bodyType: "SEDAN",
    transmission: "AUTOMATIC",
    fuelType: "PETROL",
    seats: 5,
    mileage: 97000,
    salePrice: cedis(140000),
    description: "Well maintained, clean interior, full service history.",
  },
  {
    make: "Kia",
    model: "Sportage",
    year: 2021,
    color: "Grey",
    plateNumber: "SAMPLE-004",
    bodyType: "SUV",
    transmission: "AUTOMATIC",
    fuelType: "DIESEL",
    seats: 5,
    mileage: 41000,
    salePrice: cedis(310000),
    description: "Comfortable compact SUV for city driving.",
  },
  {
    make: "Toyota",
    model: "Hilux",
    year: 2022,
    color: "Black",
    plateNumber: "SAMPLE-005",
    bodyType: "PICKUP",
    transmission: "MANUAL",
    fuelType: "DIESEL",
    seats: 5,
    mileage: 23000,
    salePrice: cedis(520000),
    featured: true,
    description: "Double cabin pickup, tough and ready for any road.",
  },
  {
    make: "Hyundai",
    model: "Ioniq Electric",
    year: 2020,
    color: "Blue",
    plateNumber: "SAMPLE-006",
    bodyType: "HATCHBACK",
    transmission: "AUTOMATIC",
    fuelType: "ELECTRIC",
    seats: 5,
    mileage: 38000,
    salePrice: cedis(210000),
    description: "Fully electric. Quiet, smooth and cheap to run.",
  },
] as const;

async function main() {
  for (const car of sampleCars) {
    // upsert = "update if it exists, otherwise create".
    // So running the seed twice doesn't create duplicate cars.
    await prisma.car.upsert({
      where: { plateNumber: car.plateNumber },
      update: car,
      create: car,
    });
  }
  const count = await prisma.car.count();
  console.log(`🌱 Seeded sample cars. Cars in database: ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
