
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useLanguage } from '@/context/LanguageContext';
import { School } from '@/types/supabase';
import { adaptSchoolToSupabase } from '@/types/supabase';

interface UseImportExportProps {
  onSuccess?: () => void;
}

export const useImportExport = ({ onSuccess }: UseImportExportProps = {}) => {
  const { t } = useLanguage();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Excel-ə ixrac funksiyası
  const handleExportToExcel = useCallback((schools: School[]) => {
    try {
      setIsExporting(true);
      
      // Excel üçün məlumatları hazırla
      const data = schools.map(school => ({
        'Məktəb adı': school.name,
        'Direktor': school.principalName || school.principal_name || '',
        'Ünvan': school.address || '',
        'Telefon': school.phone || '',
        'E-poçt': school.email || '',
        'Şagird sayı': school.studentCount || school.student_count || 0,
        'Müəllim sayı': school.teacherCount || school.teacher_count || 0,
        'Tədris dili': school.language || '',
        'Məktəb növü': school.type || '',
        'Status': (school.status === 'active') ? 'Aktiv' : 'Deaktiv',
        'Admin e-poçtu': school.adminEmail || school.admin_email || ''
      }));
      
      // Excel sənədi yarat
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Məktəblər');
      
      // Excel faylını hazırla və yüklə
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Faylı yüklə
      saveAs(blob, `Məktəblər_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success(t('exportSuccess') || 'İxrac uğurla tamamlandı');
      setIsExporting(false);
    } catch (error) {
      console.error('Excel ixracı zamanı xəta:', error);
      toast.error(t('exportError') || 'İxrac zamanı xəta baş verdi');
      setIsExporting(false);
    }
  }, [t]);

  // Excel-dən idxal funksiyası
  const handleImportSchools = useCallback(async (file: File) => {
    if (!file) {
      toast.error(t('noFileSelected') || 'Fayl seçilməyib');
      return;
    }
    
    try {
      setIsImporting(true);
      
      // Faylı oxu
      const reader = new FileReader();
      
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Excel məlumatlarını obyektlərə çevir
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
          
          if (jsonData.length === 0) {
            toast.error(t('emptyFile') || 'Fayl boşdur və ya düzgün formatda deyil');
            setIsImporting(false);
            return;
          }
          
          // Məktəbləri Supabase formatına çevir
          const schools = jsonData.map(row => ({
            name: row['Məktəb adı'],
            principal_name: row['Direktor'],
            address: row['Ünvan'],
            phone: row['Telefon'],
            email: row['E-poçt'],
            student_count: parseInt(row['Şagird sayı']) || 0,
            teacher_count: parseInt(row['Müəllim sayı']) || 0,
            language: row['Tədris dili'],
            type: row['Məktəb növü'],
            status: row['Status'] === 'Aktiv' ? 'active' as 'active' | 'inactive' : 'inactive' as 'active' | 'inactive',
            admin_email: row['Admin e-poçtu'],
            region_id: row['Region ID'],
            sector_id: row['Sektor ID']
          }));
          
          // Məlumatları doğrula
          if (!validateSchools(schools)) {
            setIsImporting(false);
            return;
          }
          
          // Məktəbləri Supabase-ə əlavə et
          const { data: insertedData, error } = await supabase
            .from('schools')
            .insert(schools);
          
          if (error) throw error;
          
          toast.success(t('importSuccess') || 'İdxal uğurla tamamlandı', {
            description: t('importSuccessCount', { count: schools.length }) || `${schools.length} məktəb uğurla idxal edildi`
          });
          
          // Dialog-u bağla və callback funksiyasını çağır
          setIsImportDialogOpen(false);
          if (onSuccess) onSuccess();
        } catch (error) {
          console.error('Excel idxalı zamanı xəta:', error);
          toast.error(t('importError') || 'İdxal zamanı xəta baş verdi');
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.onerror = () => {
        toast.error(t('fileReadError') || 'Fayl oxunarkən xəta baş verdi');
        setIsImporting(false);
      };
      
      reader.readAsBinaryString(file);
      
    } catch (error) {
      console.error('Excel idxalı zamanı xəta:', error);
      toast.error(t('importError') || 'İdxal zamanı xəta baş verdi');
      setIsImporting(false);
    }
  }, [t, onSuccess]);

  // Məktəbləri doğrulama funksiyası
  const validateSchools = (schools: any[]): boolean => {
    // Zəruri sahələri yoxla
    const invalidSchools = schools.filter(school => !school.name || !school.region_id || !school.sector_id);
    
    if (invalidSchools.length > 0) {
      toast.error(t('invalidSchoolData') || 'Bəzi məktəblərdə zəruri məlumatlar çatışmır', {
        description: t('requiredFieldsMissing') || 'Məktəb adı, Region ID və Sektor ID sahələri məcburidir'
      });
      return false;
    }
    
    return true;
  };
  
  return {
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleExportToExcel,
    handleImportSchools,
    isImporting,
    isExporting
  };
};
