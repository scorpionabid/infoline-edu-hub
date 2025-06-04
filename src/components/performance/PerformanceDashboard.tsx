
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import PerformanceMonitor from './PerformanceMonitor';
import LazyLoadingWrapper from './LazyLoadingWrapper';
import VirtualTable from './VirtualTable';
import { Monitor, Zap, Database, Image } from 'lucide-react';

const PerformanceDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('monitor');

  // Sample data for virtual table demo
  const sampleData = Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'inactive',
    value: Math.floor(Math.random() * 1000)
  }));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('performanceOptimization')}</h1>
          <p className="text-muted-foreground">{t('performanceOptimizationDescription')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitor">
            <Monitor className="h-4 w-4 mr-1" />
            {t('monitoring')}
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <Zap className="h-4 w-4 mr-1" />
            {t('optimization')}
          </TabsTrigger>
          <TabsTrigger value="virtualization">
            <Database className="h-4 w-4 mr-1" />
            {t('virtualization')}
          </TabsTrigger>
          <TabsTrigger value="lazy-loading">
            <Image className="h-4 w-4 mr-1" />
            {t('lazyLoading')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          <PerformanceMonitor />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('codeOptimization')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">{t('bundleAnalysis')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('bundleAnalysisDescription')}
                  </p>
                  <Button variant="outline" size="sm">
                    {t('analyzeBundles')}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">{t('codesplitting')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('codeSplittingDescription')}
                  </p>
                  <Button variant="outline" size="sm">
                    {t('optimizeCodeSplitting')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('memoryOptimization')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">{t('memoryLeaks')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('memoryLeaksDescription')}
                  </p>
                  <Button variant="outline" size="sm">
                    {t('detectMemoryLeaks')}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">{t('garbageCollection')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('garbageCollectionDescription')}
                  </p>
                  <Button variant="outline" size="sm">
                    {t('forceGarbageCollection')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="virtualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('virtualScrollingDemo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('virtualScrollingDescription', { count: sampleData.length })}
                </p>
                
                <VirtualTable
                  items={sampleData}
                  itemHeight={50}
                  height={400}
                  renderItem={(item, index) => (
                    <div className="flex items-center justify-between p-3 border-b">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">#{item.id}</span>
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === 'active' ? 'bg-green-100 text-green-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-sm text-muted-foreground">{item.value}</span>
                      </div>
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lazy-loading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('lazyLoadingDemo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('lazyLoadingDescription')}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <LazyLoadingWrapper key={index} height="200px">
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </CardContent>
                      </Card>
                    </LazyLoadingWrapper>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
