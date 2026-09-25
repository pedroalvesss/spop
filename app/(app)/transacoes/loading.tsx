import { Skeleton } from "@/components/Skeleton";

export default function TransactionsLoading() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap gap-2.5">
        <Skeleton className="h-[42px] flex-[1_1_240px] rounded-xl" />
        <Skeleton className="h-[42px] flex-[1_1_240px] rounded-[11px]" />
      </div>
      <Skeleton className="h-5 w-56 rounded-md" />
      {[3, 2, 4].map((rows, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton style={{ height: rows * 58 + 8 }} />
        </div>
      ))}
    </div>
  );
}
