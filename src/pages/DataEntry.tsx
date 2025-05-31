import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, School, Search, Building } from 'lucide-react';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Custom components and hooks
import DataEntryFormComponent from '@/components/dataEntry/DataEntryForm';
import { useSchoolSelector } from '@/hooks/dataEntry/useSchoolSelector';
import { useSectorCategories } from '@/hooks/dataEntry/useSectorCategories';

/**
 * DataEntry Page Component
 * 
 * This page allows users to enter data for various categories based on their permissions.
 * For school users, it shows categories relevant to their school.
 * For sector admins, it allows selecting a school and viewing/entering data for that school.
 */
const DataEntry = () => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  const permissions = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const categoryIdFromUrl = queryParams.get('categoryId');
  const schoolIdFromUrl = queryParams.get('schoolId');
  
  // User role and permissions state
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('school');
  const isSectorAdmin = permissions?.isSectorAdmin === true;
  
  // Categories and school state
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(schoolIdFromUrl);
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>('');
  
  // Load categories based on current school
  const { categories, isLoading: categoriesLoading, error: categoriesError } = 
    useCategoryData({ schoolId: user?.school_id });
  
  // Load sector categories if user is sector admin
  const { 
    sectorCategories, 
    isLoading: sectorCategoriesLoading, 
    error: sectorCategoriesError 
  } = useSectorCategories({ isSectorAdmin });
  
  // Setup school selector for sector admin
  const {
    schools,
    filteredSchools,
    selectedSchoolId: schoolSelectorSelectedId,
    selectedSchoolName: schoolSelectorSelectedName,
    schoolSearchQuery,
    isLoading: schoolsLoading,
    setSchoolSearchQuery,
    handleSchoolChange,
    setSelectedSchoolId: setSchoolSelectorSelectedId,
    setSelectedSchoolName: setSchoolSelectorSelectedName
  } = useSchoolSelector({ 
    isSectorAdmin, 
    sectorId: user?.sector_id || null 
  });
  
  // Sync selected school between hook and component
  useEffect(() => {
    if (schoolSelectorSelectedId && schoolSelectorSelectedId !== selectedSchoolId) {
      setSelectedSchoolId(schoolSelectorSelectedId);
      setSelectedSchoolName(schoolSelectorSelectedName || '');
    }
  }, [schoolSelectorSelectedId, schoolSelectorSelectedName]);
  
  // Auto-select school from URL if available
  useEffect(() => {
    if (schoolIdFromUrl && isSectorAdmin) {
      setSchoolSelectorSelectedId(schoolIdFromUrl);
      
      // Find and set school name
      const school = schools.find(s => s.id === schoolIdFromUrl);
      if (school) {
        setSchoolSelectorSelectedName(school.name);
        setSelectedSchoolName(school.name);
      }
    }
  }, [schools, schoolIdFromUrl, isSectorAdmin]);
  
  // Set loading state based on data fetching
  useEffect(() => {
    setLoading(
      categoriesLoading || 
      (isSectorAdmin && (sectorCategoriesLoading || schoolsLoading))
    );
  }, [categoriesLoading, sectorCategoriesLoading, schoolsLoading, isSectorAdmin]);
  
  // Determine which school ID to use based on user role
  const effectiveSchoolId = isSectorAdmin 
    ? selectedSchoolId 
    : user?.school_id || null;
  
  // Determine which categories to display
  const displayCategories = isSectorAdmin && tabValue === 'sector'
    ? sectorCategories
    : categories;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-15rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">{t('loading')}</span>
      </div>
    );
  }
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('dataEntry')}</h1>
      </div>
      
      {/* Tabs for sector admin */}
      {isSectorAdmin && (
        <Tabs value={tabValue} onValueChange={setTabValue} className="mb-6">
          <TabsList>
            <TabsTrigger value="school">
              <School className="mr-2 h-4 w-4" />
              {t('schoolCategories')}
            </TabsTrigger>
            <TabsTrigger value="sector">
              <Building className="mr-2 h-4 w-4" />
              {t('sectorCategories')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      
      {/* School selector for sector admin */}
      {isSectorAdmin && tabValue === 'school' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('selectSchool')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 opacity-50" />
                <Input
                  placeholder={t('searchSchools')}
                  value={schoolSearchQuery}
                  onChange={(e) => setSchoolSearchQuery(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schoolsLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('loadingSchools')}
                  </div>
                ) : filteredSchools.length ? (
                  filteredSchools.map((school) => (
                    <Button
                      key={school.id}
                      variant={selectedSchoolId === school.id ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleSchoolChange(school.id)}
                    >
                      <School className="mr-2 h-4 w-4" />
                      {school.name}
                    </Button>
                  ))
                ) : (
                  <p>{t('noSchoolsFound')}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Display warning if no school selected for sector admin */}
      {isSectorAdmin && tabValue === 'school' && !selectedSchoolId && (
        <Alert variant="default" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('noSchoolSelected')}</AlertTitle>
        </Alert>
      )}
      
      {/* Display categories or warning if none available */}
      {!displayCategories?.length ? (
        <Alert variant="default" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('noCategories')}</AlertTitle>
        </Alert>
      ) : (
        // Render data entry form with appropriate props based on tabs and role
        (tabValue === 'sector' || !isSectorAdmin || (isSectorAdmin && selectedSchoolId)) && (
          <DataEntryFormComponent 
            schoolId={effectiveSchoolId || undefined}
            categories={displayCategories}
            initialCategoryId={categoryIdFromUrl || undefined}
            isSectorAdmin={isSectorAdmin}
            schoolName={selectedSchoolName}
          />
        )
      )}
    </div>
  );
};

export default DataEntry;
