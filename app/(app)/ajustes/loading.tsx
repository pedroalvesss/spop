import { Skeleton } from "@/components/Skeleton";
import { CardGrid } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <CardGrid className="items-start">
      <div className="flex flex-col gap-3.5">
        <Skeleton className="h-[88px]" />
        <Skeleton className="h-[260px]" />
        <Skeleton className="h-[420px]" />
      </div>
      <div className="flex flex-col gap-3.5">
        <Skeleton className="h-[420px]" />
        <Skeleton className="h-[230px]" />
      </div>
    </CardGrid>
  );
}
