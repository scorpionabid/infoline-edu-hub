
// Bütün mock dataları ixrac edən mərkəzi fayl
import { mockCategories } from './mockCategories';
import { mockColumns } from './mockColumns';
import { mockSchoolData } from './mockSchoolData';
import { categoryStatus } from './mockCategoryStatus';

// Bütün mock məlumatları ixrac edən obyekt
export const mockCategoryData = {
  categories: mockCategories,
  columns: mockColumns,
  schoolData: mockSchoolData,
  categoryStatus: categoryStatus
};

// Ayrı olaraq hər bir məlumat növünü ixrac edirik
export { mockCategories, mockColumns, mockSchoolData, categoryStatus };

// Default olaraq mockCategoryData-nı ixrac edirik
export default mockCategoryData;
