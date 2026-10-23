import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border text-sm font-semibold tracking-wide whitespace-nowrap transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-silk outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_12px_28px_-14px_var(--terracotta)] hover:bg-terracotta-deep hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_18px_36px_-14px_var(--terracotta)]",
        ink: "border-transparent bg-ink text-ink-foreground hover:bg-brown",
        outline:
          "border-foreground/20 bg-transparent text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
        "outline-inverse":
          "border-band-foreground/40 bg-transparent text-band-foreground hover:border-band-foreground hover:bg-band-foreground hover:text-band",
        inverse: "border-transparent bg-band-foreground text-band hover:bg-band-foreground/85",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost: "border-transparent text-foreground hover:bg-muted",
        whatsapp:
          "border-whatsapp/30 bg-transparent text-whatsapp hover:border-whatsapp hover:bg-whatsapp hover:text-white",
        destructive:
          "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "border-transparent rounded-none px-0 text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-primary",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-10 px-4 text-[0.8125rem]",
        lg: "h-13 px-8 text-[0.9375rem]",
        icon: "size-11",
        "icon-sm": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
