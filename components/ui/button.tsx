import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent px-[10px] py-[5.6px] text-sm leading-[1.2] font-medium whitespace-nowrap text-text transition-colors disabled:cursor-not-allowed disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "border-accent text-accent hover:bg-accent/12 active:bg-accent/22",
        secondary: "border-divider hover:bg-text/7 active:bg-text/14",
        ghost: "px-[2.8px] text-accent hover:bg-accent/10 active:bg-accent/18",
        icon: "size-9 p-0 hover:bg-text/7",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />;
}

export { Button, buttonVariants };
export type { ButtonProps };
