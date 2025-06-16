import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";
import PerformanceMonitor from "./PerformanceMonitor";
import LazyLoadingWrapper from "./LazyLoadingWrapper";
import VirtualTable from "./VirtualTable";
import { Monitor, Zap, Database, Loader2 } from "lucide-react";

const PerformanceDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("monitor");

  // Sample data for virtual table demo
  const sampleData = Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    status: i % 3 === 0 ? "active" : i % 3 === 1 ? "pending" : "inactive",
    value: Math.floor(Math.random() * 1000),
  }));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performans Optimallaşdırması</h1>
          <p className="text-muted-foreground">
            Sistem performansını izləyin və optimallaşdırın
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitor">
            <Monitor className="h-4 w-4 mr-1" />
            Monitorinq
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <Zap className="h-4 w-4 mr-1" />
            Optimallaşdırma
          </TabsTrigger>
          <TabsTrigger value="virtualization">
            <Database className="h-4 w-4 mr-1" />
            Virtuallaşdırma
          </TabsTrigger>
          <TabsTrigger value="lazy-loading">
            <Loader2 className="h-4 w-4 mr-1" />
            Lazy Loading
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          <PerformanceMonitor />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Kod Optimallaşdırması</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Bundle Analizi</h4>
                  <p className="text-sm text-muted-foreground">
                    JavaScript bundle ölçülərini analiz edin
                  </p>
                  <Button variant="outline" size="sm">
                    Bundle-ları Analiz Et
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Code Splitting</h4>
                  <p className="text-sm text-muted-foreground">
                    Kodları kiçik hissələrə bölərək yükləmə performansını
                    artırın
                  </p>
                  <Button variant="outline" size="sm">
                    Code Splitting Optimallaşdır
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yaddaş Optimallaşdırması</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Yaddaş Sızıntıları</h4>
                  <p className="text-sm text-muted-foreground">
                    Potensial yaddaş sızıntılarını aşkar edin
                  </p>
                  <Button variant="outline" size="sm">
                    Yaddaş Sızıntılarını Tap
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Garbage Collection</h4>
                  <p className="text-sm text-muted-foreground">
                    İstifadə olunmayan obyektləri təmizləyin
                  </p>
                  <Button variant="outline" size="sm">
                    Garbage Collection Başlat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="virtualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Virtual Scrolling Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {sampleData.length} məlumat ilə virtual scrolling nümayişi
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
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            item.status === "active"
                              ? "bg-green-100 text-green-800"
                              : item.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.value}
                        </span>
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
              <CardTitle>Lazy Loading Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Komponentlərin tənbəl yüklənmə nümayişi
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
