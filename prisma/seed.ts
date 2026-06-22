import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import foods from "../src/data/foods.json";
import exercises from "../src/data/exercises.json";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Seeding ${exercises.length} exercises...`);
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: {
        name: exercise.name,
        muscleGroup: exercise.muscleGroup as never,
        equipment: exercise.equipment,
        isCompound: exercise.isCompound,
      },
    });
  }

  console.log(`Seeding ${foods.length} foods...`);
  const existingCount = await prisma.food.count({ where: { isCustom: false } });
  if (existingCount === 0) {
    await prisma.food.createMany({
      data: foods.map((food) => ({
        name: food.name,
        category: food.category,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        calories: food.calories,
        proteinG: food.proteinG,
        carbsG: food.carbsG,
        fatG: food.fatG,
        fiberG: food.fiberG,
        sugarG: food.sugarG,
        sodiumMg: food.sodiumMg,
      })),
    });
  } else {
    console.log(`Skipping food seed, ${existingCount} non-custom foods already present.`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
