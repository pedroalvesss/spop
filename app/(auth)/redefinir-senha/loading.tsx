import { Skeleton } from "@/components/Skeleton";

export default function ResetPasswordLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-14 w-64" />
      <div className="flex flex-col gap-3.5">
        <Skeleton className="h-[68px]" />
        <Skeleton className="h-[68px]" />
        <Skeleton className="h-[46px]" />
      </div>
    </div>
  );
}
