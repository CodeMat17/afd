"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      // Below the sticky header, with the page's 1rem gutter on phones, so a
      // toast never covers the nav or touches the screen edges.
      offset={{ top: "calc(var(--header-height) + 0.75rem)", right: 24, bottom: 24, left: 24 }}
      mobileOffset={{ top: "calc(var(--header-height) + 0.5rem)", right: 16, bottom: 16, left: 16 }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // Close button inside the top-right corner instead of hanging off
          // the top-left edge, where it gets clipped on narrow screens.
          "--toast-close-button-start": "unset",
          "--toast-close-button-end": "0.5rem",
          "--toast-close-button-transform": "translateY(0.5rem)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // `!`: Sonner's own stylesheet is unlayered, so it beats utilities.
          // Room on the right for the close button; content may shrink and
          // wrap (long names, URLs) rather than widen the toast.
          toast: "cn-toast max-w-full! pr-10!",
          content: "min-w-0 flex-1",
          title: "wrap-anywhere",
          description: "wrap-anywhere",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
