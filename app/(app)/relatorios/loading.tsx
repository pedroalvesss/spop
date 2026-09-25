import { Skeleton } from "@/components/Skeleton";
import { CardGrid } from "@/components/ui/card";

export default function ReportsLoading() {
  return (
    <div className="flex flex-col gap-3.5">
      <Skeleton className="h-[42px] max-w-[320px] rounded-[11px]" />
      <CardGrid className="items-start">
        <Skeleton className="h-[290px]" />
        <Skeleton className="h-[330px]" />
      </CardGrid>
    </div>
  );
}
