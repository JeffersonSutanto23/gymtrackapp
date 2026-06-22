import { prisma } from "@/lib/prisma";
import { FoodsBrowser } from "@/components/FoodsBrowser";
import { CustomFoodForm } from "@/components/CustomFoodForm";

export default async function FoodsPage() {
  const count = await prisma.food.count();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Food Database</h1>
          <p className="text-neutral-400 text-sm mt-1">{count} foods available to log.</p>
        </div>
        <CustomFoodForm />
      </div>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
        <FoodsBrowser />
      </section>
    </div>
  );
}
