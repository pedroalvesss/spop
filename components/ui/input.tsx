import * as React from "react";
import { cn } from "@/lib/utils";

const inputClassName =
  "w-full min-w-0 min-h-9 rounded-lg border border-divider bg-surface px-2.5 py-1.5 text-sm text-text caret-accent transition-colors hover:border-text/45 focus-visible:border-accent focus-visible:outline-offset-0 disabled:opacity-45";

type InputProps = React.ComponentProps<"input">;

function Input({ className, ...props }: InputProps) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

type SelectProps = React.ComponentProps<"select">;

function Select({ className, ...props }: SelectProps) {
  return <select className={cn(inputClassName, className)} {...props} />;
}

export { Input, Select, inputClassName };
