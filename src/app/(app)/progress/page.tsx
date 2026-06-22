import { TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProgressExplorer } from "@/components/ProgressExplorer";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ exerciseId?: string }>;
}) {
  const { exerciseId } = await searchParams;
  const exercises = await prisma.exercise.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={TrendingUp} title="Progress" subtitle="Track max weight and volume per exercise over time." />
      <Card>
        <ProgressExplorer exercises={exercises} initialExerciseId={exerciseId} />
      </Card>
    </div>
  );
}
