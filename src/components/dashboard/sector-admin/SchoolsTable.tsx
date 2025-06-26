
import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/contexts/TranslationContext";
import { SchoolStat } from "@/types/dashboard";
import { Eye, Edit, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuthStore, selectUser } from "@/hooks/auth/useAuthStore";
import { useSchools } from "@/hooks/schools/useSchools";
import { usePagination } from "@/hooks/common/usePagination";
import SchoolPagination from "@/components/schools/SchoolPagination";
import { School } from "@/types/school";
import { useSchoolCompletionStats } from "@/hooks/schools/useSchoolCompletionStats";

interface SchoolsTableProps {
  schools?: SchoolStat[]; // Make optional as we'll fetch real data
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({
  schools: propSchools, // Rename to avoid conflict
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);
  
  // Get real schools data based on user role
  const { schools: realSchools, loading: schoolsLoading, error: schoolsError } = useSchools(
    user?.role === 'regionadmin' ? user.region_id : undefined,
    user?.role === 'sectoradmin' ? user.sector_id : undefined
  );
  
  // Only log once when schools are initially loaded
  useEffect(() => {
    if (realSchools.length > 0) {
      console.log('SchoolsTable debug:', { 
        userRole: user?.role, 
        regionId: user?.region_id, 
        sectorId: user?.sector_id,
        realSchoolsCount: realSchools.length,
        schoolsLoading,
        // schoolsError
      });
    }
  }, [realSchools.length, user?.role]); // Only log when these change
  
  // Get completion stats for all schools
  const schoolIds = useMemo(() => realSchools.map(school => school.id), [realSchools]);
  const { getStatsForSchool, loading: statsLoading, error: statsError } = useSchoolCompletionStats(schoolIds);
  
  // Convert School[] to SchoolStat[] format with real completion data
  const schoolStats: SchoolStat[] = realSchools.map((school: School) => {
    const stats = getStatsForSchool(school.id);
    
    return {
      id: school.id,
      name: school.name,
      completed: stats?.approvedEntries || 0, // Required by SchoolStat interface
      total: stats?.totalColumns || 0, // Required by SchoolStat interface
      percentage: stats?.completionRate || school.completion_rate || 0, // Fallback to school's own completion_rate
      status: school.status, // Required by SchoolStat interface
      completionRate: stats?.completionRate || school.completion_rate || 0,
      pendingForms: stats?.pendingEntries || 0,
      totalForms: stats?.totalColumns || 0,
      lastUpdated: stats?.lastUpdated?.toISOString() || school.updated_at || school.created_at
    };
  });
  
  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    totalItems,
    startIndex,
    // endIndex
  } = usePagination(schoolStats, 5); // 5 schools per page
  
  if (schoolsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("schools") || "Məktəblər"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("loading") || "Yüklənir..."}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paginatedItems || paginatedItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("schools") || "Məktəblər"}</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="text-center py-8 text-muted-foreground">
        <p>{t("noSchoolsFound") || "Məktəb tapılmadı"}</p>
          {schoolsError && (
              <p className="text-red-500 text-sm mt-2">Error: {schoolsError.message}</p>
          )}
        </div>
      </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("schools") || "Məktəblər"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paginatedItems.map((school) => (
            <div
              key={school.id}
              className="flex items-start justify-between p-6 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{school.name}</h3>
                  <div className="flex items-center space-x-2">
                    {/* Status indicators */}
                    {school.pendingForms > 0 && (
                      <div className="flex items-center text-yellow-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-xs">{school.pendingForms}</span>
                      </div>
                    )}
                    {school.completed > 0 && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">{school.completed}</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {Math.round(school.completionRate)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full">
                    <Progress value={school.completionRate} className="h-2" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {t("totalFields") || "Ümumi sahələr"}: {school.totalForms || 0}
                    </span>
                    <span>
                      {t("filled") || "Doldurulmuş"}: {school.completed || 0}
                    </span>
                    <span>
                      {t("pending") || "Gözləyən"}: {school.pendingForms || 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(school.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(school.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(school.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <SchoolPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {t("showingResults") || "Nəticələr"}: {startIndex}-{endIndex} / {totalItems}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{t("itemsPerPage") || "Səhifə başına"}:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolsTable;
