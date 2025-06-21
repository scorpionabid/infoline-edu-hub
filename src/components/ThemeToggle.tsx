
import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";
import { useTheme } from "@/contexts/ThemeContext";

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in ThemeToggle:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

const ThemeToggle: React.FC = () => {
  // Default values in case translation fails
  const defaultTranslations = {
    light: 'Light',
    dark: 'Dark'
  };

  try {
    // Safely get translation function with optional chaining
    const { t } = useTranslation?.() || {};
    const { theme = 'light', setTheme } = useTheme?.() || {};

    // Don't render if theme context is not available
    if (!setTheme) {
      console.warn('Theme context not available');
      return null;
    }

    // Toggle theme with error handling
    const toggleTheme = () => {
      try {
        // Directly set the new theme value instead of using a function
        const newTheme = theme === "light" ? "dark" : "light";
        console.log(`Toggling theme from ${theme} to ${newTheme}`);
        setTheme(newTheme);
      } catch (error) {
        console.error('Error toggling theme:', error);
      }
    };

    // Get theme display names with fallbacks
    const lightText = t?.('theme.light') || defaultTranslations.light;
    const darkText = t?.('theme.dark') || defaultTranslations.dark;
    const label = theme === "dark" ? lightText : darkText;

    // Memoize the icon to prevent unnecessary re-renders
    const ThemeIcon = theme === "dark" ? Sun : Moon;
    const iconClass = "h-5 w-5 text-muted-foreground";

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={label}
        title={label}
        className="relative"
        data-testid="theme-toggle"
      >
        <ThemeIcon className={iconClass} />
      </Button>
    );
  } catch (error) {
    console.error('Error in ThemeToggle:', error);
    // Fallback UI in case of unexpected errors
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5 text-muted-foreground/50" />
      </Button>
    );
  }
};

// Wrap with error boundary
export default function SafeThemeToggle() {
  return (
    <ErrorBoundary fallback={null}>
      <ThemeToggle />
    </ErrorBoundary>
  );
}
