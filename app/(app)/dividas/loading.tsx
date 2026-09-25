import { Skeleton } from "@/components/Skeleton";
import { CardGrid } from "@/components/ui/card";

export default function DebtsLoading() {
  return (
    <CardGrid>
      <Skeleton className="col-span-full h-[126px]" />
      <Skeleton className="h-[136px]" />
      <Skeleton className="h-[136px]" />
      <Skeleton className="h-[136px]" />
    </CardGrid>
  );
}
