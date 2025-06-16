import React, { useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import PerformanceDashboard from "@/components/performance/PerformanceDashboard";

const Performance: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Performans | InfoLine";
  }, []);

  return <PerformanceDashboard />;
};

export default Performance;
