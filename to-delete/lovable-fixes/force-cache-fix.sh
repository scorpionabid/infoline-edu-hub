#!/bin/bash

echo "🚨 LOVABLE.DEV CACHE FORCE FIX"
echo "Lovable.dev server-ində cache corrupt olub, məcburi fix edilir..."

# Force update timestamp
touch src/components/ui/theme-toggle.tsx
touch src/contexts/ThemeContext.tsx

# Yenidən yaz ki, Lovable.dev cache-ni update etsin
cat > src/components/ui/theme-toggle.tsx << 'EOF'
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

export default ModeToggle;
EOF

echo "✅ theme-toggle.tsx force update edildi"
echo "🔄 İndi Lovable.dev-də hard refresh et (Cmd+Shift+R)"
