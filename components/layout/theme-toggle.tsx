"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Icons swap via the `dark` class, so the button renders the same on server and client. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle colour theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          />
        }
      >
        <Sun className="size-5 scale-100 rotate-0 transition-transform duration-500 dark:scale-0 dark:-rotate-90" aria-hidden="true" />
        <Moon className="absolute size-5 scale-0 rotate-90 transition-transform duration-500 dark:scale-100 dark:rotate-0" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent side="bottom">Toggle theme</TooltipContent>
    </Tooltip>
  );
}
