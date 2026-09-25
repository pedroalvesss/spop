import { Icon } from "@/components/Icon";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { goalProgress } from "@/lib/goals";
import type { GoalDto } from "@/services/metasService/getGoals";

interface GoalsCardProps {
  goals: GoalDto[];
}

export function GoalsCard({ goals }: GoalsCardProps) {
  return (
    <Card className="gap-3">
      <CardHeader title="Caixinhas" href="/metas" />
      {goals.map((goal) => {
        const { ratio, pct } = goalProgress(goal);
        return (
          <div key={goal.id} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="flex items-center gap-1.5">
                <Icon name={goal.icon} className="text-neutral-400" />
                {goal.name}
              </span>
              <span className="text-neutral-400 tabular-nums">{pct}</span>
            </div>
            <ProgressBar ratio={ratio} />
          </div>
        );
      })}
      {goals.length === 0 && (
        <p className="text-[13px] text-neutral-500">
          Nenhuma caixinha ainda. Toda reserva começa com R$ 1.
        </p>
      )}
    </Card>
  );
}
