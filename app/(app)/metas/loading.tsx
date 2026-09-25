import { Skeleton } from "@/components/Skeleton";

export default function GoalsLoading() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
      <Skeleton className="h-[226px]" />
      <Skeleton className="h-[226px]" />
      <Skeleton className="h-[226px]" />
    </div>
  );
}
