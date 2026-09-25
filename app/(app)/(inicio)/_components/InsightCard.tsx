import { Lightbulb } from "@phosphor-icons/react/ssr";
import { Money } from "@/components/HideValues";
import { Card } from "@/components/ui/card";
import type { BudgetInsight } from "@/lib/budget";

interface InsightCardProps {
  insight: BudgetInsight;
}

function insightText(insight: BudgetInsight) {
  if (insight.kind === "over") {
    return {
      title: (
        <>
          {insight.name} estourou em <Money cents={insight.overCents} />
        </>
      ),
      body: "A gente finge que não viu. Mas só dessa vez.",
    };
  }
  if (insight.kind === "near") {
    return { title: `${insight.name} já foi ${insight.pct}%`, body: "Segura a onda até o dia 30." };
  }
  return { title: "Tudo dentro do orçamento", body: "Quem é você e o que fez com o Pedro?" };
}

export function InsightCard({ insight }: InsightCardProps) {
  const { title, body } = insightText(insight);
  return (
    <Card className="flex-row items-start gap-2.5 shadow-[inset_0_0_0_1px_var(--color-accent-800)]">
      <Lightbulb weight="fill" className="mt-px shrink-0 text-xl text-accent" />
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-[13px] text-pretty text-neutral-400">{body}</div>
      </div>
    </Card>
  );
}
