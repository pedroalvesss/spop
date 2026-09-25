import { Skeleton } from "@/components/Skeleton";
import { CardGrid } from "@/components/ui/card";

export default function BudgetLoading() {
  return (
    <CardGrid>
      <Skeleton className="col-span-full h-[150px]" />
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-[110px]" />
      ))}
    </CardGrid>
  );
}
