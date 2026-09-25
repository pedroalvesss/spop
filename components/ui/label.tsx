import * as React from "react";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<"label">;

function Label({ className, ...props }: LabelProps) {
  return <label className={cn("mb-[5px] block text-xs text-text/70", className)} {...props} />;
}

export { Label };
