import React from 'react';
import { School } from '@/types/school';
import { useSchoolDialogHandlers } from '@/hooks/schools/useSchoolDialogHandlers';
import { useSchoolsData } from '@/hooks/schools/useSchoolsData';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SchoolAdminDialog } from './SchoolAdminDialog';
import { SchoolDeleteDialog } from './SchoolDeleteDialog';
import { SchoolEditDialog } from './SchoolEditDialog';
import { SchoolAddDialog } from './SchoolAddDialog';

const SchoolsContainer: React.FC = () => {
  const { t } = useLanguage();
  const [search, setSearch] = React.useState<string>('');

  const {
    schools,
    isLoading,
    error,
    addSchool,
    updateSchool,
    deleteSchool,
    assignAdmin,
    unassignAdmin,
    resetPassword,
  } = useSchoolsData();

  const {
    isDeleteDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    isAdminDialogOpen,
    selectedSchool,
    selectedAdmin,
    closeDeleteDialog,
    closeEditDialog,
    closeAddDialog,
    closeAdminDialog,
    handleAddDialogOpen,
    handleEditDialogOpen,
    handleDeleteDialogOpen,
    handleAdminDialogOpen,
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteConfirmFromHook,
    handleAdminUpdate,
    handleResetPassword,
    formData,
    currentTab,
    setCurrentTab,
    handleFormChange,
    setFormData,
  } = useSchoolDialogHandlers();

  const filteredSchools = React.useMemo(() => {
    if (!schools) return [];
    return schools.filter(school =>
      school.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [schools, search]);

  const handleDeleteConfirm = () => {
    if (selectedSchool) {
      handleDeleteConfirmHelper(selectedSchool);
    }
  };

  const handleDeleteConfirmHelper = async (school: School) => {
    closeDeleteDialog();
    // Buraya kod əlavə edilməlidir əgər silmə əməliyyatı olacaqsa
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <h1 className="text-2xl font-bold tracking-tight">{t('schools')}</h1>
        <Button onClick={handleAddDialogOpen}>
          <Plus className="mr-2 h-4 w-4" /> {t('addSchool')}
        </Button>
      </div>

      <div className="rounded-md border mt-4">
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">{t('allSchools')}</TabsTrigger>
            <TabsTrigger value="active">{t('activeSchools')}</TabsTrigger>
            <TabsTrigger value="inactive">{t('inactiveSchools')}</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchByName')}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-primary"
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {/* Search Icon */}
              </span>
            </div>

            <Table>
              <TableCaption>{t('allSchoolsCaption')}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">{t('id')}</TableHead>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('region')}</TableHead>
                  <TableHead>{t('sector')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.id}</TableCell>
                    <TableCell>{school.name}</TableCell>
                    <TableCell>{school.regionName}</TableCell>
                    <TableCell>{school.sectorName}</TableCell>
                    <TableCell>{school.status}</TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditDialogOpen(school)}
                      >
                        {t('edit')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDialogOpen(school)}
                      >
                        {t('delete')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdminDialogOpen(school)}
                      >
                        {t('admin')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="active">
            <div>Active Schools Content</div>
          </TabsContent>
          <TabsContent value="inactive">
            <div>Inactive Schools Content</div>
          </TabsContent>
        </Tabs>
      </div>

      <SchoolAddDialog
        isOpen={isAddDialogOpen}
        onOpenChange={closeAddDialog}
        onAddSchool={addSchool}
        onClose={closeAddDialog}
      />

      <SchoolEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={closeEditDialog}
        school={selectedSchool}
        onUpdateSchool={updateSchool}
        onClose={closeEditDialog}
      />

      <SchoolDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={closeDeleteDialog}
        school={selectedSchool}
        onDeleteSchool={deleteSchool}
        onClose={closeDeleteDialog}
      />

      <SchoolAdminDialog
        isOpen={isAdminDialogOpen}
        onOpenChange={closeAdminDialog}
        school={selectedSchool}
        onAssignAdmin={assignAdmin}
        onUnassignAdmin={unassignAdmin}
        onResetPassword={resetPassword}
        onClose={closeAdminDialog}
      />
    </div>
  );
};

export default SchoolsContainer;
