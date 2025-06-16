
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';

// Hooks
import { useSchoolCategories } from '@/hooks/categories/useCategoriesWithAssignment';
import { useSchools } from '@/hooks/entities/useSchools';

// Components
import DataEntryTabs from './DataEntryTabs';
import SchoolManagement from './SchoolManagement';
import { SimpleSchoolSelector } from './SimpleSchoolSelector';
// Import DataEntry component from pages
import DataEntry from '@/pages/DataEntry';

interface DataEntryContainerProps {
  assignment?: 'all' | 'sectors';
  strictMode?: boolean;
}

const DataEntryContainer: React.FC<DataEntryContainerProps> = ({ 
  assignment = 'all', 
  strictMode = false 
}) => {
  const { t } = useLanguage();
  const { schoolId: urlSchoolId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);
  
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  // Categories hook-u yeniləmə
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useSchoolCategories({
    assignment,
    strictMode,
    enabled: true
  });

  const { schools, loading: schoolsLoading } = useSchools();


  // School ID management
  useEffect(() => {
    if (urlSchoolId) {
      setSelectedSchoolId(urlSchoolId);
    } else if (userRole === 'schooladmin' && user?.school_id) {
      setSelectedSchoolId(user.school_id);
    }
    setIsLoading(false);
  }, [urlSchoolId, userRole, user]);

  // Loading state
  if (isLoading || categoriesLoading || (userRole === 'sectoradmin' && schoolsLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('loading')}</span>
        </div>
      </div>
    );
  }

  // Error state
  if (categoriesError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {t('errorLoadingCategories')}: {categoriesError.message}
        </AlertDescription>
      </Alert>
    );
  }

  // No categories
  if (categories.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          {strictMode 
            ? 'Məktəb üçün aktiv kateqoriya tapılmadı.' 
            : t('noCategoriesFound')
          }
        </AlertDescription>
      </Alert>
    );
  }

  // School selection for sector admins
  if (userRole === 'sectoradmin' && !selectedSchoolId) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('selectSchool')}</h2>
          <SimpleSchoolSelector
            schools={schools}
            onSchoolSelect={setSelectedSchoolId}
            selectedSchoolId={selectedSchoolId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </CardContent>
      </Card>
    );
  }

  // No school selected
  if (!selectedSchoolId) {
    return (
      <Alert>
        <AlertDescription>
          {t('pleaseSelectSchool')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {userRole === 'sectoradmin' && (
        <SchoolManagement
          selectedSchoolId={selectedSchoolId}
          onSchoolChange={(schoolId) => {
            setSelectedSchoolId(schoolId);
            // Reset selected category when school changes
            setSelectedCategoryId(null);
          }}
          schools={schools}
        />
      )}
      
      <DataEntryTabs
        categories={categories}
        selectedCategory={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
      />

      {selectedCategoryId && selectedSchoolId ? (
        <div className="mt-6">
          <div className="p-4 border rounded-lg bg-muted/50 flex flex-col items-center justify-center">
            {isNavigating ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Məlumat daxil etmə səhifəsinə yönləndirilir...</span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Məlumat daxil etmə səhifəsinə yönləndiriləcəksiniz
                </p>
                <Button 
                  variant="default"
                  onClick={() => {
                    setIsNavigating(true);
                    navigate(`/data-entry/${selectedCategoryId}/${selectedSchoolId}`);
                  }}
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Yönləndirilir...
                    </>
                  ) : (
                    'Məlumat Daxil Etməyə Keçid'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Alert className="mt-6">
          <AlertTitle>Məlumat daxil etmək üçün kateqoriya seçin</AlertTitle>
          <AlertDescription>
            Yuxarıdakı siyahıdan məlumat daxil etmək istədiyiniz kateqoriyanı seçin.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export { DataEntryContainer };
