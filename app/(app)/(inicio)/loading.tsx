import { Skeleton } from "@/components/Skeleton";
import { CardGrid } from "@/components/ui/card";

export default function HomeLoading() {
  return (
    <CardGrid>
      <Skeleton className="col-span-full h-[268px]" />
      <Skeleton className="h-[76px]" />
      <Skeleton className="h-[230px]" />
      <Skeleton className="h-[320px]" />
    </CardGrid>
  );
}
