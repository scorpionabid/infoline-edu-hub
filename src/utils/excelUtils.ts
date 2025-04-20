import { School } from '@/types/school';

export const importSchoolsFromExcel = async (file: File): Promise<School[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Başlıq sətrini çıxar
      const header = jsonData[0] as string[];
      const schoolData: any[] = [];

      // İkinci sətrdən başlayaraq məlumatları oxu
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || row.length === 0) continue; // Boş sətrləri atla

        const school: any = {};
        for (let j = 0; j < header.length; j++) {
          school[header[j]] = row[j] || null; // Hücre boş olsa belə, null olaraq əlavə et
        }
        schoolData.push(school);
      }

      const schools: School[] = schoolData.map(item => ({
        id: item['id'] || '',
        name: item['name'] || '',
        principal_name: item['principal_name'] || '',
        address: item['address'] || '',
        region_id: item['region_id'] || '',
        sector_id: item['sector_id'] || '',
        phone: item['phone'] || '',
        email: item['email'] || '',
        student_count: item['student_count'] || 0,
        teacher_count: item['teacher_count'] || 0,
        status: item['status'] || 'active',
        type: item['type'] || '',
        language: item['language'] || '',
        created_at: item['created_at'] || new Date(),
        updated_at: item['updated_at'] || new Date(),
        completion_rate: item['completion_rate'] || 0,
        logo: item['logo'] || null,
        admin_email: item['admin_email'] || null,
        admin_id: item['admin_id'] || null,
      }));

      resolve(schools);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

export const validateExcelData = (data: any[]): string[] => {
  const errors: string[] = [];
  if (!Array.isArray(data) || data.length === 0) {
    errors.push('Excel faylında məlumat tapılmadı.');
    return errors;
  }

  const header = data[0] as string[];
  if (!header || header.length === 0) {
    errors.push('Excel faylında başlıqlar tapılmadı.');
    return errors;
  }

  const requiredHeaders = ['name', 'region_id', 'sector_id'];
  const missingHeaders = requiredHeaders.filter(requiredHeader => !header.includes(requiredHeader));

  if (missingHeaders.length > 0) {
    errors.push(`Aşağıdakı başlıqlar tapılmadı: ${missingHeaders.join(', ')}`);
  }
  return errors;
};
