
// Enhanced design system types
export interface EnhancedTheme {
  colors: {
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    secondary: {
      50: string;
      100: string;
      500: string;
      600: string;
      700: string;
    };
    accent: {
      50: string;
      100: string;
      500: string;
      600: string;
    };
    success: {
      50: string;
      100: string;
      500: string;
      600: string;
    };
    warning: {
      50: string;
      100: string;
      500: string;
      600: string;
    };
    error: {
      50: string;
      100: string;
      500: string;
      600: string;
    };
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  shadows: {
    soft: string;
    medium: string;
    strong: string;
    glow: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ComponentVariant {
  default: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

export interface AnimationConfig {
  duration: string;
  timing: string;
  delay?: string;
}

export interface ResponsiveBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  wide: string;
}

export interface EnhancedCard {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  interactive?: boolean;
}

export interface EnhancedButton {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: boolean;
  fullWidth?: boolean;
}
