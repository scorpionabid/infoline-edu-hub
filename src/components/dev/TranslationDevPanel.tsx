import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Bug, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Download,
  RefreshCw,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { TranslationValidator } from '@/utils/translationValidator';
import type { TranslationCoverage, SupportedLanguage } from '@/types/translation';

interface TranslationDevPanelProps {
  enabled?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const TranslationDevPanel: React.FC<TranslationDevPanelProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right'
}) => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [coverage, setCoverage] = useState<TranslationCoverage>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(language);

  // Panel-i göstər/gizlə
  if (!enabled) return null;

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  useEffect(() => {
    if (isOpen) {
      loadCoverage();
    }
  }, [isOpen, selectedLanguage]);

  const loadCoverage = async () => {
    setIsLoading(true);
    try {
      const result = await TranslationValidator.validateAllModules(selectedLanguage);
      setCoverage(result);
    } catch (error) {
      console.error('Coverage yükləmə xətası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      await TranslationValidator.generateConsoleReport(selectedLanguage);
      
      // HTML report yaradıb download et
      const htmlReport = await TranslationValidator.generateHTMLReport(selectedLanguage);
      const blob = new Blob([htmlReport], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `infoline-translation-report-${selectedLanguage}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Report yaratma xətası:', error);
    }
  };

  const handleLanguageChange = async (newLang: SupportedLanguage) => {
    setSelectedLanguage(newLang);
    if (newLang !== language) {
      await setLanguage(newLang);
    }
  };

  const getModuleStatus = (moduleData: any) => {
    if (moduleData.percentage >= 90) return { color: 'green', icon: CheckCircle };
    if (moduleData.percentage >= 70) return { color: 'yellow', icon: AlertTriangle };
    return { color: 'red', icon: XCircle };
  };

  const filteredModules = showMissingOnly 
    ? Object.entries(coverage).filter(([, data]) => !data.completed)
    : Object.entries(coverage);

  const overallStats = {
    totalModules: Object.keys(coverage).length,
    completedModules: Object.values(coverage).filter(m => m.completed).length,
    averageCoverage: Object.values(coverage).length > 0 
      ? Math.round(Object.values(coverage).reduce((acc, m) => acc + m.percentage, 0) / Object.keys(coverage).length)
      : 0
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
        >
          <Globe className="h-5 w-5" />
        </Button>
      ) : (
        <Card className="w-96 max-h-[80vh] overflow-hidden shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                🌐 Translation Dev Panel
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                ×
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">
                {language.toUpperCase()}
              </Badge>
              <span>•</span>
              <span>{overallStats.averageCoverage}% coverage</span>
            </div>
          </CardHeader>

          <CardContent className="p-4 overflow-y-auto max-h-[60vh]">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="modules">Modules</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-semibold">{overallStats.totalModules}</div>
                    <div className="text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-semibold">{overallStats.completedModules}</div>
                    <div className="text-muted-foreground">Complete</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Language:</span>
                    <select 
                      value={selectedLanguage} 
                      onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="az">🇦🇿 Azərbaycan</option>
                      <option value="en">🇺🇸 English</option>
                      <option value="ru">🇷🇺 Русский</option>
                      <option value="tr">🇹🇷 Türkçe</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Show missing only:</span>
                    <Switch 
                      checked={showMissingOnly}
                      onCheckedChange={setShowMissingOnly}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="modules" className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredModules
                      .sort(([,a], [,b]) => b.percentage - a.percentage)
                      .map(([module, data]) => {
                        const status = getModuleStatus(data);
                        const StatusIcon = status.icon;
                        
                        return (
                          <div 
                            key={module}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <StatusIcon 
                                className={`h-3 w-3 ${
                                  status.color === 'green' ? 'text-green-500' :
                                  status.color === 'yellow' ? 'text-yellow-500' :
                                  'text-red-500'
                                }`} 
                              />
                              <span className="font-medium">{module}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{data.percentage}%</span>
                              {data.missingKeys && data.missingKeys.length > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {data.missingKeys.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tools" className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    onClick={loadCoverage}
                    disabled={isLoading}
                    className="w-full text-xs"
                    variant="outline"
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Refresh Coverage
                  </Button>
                  
                  <Button 
                    onClick={generateReport}
                    className="w-full text-xs"
                    variant="outline"
                  >
                    <Download className="h-3 w-3 mr-2" />
                    Download Report
                  </Button>
                  
                  <Button 
                    onClick={() => TranslationValidator.clearCache()}
                    className="w-full text-xs"
                    variant="outline"
                  >
                    <Bug className="h-3 w-3 mr-2" />
                    Clear Cache
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground border-t pt-2">
                  <div>Console commands:</div>
                  <div className="font-mono bg-muted p-1 rounded mt-1">
                    TranslationValidator.generateConsoleReport()
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TranslationDevPanel;