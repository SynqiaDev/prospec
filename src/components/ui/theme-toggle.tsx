"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "./button";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className="hover:text-primary hover:bg-primary-foreground hover:scale-105 transition-all duration-300"
                >
                    <div className="relative w-5 h-5">
                        <Sun className="absolute inset-0 h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </div>
                </Button>
            </TooltipTrigger>
            <TooltipContent>Alterar tema</TooltipContent>
        </Tooltip>
    );
}

export default ThemeToggle;
