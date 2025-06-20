
import React from "react";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

// Re-export LanguageSwitcher as LanguageSelect for compatibility
export const LanguageSelect: React.FC = () => {
  return <LanguageSwitcher />;
};

export default LanguageSelect;
