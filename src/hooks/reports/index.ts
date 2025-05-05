
import { useState } from 'react';
import { Report } from '@/types/report';
import { toast } from 'sonner';

export const useReportPreview = (reportId: string) => {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Bu hissədə real API çağırışı olacaq
      // Nümunə məlumatlar:
      const mockReport: Report = {
        id: reportId,
        title: "Nümunə Hesabat",
        description: "Bu bir nümunə hesabat təsviridir",
        type: "table",
        status: "published",
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(), // Legacy support
        content: {
          headers: ["ID", "Ad", "Məktəb", "Tarix", "Status"],
          rows: [
            ["1", "Report 1", "Məktəb #5", "01.01.2023", "Aktiv"],
            ["2", "Report 2", "Məktəb #12", "05.02.2023", "Təsdiq gözləyir"],
            ["3", "Report 3", "Məktəb #7", "10.03.2023", "Tamamlanıb"],
          ]
        }
      };

      // Timeout to simulate API call
      setTimeout(() => {
        setReport(mockReport);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError("Hesabat yüklənərkən xəta baş verdi");
      setIsLoading(false);
      toast.error("Hesabat yüklənərkən xəta baş verdi");
    }
  };

  return {
    report,
    isLoading,
    error,
    fetchReport
  };
};

export default useReportPreview;
