import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Tombol "tebal" ala app belajar: sisi bawah 4px yang hilang saat ditekan.
 * Trik: saat :active, border-bottom dipindah ke border-top transparan → tinggi tetap,
 * muka tombol turun 4px tanpa menggeser layout.
 */
const buttonVariants = cva(
  [
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-extrabold",
    "transition-[filter,transform,background-color] duration-100 bg-clip-padding",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white border-b-4 border-primary-700 hover:brightness-110 active:border-b-0 active:border-t-4 active:border-t-transparent",
        secondary:
          "bg-secondary-600 text-ink border-b-4 border-secondary-700 hover:brightness-105 active:border-b-0 active:border-t-4 active:border-t-transparent",
        accent:
          "bg-accent-600 text-white border-b-4 border-accent-700 hover:brightness-110 active:border-b-0 active:border-t-4 active:border-t-transparent",
        budaya:
          "bg-budaya-solid text-white border-b-4 border-budaya-deep hover:brightness-110 active:border-b-0 active:border-t-4 active:border-t-transparent",
        asisten:
          "bg-asisten-solid text-white border-b-4 border-asisten-deep hover:brightness-110 active:border-b-0 active:border-t-4 active:border-t-transparent",
        komunitas:
          "bg-komunitas-solid text-white border-b-4 border-komunitas-deep hover:brightness-110 active:border-b-0 active:border-t-4 active:border-t-transparent",
        destructive:
          "bg-danger text-white border-b-4 border-danger-700 hover:brightness-110 active:border-b-0 active:border-t-4 active:border-t-transparent",
        outline:
          "border-2 border-b-4 border-border bg-card text-foreground hover:bg-muted active:border-b-2 active:translate-y-[2px]",
        ghost: "text-foreground hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-sm [&_svg]:size-4",
        default: "h-11 px-5 text-[0.9375rem]",
        lg: "h-14 px-7 text-base",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9 [&_svg]:size-4",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, block, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
