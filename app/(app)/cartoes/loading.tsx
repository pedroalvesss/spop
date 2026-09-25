import { Skeleton } from "@/components/Skeleton";
import { CardGrid } from "@/components/ui/card";

export default function CardsLoading() {
  return (
    <CardGrid className="items-start">
      <div className="flex flex-col gap-3.5">
        <Skeleton className="aspect-[1.586] w-full max-w-[380px] rounded-[18px]" />
        <Skeleton className="h-[122px]" />
        <Skeleton className="h-11 rounded-xl" />
      </div>
      <Skeleton className="h-[480px]" />
    </CardGrid>
  );
}
