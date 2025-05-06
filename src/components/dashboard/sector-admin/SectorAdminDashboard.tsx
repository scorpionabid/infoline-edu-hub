import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Grid } from '@/components/ui/grid';
import { SchoolStat } from '@/types/school';
import { FormCategory } from '@/types/forms';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SectorAdminDashboard = () => {
  const { user, userRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectorId, setSectorId] = useState<string | null>(null);
  const [sectorName, setSectorName] = useState<string>('');
  const [sectorSchools, setSectorSchools] = useState<SchoolStat[]>([]);
  const [categories, setCategories] = useState<FormCategory[]>([]);
  
  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        setLoading(true);
        
        if (!user || !userRole) {
          throw new Error('User or role information is missing');
        }
        
        // Get sector ID from user role
        if (userRole.sector_id) {
          setSectorId(userRole.sector_id);
          
          // Get sector name
          const { data: sectorData, error: sectorError } = await supabase
            .from('sectors')
            .select('name')
            .eq('id', userRole.sector_id)
            .single();
            
          if (sectorError) throw sectorError;
          if (sectorData) setSectorName(sectorData.name);
          
          // Get schools in this sector
          const { data: schoolsData, error: schoolsError } = await supabase
            .from('schools')
            .select('id, name, status, completion_rate')
            .eq('sector_id', userRole.sector_id);
            
          if (schoolsError) throw schoolsError;
          
          // Get form completion data for each school
          const schoolStats = await Promise.all(
            (schoolsData || []).map(async (school) => {
              // Get total forms count
              const { data: categoriesData, error: catError } = await supabase
                .from('categories')
                .select('id')
                .eq('status', 'active');
                
              if (catError) throw catError;
              
              const totalForms = categoriesData?.length || 0;
              
              // Get completed forms count
              const { data: completedData, error: compError } = await supabase
                .from('data_entries')
                .select('category_id')
                .eq('school_id', school.id)
                .eq('status', 'approved')
                .distinct();
                
              if (compError) throw compError;
              
              const formsCompleted = completedData?.length || 0;
              
              return {
                ...school,
                totalForms,
                formsCompleted
              };
            })
          );
          
          setSectorSchools(schoolStats);
          
          // Get categories
          const { data: categoriesData, error: catError } = await supabase
            .from('categories')
            .select('id, name, description, status, deadline')
            .eq('status', 'active');
            
          if (catError) throw catError;
          
          // Calculate completion rate for each category
          const categoriesWithCompletion = await Promise.all(
            (categoriesData || []).map(async (category) => {
              // Get total schools count
              const totalSchools = schoolStats.length;
              
              // Get schools that completed this category
              const { data: completedData, error: compError } = await supabase
                .from('data_entries')
                .select('school_id')
                .eq('category_id', category.id)
                .eq('status', 'approved')
                .distinct();
                
              if (compError) throw compError;
              
              const completedSchools = completedData?.length || 0;
              const completionRate = totalSchools > 0 
                ? Math.round((completedSchools / totalSchools) * 100) 
                : 0;
              
              return {
                ...category,
                completionRate
              };
            })
          );
          
          setCategories(categoriesWithCompletion);
        }
      } catch (err: any) {
        console.error('Error fetching sector data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSectorData();
  }, [user, userRole]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('sectorDashboard')}: {sectorName}</h1>
      </div>
      
      <Tabs defaultValue="schools">
        <TabsList>
          <TabsTrigger value="schools">{t('schools')}</TabsTrigger>
          <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schools" className="space-y-4 mt-4">
          <Grid cols={{ default: 1, md: 2, lg: 3 }} gap="gap-4">
            {schoolStats.map((school) => (
              <Card key={school.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{school.name}</CardTitle>
                  <CardDescription>
                    {t('formsCompleted')}: {school.formsCompleted}/{school.totalForms}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={school.completion_rate || 0} className="h-2" />
                    <div className="text-sm text-right">
                      {school.completion_rate || 0}%
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate(`/schools/${school.id}`)}
                    >
                      {t('viewDetails')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Grid>
          
          {schoolStats.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t('noSchoolsFound')}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4 mt-4">
          <Grid cols={{ default: 1, md: 2, lg: 3 }} gap="gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>
                    {category.description || t('noDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={category.completionRate || 0} className="h-2" />
                    <div className="text-sm text-right">
                      {category.completionRate || 0}%
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate(`/categories/${category.id}`)}
                    >
                      {t('viewDetails')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Grid>
          
          {categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t('noCategoriesFound')}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SectorAdminDashboard;
