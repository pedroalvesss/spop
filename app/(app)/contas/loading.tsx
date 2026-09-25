import { Skeleton } from "@/components/Skeleton";

export default function BillsLoading() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
        <Skeleton className="h-[86px]" />
        <Skeleton className="h-[86px]" />
      </div>
      <Skeleton className="h-[356px]" />
      <Skeleton className="h-4 w-72 rounded-md" />
    </div>
  );
}
