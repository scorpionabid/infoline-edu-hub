
import { useTranslation } from "@/contexts/TranslationContext";

export const useLanguageSafe = () => {
  try {
    return useTranslation();
  } catch (error) {
    // Fallback for components that might not be wrapped in TranslationProvider
    return {
      t: (key: string) => key,
      language: 'az' as const,
      setLanguage: () => {}
    };
  }
};
