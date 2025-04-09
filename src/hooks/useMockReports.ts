
import { useState, useEffect } from 'react';
import { Report } from '@/types/report';

export const useMockReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Demo hesabatlar (API-dən gələcək məlumatları simulasiya edir)
    const mockReports: Report[] = [
      {
        id: '1',
        name: 'İllik Statistika Hesabatı',
        title: 'İllik Statistika Hesabatı',
        description: 'Bütün regionların illik statistik məlumatlarının analizi',
        type: 'statistics',
        created: '2025-03-01',
        status: 'published',
        createdBy: 'admin',
        data: [
          { name: 'Bakı', value: 400, count: 120 },
          { name: 'Sumqayıt', value: 300, count: 80 },
          { name: 'Gəncə', value: 300, count: 70 },
          { name: 'Şəki', value: 200, count: 50 },
          { name: 'Lənkəran', value: 278, count: 60 },
          { name: 'Quba', value: 189, count: 40 }
        ]
      },
      {
        id: '2',
        name: 'Tamamlanma Analizi',
        title: 'Tamamlanma Analizi',
        description: 'Kateqoriyalar üzrə məlumat tamamlanma faizinin analizi',
        type: 'completion',
        created: '2025-03-15',
        status: 'published',
        createdBy: 'admin',
        data: [
          { name: 'Tamamlanmış', value: 68 },
          { name: 'Gözləyən', value: 23 },
          { name: 'Rədd edilmiş', value: 9 }
        ]
      },
      {
        id: '3',
        name: 'Regionlar Müqayisəsi',
        title: 'Regionlar Müqayisəsi',
        description: 'Regionlar arasında məlumat doluluk faizinin müqayisəsi',
        type: 'comparison',
        created: '2025-03-20',
        status: 'draft',
        createdBy: 'admin',
        data: [
          { name: 'Bakı', value: 95 },
          { name: 'Sumqayıt', value: 88 },
          { name: 'Gəncə', value: 82 },
          { name: 'Şəki', value: 75 },
          { name: 'Lənkəran', value: 70 },
          { name: 'Quba', value: 65 }
        ]
      },
      {
        id: '4',
        name: 'Aylıq Proqres',
        title: 'Aylıq Proqres',
        description: 'Son 6 ay ərzində məlumatların toplanma tempi',
        type: 'custom',
        created: '2025-04-01',
        status: 'published',
        createdBy: 'admin',
        data: [
          { name: 'Yanvar', value: 40 },
          { name: 'Fevral', value: 45 },
          { name: 'Mart', value: 60 },
          { name: 'Aprel', value: 90 },
          { name: 'May', value: 120 },
          { name: 'İyun', value: 145 }
        ]
      },
      {
        id: '5',
        name: 'Məktəb Performans Hesabatı',
        title: 'Məktəb Performans Hesabatı',
        description: 'Top 10 məktəbin məlumat təqdim etmə performansı',
        type: 'school',
        created: '2025-04-05',
        status: 'published',
        createdBy: 'admin',
        data: [
          { name: 'Məktəb 1', value: 98 },
          { name: 'Məktəb 2', value: 95 },
          { name: 'Məktəb 3', value: 93 },
          { name: 'Məktəb 4', value: 91 },
          { name: 'Məktəb 5', value: 90 },
          { name: 'Məktəb 6', value: 89 },
          { name: 'Məktəb 7', value: 87 },
          { name: 'Məktəb 8', value: 85 },
          { name: 'Məktəb 9', value: 84 },
          { name: 'Məktəb 10', value: 82 }
        ]
      },
      {
        id: '6',
        name: 'Təhsil Səviyyəsi Analizi',
        title: 'Təhsil Səviyyəsi Analizi',
        description: 'Müxtəlif təhsil səviyyələri üzrə məlumat analizi',
        type: 'category',
        created: '2025-04-08',
        status: 'draft',
        createdBy: 'admin',
        data: [
          { name: 'İbtidai', value: 89 },
          { name: 'Orta', value: 76 },
          { name: 'Tam Orta', value: 82 },
          { name: 'Texniki', value: 68 },
          { name: 'Peşə', value: 72 }
        ]
      }
    ];
    
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 500); // Yüklənmə simulyasiyası
  }, []);
  
  return { reports, loading };
};
