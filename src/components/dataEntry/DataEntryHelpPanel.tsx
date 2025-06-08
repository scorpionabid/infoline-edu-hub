import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Lightbulb, 
  BookOpen, 
  MessageCircle, 
  Phone,
  ChevronRight,
  X,
  CheckCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DataEntryHelpPanelProps {
  categoryName?: string;
  totalFields?: number;
  completedFields?: number;
  onClose?: () => void;
}

export const DataEntryHelpPanel: React.FC<DataEntryHelpPanelProps> = ({
  categoryName = 'Bu kateqoriya',
  totalFields = 0,
  completedFields = 0,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['tips']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  if (!isOpen) return null;

  const helpSections = [
    {
      id: 'tips',
      title: 'Məlumat Daxil Etmə Məsləhətləri',
      icon: <Lightbulb className="h-4 w-4" />,
      content: [
        'Məcburi sahələri əvvəl doldurun (qırmızı * işarəsi ilə)',
        'Hər sahənin yanındakı köməkçi mətnə diqqət edin',
        'Məlumatlar avtomatik saxlanılır, narahatlıq etməyin',
        'Xəta varsa, sahə qırmızı rəngdə göstəriləcək',
        'Bütün sahələr tamamlandıqdan sonra "Təsdiq üçün göndər" düyməsi aktiv olacaq'
      ]
    },
    {
      id: 'validation',
      title: 'Sahə Növləri və Qaydalar',
      icon: <CheckCircle className="h-4 w-4" />,
      content: [
        'Mətn sahələri: Minimum və maksimum simvol sayına diqqət edin',
        'Rəqəm sahələri: Yalnız rəqəm daxil edin, diapazona riayət edin',
        'Tarix sahələri: Kalendar ikonuna basaraq tarix seçin',
        'Seçim sahələri: Açılan menyudan uyğun variantı seçin',
        'E-poçt sahələri: Düzgün format: nümunə@domain.com'
      ]
    },
    {
      id: 'progress',
      title: 'İrəliləmə və Nəzarət',
      icon: <BookOpen className="h-4 w-4" />,
      content: [
        `${categoryName} üçün ${totalFields} sahə mövcuddur`,
        `Hazırda ${completedFields} sahə tamamlanıb`,
        'Faiz göstərici yuxarıda həmişə görünür',
        'Son dəyişikliklər avtomatik saxlanılır',
        'Formu istədiyiniz vaxt saxlayıb sonra davam edə bilərsiniz'
      ]
    }
  ];

  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Kömək və Məsləhətlər
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <Alert>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="text-sm">
                <strong>{categoryName}</strong> kateqoriyası üçün məlumat daxil edirsən
              </span>
              <Badge variant="outline">
                {completedFields}/{totalFields} tamamlandı
              </Badge>
            </div>
          </AlertDescription>
        </Alert>

        {/* Help Sections */}
        <div className="space-y-3">
          {helpSections.map((section) => (
            <Collapsible
              key={section.id}
              open={expandedSections.includes(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                >
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      expandedSections.includes(section.id) ? 'rotate-90' : ''
                    }`} 
                  />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-3 pb-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.content.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        {/* Contact Support */}
        <div className="pt-3 border-t space-y-3">
          <p className="text-sm font-medium">Köməyə ehtiyacınız var?</p>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <MessageCircle className="h-3 w-3 mr-1" />
              Mesaj
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Phone className="h-3 w-3 mr-1" />
              Zəng
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            İş vaxtları: B.e - Cü, 09:00 - 18:00
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataEntryHelpPanel;
