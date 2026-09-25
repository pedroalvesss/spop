import { Skeleton } from "@/components/Skeleton";
import { CardGrid } from "@/components/ui/card";

export default function InvestmentsLoading() {
  return (
    <CardGrid className="items-start">
      <Skeleton className="h-[164px]" />
      <div className="flex flex-col gap-3.5">
        <Skeleton className="h-[210px]" />
        <Skeleton className="h-11 rounded-xl" />
      </div>
    </CardGrid>
  );
}
