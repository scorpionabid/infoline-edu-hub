
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);
  
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Categories hook-u yeniləmə
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useSchoolCategories({
    assignment,
    strictMode,
    enabled: true
  });

  const { schools, loading: schoolsLoading } = useSchools();

  // Debug məlumatları
  useEffect(() => {
    console.log('DataEntryContainer debug:', {
      assignment,
      strictMode,
      categoriesCount: categories.length,
      categories: categories.map(c => ({ id: c.id, name: c.name, assignment: c.assignment })),
      userRole,
      user: user ? { id: user.id, role: userRole } : null
    });
  }, [categories, assignment, strictMode, userRole, user]);

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
          onSchoolChange={setSelectedSchoolId}
          schools={schools}
        />
      )}
      
      <DataEntryTabs
        categories={categories}
        selectedCategory={selectedSchoolId}
        onCategoryChange={setSelectedSchoolId}
      />
    </div>
  );
};

export { DataEntryContainer };
