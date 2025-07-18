import React from 'react';
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeSafe } from "@/contexts/ThemeContext";

export function ModeToggle() {
  const { theme, setTheme } = useThemeSafe();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title={theme === "dark" ? "Açıq rejimə keç" : "Qaranlıq rejimə keç"}
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Rejimi dəyişdir</span>
    </Button>
  );
}

// Default export for compatibility
export default ModeToggle;
