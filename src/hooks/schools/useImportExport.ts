
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/supabase';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { exportSchoolsToExcel, generateExcelTemplate, importSchoolsFromExcel, mapRegionNameToId, mapSectorNameToId } from '@/utils/excelUtils';
import { useRegions } from '../useRegions';
import { useSectors } from '../useSectors';
import { useCreateUser } from '../useCreateUser';

export const useImportExport = (onComplete: () => void) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { t } = useLanguage();
  const { regions } = useRegions();
  const { sectors } = useSectors();
  const { createUser } = useCreateUser();

  // Map üçün region və sektorları hazırlayırıq
  const regionNames = regions.reduce((acc, region) => ({
    ...acc,
    [region.id]: region.name
  }), {} as {[key: string]: string});

  const sectorNames = sectors.reduce((acc, sector) => ({
    ...acc,
    [sector.id]: sector.name
  }), {} as {[key: string]: string});

  const handleExportToExcel = useCallback(async (schools: School[]) => {
    setIsExporting(true);
    try {
      exportSchoolsToExcel(schools, regionNames, sectorNames);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('exportFailed'), {
        description: t('exportFailedDescription')
      });
    } finally {
      setIsExporting(false);
    }
  }, [regionNames, sectorNames, t]);

  const createSchoolAdmin = useCallback(async (school: Partial<School>, adminData: any) => {
    if (!adminData || !adminData.email) {
      return;
    }

    try {
      console.log(`Məktəb ${school.id} üçün admin yaradılır: ${adminData.email}`);
      
      // İstifadəçi adı (email) mövcuddurmu yoxlayaq
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', adminData.email)
        .limit(1);

      if (userError) {
        console.error('İstifadəçi axtarışı zamanı xəta:', userError);
        throw userError;
      }

      // İstifadəçi mövcuddursa, məktəbə admin olaraq təyin et
      if (existingUser && existingUser.length > 0) {
        const adminId = existingUser[0].id;
        console.log(`Mövcud admin ${adminId} məktəbə təyin edilir`);
        
        try {
          // Məktəb adminini təyin et
          const { data, error } = await supabase.functions.invoke('assign-school-admin', {
            body: {
              userId: adminId,
              schoolId: school.id,
              regionId: school.region_id,
              sectorId: school.sector_id
            }
          });

          if (error) {
            console.error('Admin təyin edilərkən edge function xətası:', error);
            throw error;
          }

          console.log('Admin təyin edildi:', data);
        } catch (assignError) {
          console.error('Admin təyin edilərkən xəta:', assignError);
          throw assignError;
        }
        
        return;
      }

      // Yeni admin əlavə et
      const adminFullName = adminData.name || adminData.email.split('@')[0];
      const adminPassword = adminData.password || 'InfoLine2024!'; // Default şifrə təyin et
      
      console.log(`Yeni admin yaradılır: ${adminFullName} (${adminData.email})`);
      
      // UserFormData tipinə uyğun obyekt yaradırıq
      const userData = {
        name: adminFullName, 
        full_name: adminFullName, 
        email: adminData.email,
        password: adminPassword,
        role: 'schooladmin' as const,
        schoolId: school.id,
        regionId: school.region_id,
        sectorId: school.sector_id,
        phone: adminData.phone || null,
        language: 'az',
        status: 'active' as const
      };
      
      // İstifadəçi yarat
      const result = await createUser(userData);
      console.log('Yeni admin yaradıldı:', result);
      
    } catch (error) {
      console.error('Admin təyin edilərkən xəta:', error);
      throw error;
    }
  }, [createUser]);

  const handleImportSchools = useCallback(async (schools: Partial<School>[]) => {
    setIsImporting(true);
    try {
      // Əgər schools boş və ya undefined isə, erkən çıxırıq
      if (!schools || schools.length === 0) {
        toast.error(t('noDataToImport'));
        return;
      }

      console.log(`${schools.length} məktəb idxal edilir...`);

      let successCount = 0;
      let errorCount = 0;
      let adminSuccessCount = 0;
      let adminErrorCount = 0;
      let existingUpdateCount = 0;

      // Hər bir məktəbi əlavə edirik
      for (const [index, school] of schools.entries()) {
        try {
          console.log(`[${index + 1}/${schools.length}] Məktəb işlənir: ${school.name}`);
          
          // Əgər region və sektor adları varsa, ID-lərə çeviririk
          if ((school as any).regionName) {
            school.region_id = await mapRegionNameToId((school as any).regionName);
          }
          
          if ((school as any).sectorName) {
            school.sector_id = await mapSectorNameToId((school as any).sectorName, school.region_id);
          }
          
          // Zəruri sahələrin olduğunu yoxlayırıq
          if (!school.name || !school.region_id || !school.sector_id) {
            console.error('Məktəb üçün zəruri sahələr çatışmır:', school);
            errorCount++;
            continue;
          }

          // Admin məlumatlarını saxlayaq
          const adminData = (school as any).adminData;
          delete (school as any).adminData;
          delete (school as any).regionName;
          delete (school as any).sectorName;

          // Məktəb ID varsa (mövcud məktəb yenilənir)
          let schoolResult;
          if (school.id) {
            console.log(`Mövcud məktəb yenilənir: ${school.id}`);
            
            // Məktəbin mövcud olduğunu yoxlayaq
            const { data: existingSchool, error: checkError } = await supabase
              .from('schools')
              .select('id')
              .eq('id', school.id)
              .single();
              
            if (checkError || !existingSchool) {
              console.error(`ID ilə məktəb tapılmadı: ${school.id}`);
              errorCount++;
              continue;
            }
            
            // Məktəbi yeniləyək
            const { data, error } = await supabase
              .from('schools')
              .update({
                name: school.name,
                region_id: school.region_id,
                sector_id: school.sector_id,
                principal_name: school.principal_name || null,
                address: school.address || null,
                phone: school.phone || null,
                email: school.email || null,
                student_count: school.student_count || null,
                teacher_count: school.teacher_count || null,
                status: school.status || 'active',
                type: school.type || null,
                language: school.language || null,
                admin_email: adminData?.email || school.admin_email || null
              })
              .eq('id', school.id)
              .select()
              .single();
              
            if (error) {
              console.error('Məktəbi yeniləyərkən xəta:', error);
              errorCount++;
              continue;
            }
            
            schoolResult = data;
            existingUpdateCount++;
          } else {
            // Yeni məktəb əlavə edilir
            console.log(`Yeni məktəb əlavə edilir: ${school.name}`);
            
            // Supabase tələb etdiyi formata uyğunlaşdırırıq
            const schoolData = {
              name: school.name,
              region_id: school.region_id,
              sector_id: school.sector_id,
              principal_name: school.principal_name || null,
              address: school.address || null,
              phone: school.phone || null,
              email: school.email || null,
              student_count: school.student_count || null,
              teacher_count: school.teacher_count || null,
              status: school.status || 'active',
              type: school.type || null,
              language: school.language || null,
              admin_email: adminData?.email || school.admin_email || null
            };

            // Məktəbi əlavə edirik
            const { data, error } = await supabase
              .from('schools')
              .insert([schoolData])
              .select()
              .single();

            if (error) {
              console.error('Məktəb əlavə edilərkən xəta:', error);
              errorCount++;
              continue;
            }
            
            schoolResult = data;
            successCount++;
          }
          
          // Admin təyin edirik
          if (adminData?.email && schoolResult) {
            try {
              await createSchoolAdmin(schoolResult, adminData);
              adminSuccessCount++;
            } catch (adminError) {
              console.error('Admin təyin edilərkən xəta:', adminError);
              adminErrorCount++;
            }
          }
        } catch (err) {
          console.error('Məktəb idxalı zamanı xəta:', err);
          errorCount++;
        }
      }

      // Nəticəni bildiririk
      if (successCount > 0 || existingUpdateCount > 0) {
        let successMsg = '';
        if (successCount > 0) {
          successMsg += `${successCount} yeni məktəb əlavə edildi. `;
        }
        if (existingUpdateCount > 0) {
          successMsg += `${existingUpdateCount} mövcud məktəb yeniləndi. `;
        }
        
        toast.success(
          t('importCompleted'), 
          { description: successMsg }
        );
        
        if (adminSuccessCount > 0) {
          toast.success(
            `${adminSuccessCount} ${t('adminsAssignedSuccessfully')}`, 
            { description: t('schoolAdminsAssigned') }
          );
        }
        
        onComplete(); // Məlumatları yeniləmək üçün callback-i çağırırıq
      }

      if (errorCount > 0) {
        toast.error(
          `${errorCount} ${t('schoolsFailedToImport')}`,
          { description: t('checkDataAndTryAgain') }
        );
      }
      
      if (adminErrorCount > 0) {
        toast.error(
          `${adminErrorCount} ${t('adminsFailedToAssign')}`,
          { description: t('checkAdminDataAndTryAgain') }
        );
      }
    } catch (error) {
      console.error('Ümumi idxal xətası:', error);
      toast.error(t('importFailed'), {
        description: t('importFailedDescription')
      });
    } finally {
      setIsImporting(false);
    }
  }, [t, onComplete, createSchoolAdmin]);

  return {
    isImportDialogOpen,
    isExporting,
    isImporting,
    setIsImportDialogOpen,
    handleExportToExcel,
    handleImportSchools
  };
};
