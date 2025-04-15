
import { EntryValue, CategoryWithColumns } from '@/types/dataEntry';

// Dəyərlərin boş olub-olmadığını yoxla
export const hasEmptyRequiredValues = (
  entries: EntryValue[],
  categories: CategoryWithColumns[]
): boolean => {
  // Bütün kateqoriyaları düzləşdir
  const allColumns = categories.flatMap(category => category.columns);
  
  for (const entry of entries) {
    const column = allColumns.find(col => col.id === entry.columnId);
    
    // Required sütun üçün dəyər varsa yoxla
    if (column?.is_required && (entry.value === null || entry.value === undefined || entry.value === '')) {
      return true;
    }
  }
  
  return false;
};

// Dəyərlər dəyişilib yoxsa yox
export const isFormDataModified = (
  currentEntries: EntryValue[],
  originalEntries: EntryValue[]
): boolean => {
  if (currentEntries.length !== originalEntries.length) {
    return true;
  }
  
  // Hər iki massiv də eyni uzunluqdadırsa, dəyərləri müqayisə et
  for (let i = 0; i < currentEntries.length; i++) {
    const currentEntry = currentEntries[i];
    
    // ID'yə görə original entry'ni tap
    const originalEntry = originalEntries.find(entry => 
      entry.columnId === currentEntry.columnId
    );
    
    // Əgər original yoxdursa və ya dəyər fərqlidirsə, dəyişiklik var deməkdir
    if (!originalEntry || originalEntry.value !== currentEntry.value) {
      return true;
    }
  }
  
  return false;
};

// Boş məlumat giriş şablonu yaratmaq
export const createEmptyFormData = (
  categoryId: string,
  schoolId: string,
  columns: CategoryWithColumns[]
) => {
  // Bu kateqoriyaya aid bütün sütunları tap
  const categoryColumns = columns
    .find(category => category.id === categoryId)?.columns || [];
  
  // Hər sütun üçün boş giriş yarat
  const entries = categoryColumns.map(column => ({
    categoryId,
    columnId: column.id,
    value: column.default_value || null,
    status: 'pending' as const
  }));
  
  return {
    categoryId,
    schoolId,
    entries,
    status: 'draft' as const
  };
};
