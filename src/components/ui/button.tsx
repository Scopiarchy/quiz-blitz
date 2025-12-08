import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.3)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.3)]",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary:
          "bg-gradient-to-r from-secondary to-cyan-500 text-secondary-foreground shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.3)]",
        ghost:
          "text-foreground hover:bg-muted hover:text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        kahoot:
          "bg-gradient-to-r from-primary to-purple-600 text-primary-foreground text-lg px-8 py-4 shadow-[0_6px_0_rgba(0,0,0,0.3)] hover:brightness-110 active:translate-y-[3px] active:shadow-[0_3px_0_rgba(0,0,0,0.3)]",
        accent:
          "bg-accent text-accent-foreground shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.3)]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-14 rounded-xl px-10 text-lg",
        xl: "h-16 rounded-2xl px-12 text-xl",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };