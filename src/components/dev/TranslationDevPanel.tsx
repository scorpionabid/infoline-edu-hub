
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useSmartTranslation } from '@/hooks/translation/useSmartTranslation';
import { useTranslationValidation } from '@/hooks/translation/useTranslationValidation';
import { translationCache } from '@/services/translationCache';
import { TranslationValidator } from '@/utils/translationValidator';
import { 
  Code, 
  CheckCircle, 
  XCircle, 
  Search, 
  FileText,
  Globe,
  Activity,
  RefreshCw
} from 'lucide-react';
import type { SupportedLanguage } from '@/types/translation';

export const TranslationDevPanel: React.FC = () => {
  const [testKey, setTestKey] = useState('dashboard.title');
  const [testParams, setTestParams] = useState('{}');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('az');
  const [validationResults, setValidationResults] = useState<any>(null);

  const { t, tSafe, tContext, language, setLanguage, isLoading, error } = useSmartTranslation();
  const { tModule, tValidation, tComponent } = useTranslationValidation();

  const testTranslation = () => {
    try {
      const params = JSON.parse(testParams || '{}');
      const result = {
        t: t(testKey, params),
        tSafe: tSafe(testKey, 'FALLBACK', { interpolation: params }),
        tContext: tContext(testKey, params)
      };
      console.log('Translation Test Results:', result);
    } catch (error) {
      console.error('Translation test failed:', error);
    }
  };

  const runValidation = async () => {
    try {
      const result = await TranslationValidator.validateModule('dashboard', selectedLanguage);
      setValidationResults(result);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const clearCache = () => {
    translationCache.clear();
    console.log('Translation cache cleared');
  };

  const generateReport = async () => {
    try {
      await TranslationValidator.generateConsoleReport(selectedLanguage);
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  };

  const getCacheInfo = () => {
    return translationCache.getInfo();
  };

  const languages: SupportedLanguage[] = ['az', 'en', 'ru', 'tr'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Translation Dev Panel</h2>
          <p className="text-muted-foreground">
            Development alətləri translation sisteminin test edilməsi üçün
          </p>
        </div>
        <Badge variant={isLoading ? "secondary" : error ? "destructive" : "default"}>
          {isLoading ? 'Loading' : error ? 'Error' : 'Ready'}
        </Badge>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium">Active Language</Label>
              <div className="text-lg font-bold">{language.toUpperCase()}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Loading State</Label>
              <div className={`text-lg font-bold ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                {isLoading ? 'Loading' : 'Ready'}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Error State</Label>
              <div className={`text-lg font-bold ${error ? 'text-red-600' : 'text-green-600'}`}>
                {error ? 'Error' : 'OK'}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Cache Status</Label>
              <div className="text-lg font-bold text-blue-600">
                {getCacheInfo().languages.length} Languages
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="test" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test">Test Translations</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
          <TabsTrigger value="tools">Dev Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Translation Tester
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testKey">Translation Key</Label>
                  <Input
                    id="testKey"
                    value={testKey}
                    onChange={(e) => setTestKey(e.target.value)}
                    placeholder="dashboard.title"
                  />
                </div>
                <div>
                  <Label htmlFor="testParams">Parameters (JSON)</Label>
                  <Input
                    id="testParams"
                    value={testParams}
                    onChange={(e) => setTestParams(e.target.value)}
                    placeholder='{"name": "John"}'
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Live Translation Result</Label>
                  <div className="p-3 bg-gray-50 border rounded-md">
                    <code className="text-sm">
                      {(() => {
                        try {
                          const params = JSON.parse(testParams || '{}');
                          return t(testKey, params);
                        } catch {
                          return 'Invalid JSON parameters';
                        }
                      })()}
                    </code>
                  </div>
                </div>
                <div>
                  <Label>Safe Translation Result</Label>
                  <div className="p-3 bg-blue-50 border rounded-md">
                    <code className="text-sm">
                      {(() => {
                        try {
                          const params = JSON.parse(testParams || '{}');
                          return tSafe(testKey, 'FALLBACK', { interpolation: params });
                        } catch {
                          return 'Invalid JSON parameters';
                        }
                      })()}
                    </code>
                  </div>
                </div>
              </div>

              <Button onClick={testTranslation} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Test Translation (Check Console)
              </Button>

              {/* Quick Tests */}
              <div className="space-y-2">
                <Label>Quick Tests</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    'dashboard.title',
                    'navigation.dashboard', 
                    'ui.save',
                    'validation.required',
                    'auth.login',
                    'general.welcome'
                  ].map((key) => (
                    <Button 
                      key={key}
                      variant="outline" 
                      size="sm"
                      onClick={() => setTestKey(key)}
                    >
                      {key}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Translation Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Select Language</Label>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                    className="w-full p-2 border rounded-md"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={runValidation}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Run Validation
                </Button>
              </div>

              {validationResults && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {validationResults.valid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      Validation {validationResults.valid ? 'Passed' : 'Failed'}
                    </span>
                    <Badge variant="secondary">
                      {validationResults.coverage}% Coverage
                    </Badge>
                  </div>

                  {validationResults.missingKeys?.length > 0 && (
                    <div>
                      <Label>Missing Keys ({validationResults.missingKeys.length})</Label>
                      <Textarea 
                        value={validationResults.missingKeys.join('\n')}
                        readOnly
                        className="h-32"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Cache Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cache Information</Label>
                  <div className="p-3 bg-gray-50 border rounded-md">
                    <pre className="text-xs">
                      {JSON.stringify(getCacheInfo(), null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button onClick={clearCache} variant="destructive" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Translation Cache
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map(lang => (
                      <Button 
                        key={lang}
                        variant="outline" 
                        size="sm"
                        onClick={() => setLanguage(lang)}
                      >
                        Load {lang.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Development Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateReport} className="w-full">
                <Globe className="mr-2 h-4 w-4" />
                Generate Coverage Report (Console)
              </Button>
              
              <div className="space-y-2">
                <Label>Helper Functions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => console.log('tModule test:', tModule('dashboard', 'title'))}
                  >
                    Test tModule
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => console.log('tValidation test:', tValidation('name', 'required'))}
                  >
                    Test tValidation
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => console.log('tComponent test:', tComponent('button', 'save'))}
                  >
                    Test tComponent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TranslationDevPanel;
