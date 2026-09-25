import { Skeleton } from "@/components/Skeleton";

export default function LoginLoading() {
  return (
    <div className="flex flex-col gap-7">
      <Skeleton className="h-[52px] w-44" />
      <Skeleton className="h-14 w-64" />
      <div className="flex flex-col gap-3.5">
        <Skeleton className="h-[68px]" />
        <Skeleton className="h-[68px]" />
        <Skeleton className="h-[46px]" />
      </div>
    </div>
  );
}
