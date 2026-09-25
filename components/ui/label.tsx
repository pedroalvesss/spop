import * as React from "react";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<"label">;

function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-text/70 mb-[5px] block text-xs", className)}
      {...props}
    />
  );
}

export { Label };
