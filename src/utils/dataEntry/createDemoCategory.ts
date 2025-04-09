
import { v4 as uuidv4 } from 'uuid';
import { CategoryWithColumns, Column } from '@/types/column';

export const createDemoCategory = (index: number): CategoryWithColumns => {
  const categoryId = uuidv4();
  const now = new Date().toISOString();
  
  // Sütunlar üçün demo məlumatlar
  const demoColumns: Column[] = [];
  
  // İlk kateqoriya: Şagird məlumatları
  if (index === 0) {
    demoColumns.push({
      id: uuidv4(),
      category_id: categoryId,
      name: "Şagird sayı (ümumi)",
      type: "number",
      is_required: true,
      order_index: 1,
      status: "active",
      help_text: "Məktəbdəki ümumi şagird sayı",
      validation: {
        minValue: 0,
        maxValue: 5000
      },
      created_at: now,
      updated_at: now
    });
    
    demoColumns.push({
      id: uuidv4(),
      category_id: categoryId,
      name: "Məktəbə online qeydiyyat mövcuddur?",
      type: "checkbox",
      is_required: false,
      order_index: 2,
      status: "active",
      help_text: "Məktəbə qeydiyyat elektron formada aparılır?",
      created_at: now,
      updated_at: now
    });
  }
  
  // İkinci kateqoriya: Müəllim məlumatları
  else if (index === 1) {
    demoColumns.push({
      id: uuidv4(),
      category_id: categoryId,
      name: "Müəllim sayı (ümumi)",
      type: "number",
      is_required: true,
      order_index: 1,
      status: "active",
      help_text: "Məktəbdəki ümumi müəllim sayı",
      validation: {
        minValue: 0,
        maxValue: 500
      },
      created_at: now,
      updated_at: now
    });
    
    demoColumns.push({
      id: uuidv4(),
      category_id: categoryId,
      name: "İxtisas yüksəltmə kursu keçmiş müəllimlərin sayı",
      type: "select",
      is_required: true,
      order_index: 2,
      status: "active",
      help_text: "Son 1 il ərzində ixtisas yüksəltmə kursu keçmiş müəllimlərin sayı",
      options: [
        { label: "5-dən az", value: "5-dən az" },
        { label: "5-10", value: "5-10" },
        { label: "10-20", value: "10-20" },
        { label: "20-dən çox", value: "20-dən çox" }
      ],
      created_at: now,
      updated_at: now
    });
  }
  
  // Üçüncü kateqoriya: İnfrastruktur
  else if (index === 2) {
    demoColumns.push({
      id: uuidv4(),
      category_id: categoryId,
      name: "Otaq sayı",
      type: "number",
      is_required: true,
      order_index: 1,
      status: "active",
      help_text: "Məktəbdəki ümumi otaq sayı",
      validation: {
        minValue: 1,
        maxValue: 200
      },
      created_at: now,
      updated_at: now
    });
    
    demoColumns.push({
      id: uuidv4(),
      category_id: categoryId,
      name: "İdman zalı mövcuddur?",
      type: "checkbox",
      is_required: true,
      order_index: 2,
      status: "active",
      help_text: "Məktəbdə idman zalı varmı?",
      validation: {
        minValue: 0,
        maxValue: 1
      },
      created_at: now,
      updated_at: now
    });
  }
  
  // Zaman seriyası üçün demo kateqoriya
  const creationDate = new Date();
  creationDate.setDate(creationDate.getDate() - (3 - index) * 10); // Hər kateqoriya 10 gün əvvəl
  
  return {
    id: categoryId,
    name: `Demo Kateqoriya ${index + 1}`,
    description: `Bu ${index + 1} nömrəli demo kateqoriyadır.`,
    assignment: "all",
    deadline: new Date(Date.now() + (index + 1) * 86400000 * 7).toISOString(), // Hər biri 1 həftə sonra
    status: "active",
    priority: index + 1,
    created_at: creationDate.toISOString(),
    updated_at: creationDate.toISOString(),
    columns: demoColumns
  };
};
