
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Beaker } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import DataEntryFormExample from '@/components/examples/DataEntryFormExample';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Forms: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showTest, setShowTest] = useState(false);
  const [testCategoryId, setTestCategoryId] = useState<string>('');
  const [testSchoolId, setTestSchoolId] = useState<string>('');

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('forms')}</h1>
        <Button onClick={() => navigate('/categories/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('addCategory')}
        </Button>
      </div>
      
      <Tabs defaultValue="main" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="main">Form Modulları</TabsTrigger>
          <TabsTrigger value="test">Test Komponenti</TabsTrigger>
        </TabsList>
        
        <TabsContent value="main">
          <Card className="mb-6 p-6">
            <CardContent className="pt-0">
              <p className="text-muted-foreground">
                {t('formsPageDescription')}
              </p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/categories')}
                >
                  {t('manageCategories')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="test">
          <Card className="mb-6 p-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Beaker className="mr-2 h-5 w-5" /> 
                Yeni Hook Sistemi Testi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-muted-foreground mb-4">
                  Bu test komponenti, yeni hook strukturunu sınaqdan keçirmək üçün istifadə olunur. 
                  Kateqoriya ID və Məktəb ID daxil edərək test edə bilərsiniz.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kateqoriya ID</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md" 
                      value={testCategoryId}
                      onChange={(e) => setTestCategoryId(e.target.value)}
                      placeholder="Kateqoriya ID daxil edin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Məktəb ID</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md" 
                      value={testSchoolId}
                      onChange={(e) => setTestSchoolId(e.target.value)}
                      placeholder="Məktəb ID daxil edin"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowTest(true)}
                  disabled={!testCategoryId || !testSchoolId}
                >
                  Test Komponenti Göstər
                </Button>
              </div>
              
              {showTest && testCategoryId && testSchoolId && (
                <div className="mt-6 border-t pt-6">
                  <DataEntryFormExample
                    categoryId={testCategoryId}
                    schoolId={testSchoolId}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Forms;
