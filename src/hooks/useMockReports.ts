
import { useEffect, useState } from 'react';
import { Report, ReportType } from '@/types/report';

export const mockReports: Report[] = [
  {
    id: 'report-1',
    name: 'Məktəb Performans Statistikası',
    title: 'Məktəb Performans Statistikası',
    type: 'statistics',
    description: 'Bütün məktəblər üzrə məlumat doldurma performansı və statistika.',
    dateCreated: '2023-10-15T08:30:00Z',
    createdAt: '2023-10-15T08:30:00Z',
    created: '2023-10-15T08:30:00Z',
    createdBy: 'admin',
    status: 'published',
    data: [
      { name: 'Bakı', value: 85, category: 'Region' },
      { name: 'Gəncə', value: 72, category: 'Region' },
      { name: 'Sumqayıt', value: 68, category: 'Region' },
      { name: 'Lənkəran', value: 62, category: 'Region' },
      { name: 'Şəki', value: 55, category: 'Region' },
    ],
    summary: 'Bu hesabat bütün regionlar üzrə məktəblərin performansını göstərir. Bakı regionu ən yüksək göstəriciyə sahib olarkən, Şəki ən aşağı performans göstərir.',
    insights: [
      'Böyük şəhərlərdə yerləşən məktəblərin data doldurma səviyyəsi daha yüksəkdir.',
      'Son 3 ayda performans 15% artmışdır.',
      'Regional məktəblər texniki problemlərlə daha çox qarşılaşır.'
    ],
    recommendations: [
      'Regional məktəblər üçün əlavə texniki dəstək təmin edilməlidir.',
      'Aylıq hesabat tamamlama hədəfləri təyin edilməlidir.',
      'Performansı aşağı olan məktəblər üçün təlim seminarları keçirilməlidir.'
    ]
  },
  {
    id: 'report-2',
    name: 'Kateqoriyalar üzrə Tamamlanma Faizi',
    title: 'Kateqoriyalar üzrə Tamamlanma Faizi',
    type: 'completion',
    description: 'Müxtəlif kateqoriyalar üzrə məlumat doldurulma faizinin analizi.',
    dateCreated: '2023-10-10T14:45:00Z',
    createdAt: '2023-10-10T14:45:00Z',
    created: '2023-10-10T14:45:00Z',
    createdBy: 'admin',
    status: 'published',
    data: [
      { name: 'Tədris Planı', value: 92, category: 'Akademik' },
      { name: 'Şagird Qeydiyyatı', value: 87, category: 'İdarəetmə' },
      { name: 'Texniki Avadanlıq', value: 63, category: 'İnfrastruktur' },
      { name: 'Müəllim Heyəti', value: 76, category: 'Kadr' },
      { name: 'Büdcə Məlumatları', value: 51, category: 'Maliyyə' },
    ],
    summary: 'Akademik və idarəetmə kateqoriyalarında məlumat doldurulma faizi yüksək, infrastruktur və maliyyə kateqoriyalarında isə nisbətən aşağıdır.',
    insights: [
      'Maliyyə məlumatlarının doldurulması ən çox gecikmələr müşahidə olunan sahədir.',
      'Tədris planı və şagird qeydiyyatı kateqoriyaları ən yüksək tamamlanma nisbətinə malikdir.',
      'Texniki avadanlıq məlumatlarının doldurulmasında çətinliklər mövcuddur.'
    ],
    recommendations: [
      'Maliyyə məlumatlarının doldurulması üçün sadələşdirilmiş formalar yaradılmalıdır.',
      'Texniki avadanlıq qeydiyyatı üçün mobil tətbiq dəstəyi əlavə edilməlidir.',
      'Yüksək tamamlanma göstəriciləri üçün stimullaşdırıcı tədbirlər görülməlidir.'
    ]
  },
  {
    id: 'report-3',
    name: 'İllik Müqayisəli Analiz',
    title: 'İllik Müqayisəli Analiz',
    type: 'comparison',
    description: 'Ötən illə müqayisədə məktəb performansının analizi.',
    dateCreated: '2023-09-28T11:20:00Z',
    createdAt: '2023-09-28T11:20:00Z',
    created: '2023-09-28T11:20:00Z',
    createdBy: 'admin',
    status: 'published',
    data: [
      { name: 'Yanvar', value: 65, comparisonValue: 58, category: 'Ay' },
      { name: 'Fevral', value: 68, comparisonValue: 62, category: 'Ay' },
      { name: 'Mart', value: 72, comparisonValue: 65, category: 'Ay' },
      { name: 'Aprel', value: 75, comparisonValue: 68, category: 'Ay' },
      { name: 'May', value: 80, comparisonValue: 70, category: 'Ay' },
      { name: 'İyun', value: 85, comparisonValue: 72, category: 'Ay' },
    ],
    summary: 'Cari ildə bütün aylarda ötən ilə nisbətən daha yüksək performans göstəriciləri müşahidə olunur. Xüsusilə ilin ikinci yarısında artım daha sürətli olmuşdur.',
    insights: [
      'İl ərzində performans göstəriciləri sabit şəkildə artmışdır.',
      'Cari ildə ortalama 9% artım müşahidə olunmuşdur.',
      'Yay aylarında performans daha da yüksəlmişdir.'
    ],
    recommendations: [
      'Uğurlu strategiyaların davam etdirilməsi tövsiyə olunur.',
      'Yeni tədris ilində hədəflərin artırılması mümkündür.',
      'Performansın artırılması üçün yeni stimullaşdırıcı tədbirlərin həyata keçirilməsi.'
    ]
  },
  {
    id: 'report-4',
    name: 'Sektorlar üzrə Müqayisəli Analiz',
    title: 'Sektorlar üzrə Müqayisəli Analiz',
    type: 'comparison',
    description: 'Məktəb sektorları üzrə performans müqayisəsi.',
    dateCreated: '2023-09-15T09:30:00Z',
    createdAt: '2023-09-15T09:30:00Z',
    created: '2023-09-15T09:30:00Z',
    createdBy: 'admin',
    status: 'published',
    data: [
      { name: 'Yasamal', value: 78, comparisonValue: 74, category: 'Sektor' },
      { name: 'Nəsimi', value: 82, comparisonValue: 76, category: 'Sektor' },
      { name: 'Kəpəz', value: 70, comparisonValue: 68, category: 'Sektor' },
      { name: 'Sabunçu', value: 65, comparisonValue: 62, category: 'Sektor' },
      { name: 'Binəqədi', value: 72, comparisonValue: 67, category: 'Sektor' },
    ],
    summary: 'Nəsimi və Yasamal sektorları ən yüksək performans göstərərək liderdir. Bütün sektorlarda ötən dövrə nisbətən artım müşahidə olunur.',
    insights: [
      'Mərkəzi rayonlarda yerləşən sektorlar daha yüksək göstəricilərə malikdir.',
      'Nəsimi sektoru son 6 ayda ən sürətli inkişaf göstərmişdir.',
      'Sabunçu sektoru ən aşağı performans göstəricisinə malik olsa da, stabil artım müşahidə olunur.'
    ],
    recommendations: [
      'Performansı aşağı olan sektorlara əlavə dəstək verilməlidir.',
      'Uğurlu təcrübələrin digər sektorlara ötürülməsi üçün təlimlər keçirilməlidir.',
      'Sektorlar arası rəqabətin stimullaşdırılması üçün mükafatlandırma sisteminin tətbiqi.'
    ]
  },
  {
    id: 'report-5',
    name: 'Məlumat Doldurma Statistikası',
    title: 'Məlumat Doldurma Statistikası',
    type: 'statistics',
    description: 'Məlumatların vaxtında doldurulmasının statistik təhlili.',
    dateCreated: '2023-09-05T15:40:00Z',
    createdAt: '2023-09-05T15:40:00Z',
    created: '2023-09-05T15:40:00Z',
    createdBy: 'admin',
    status: 'published',
    data: [
      { name: 'Vaxtında', value: 68, category: 'Zaman' },
      { name: '1-3 gün gecikdirmə', value: 22, category: 'Zaman' },
      { name: '4-7 gün gecikdirmə', value: 7, category: 'Zaman' },
      { name: '1-2 həftə gecikdirmə', value: 2, category: 'Zaman' },
      { name: '2 həftədən çox', value: 1, category: 'Zaman' },
    ],
    summary: 'Məlumatların əksəriyyəti (68%) vaxtında doldurulur. 22% məlumat 1-3 gün gecikdirmə ilə doldurulur, qalan 10% isə daha uzun müddətdə gecikmələr yaşanır.',
    insights: [
      'Məlumatların çoxu vaxtında doldurulsa da, təxminən üçdə biri müəyyən gecikmələrlə doldurulur.',
      'Son tarixdən 1-3 gün əvvəl məlumat doldurma aktivliyi xüsusilə artır.',
      'Uzun müddətli gecikmələr əsasən texniki problemlər səbəbindən baş verir.'
    ],
    recommendations: [
      'Son tarix yaxınlaşdıqda xatırlatma bildirişlərinin artırılması.',
      'Erkən tamamlama üçün bonus sistemi təklif edilməsi.',
      'Texniki problemlərin həlli üçün daha operativ dəstək xidməti yaradılması.'
    ]
  },
  {
    id: 'report-6',
    name: 'Məktəb Növləri üzrə Performans',
    title: 'Məktəb Növləri üzrə Performans',
    type: 'completion',
    description: 'Məktəb növləri üzrə performans və tamamlanma faizləri.',
    dateCreated: '2023-08-20T10:15:00Z',
    createdAt: '2023-08-20T10:15:00Z',
    created: '2023-08-20T10:15:00Z',
    createdBy: 'admin',
    status: 'published',
    data: [
      { name: 'Tam orta məktəblər', value: 82, category: 'Məktəb növü' },
      { name: 'Ümumi orta məktəblər', value: 74, category: 'Məktəb növü' },
      { name: 'İbtidai məktəblər', value: 68, category: 'Məktəb növü' },
      { name: 'Lisey və gimnaziyalar', value: 90, category: 'Məktəb növü' },
      { name: 'Peşə məktəbləri', value: 65, category: 'Məktəb növü' },
    ],
    summary: 'Lisey və gimnaziyalar ən yüksək tamamlanma faizinə (90%) malikdir. Peşə məktəbləri isə ən aşağı göstəriciyə (65%) sahibdir.',
    insights: [
      'Lisey və gimnaziyalar data doldurma prosesində daha intizamlıdır.',
      'Tam orta məktəblər də yüksək performans (82%) göstərir.',
      'Peşə məktəbləri və ibtidai məktəblər daha çox dəstəyə ehtiyac duyur.'
    ],
    recommendations: [
      'Peşə məktəbləri üçün xüsusi təlimlər keçirilməlidir.',
      'İbtidai məktəblər üçün sadələşdirilmiş formalar hazırlanmalıdır.',
      'Lisey və gimnaziyaların uğurlu təcrübələri digər məktəblərlə paylaşılmalıdır.'
    ]
  }
];

export const useMockReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  
  useEffect(() => {
    // Simulate API request
    const fetchReports = () => {
      setTimeout(() => {
        setReports(mockReports);
      }, 500);
    };
    
    fetchReports();
  }, []);
  
  return { reports };
};
