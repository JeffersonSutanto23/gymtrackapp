import { Apple } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FoodsBrowser } from "@/components/FoodsBrowser";
import { CustomFoodForm } from "@/components/CustomFoodForm";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function FoodsPage() {
  const count = await prisma.food.count();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={Apple} title="Food Database" subtitle={`${count} foods available to log.`} action={<CustomFoodForm />} />

      <Card>
        <FoodsBrowser />
      </Card>
    </div>
  );
}
