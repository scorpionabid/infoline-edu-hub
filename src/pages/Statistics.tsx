
import { useLanguage } from "@/context/LanguageContext";
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function StatisticsPage() {
  const { t } = useLanguage();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('statistics')}</h1>
      <Alert>
        <AlertCircle className="h-4 w-4 mr-2" />
        <span>Statistika modulu hazırlanır...</span>
      </Alert>
    </div>
  );
}
