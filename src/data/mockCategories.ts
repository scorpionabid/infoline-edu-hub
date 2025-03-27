
// Bu fayl indiki halda yenidən təşkil edilən və ayrı fayllara bölünən faylın əvəzedicisidir
// Geriyə uyğunluq üçün saxlanılır və onlarla əvəz olunmasına kömək edir
import mockCategoryData, { 
  mockCategories, 
  mockColumns, 
  mockSchoolData, 
  categoryStatus 
} from './mock';

// İndi bütün məlumatları yeni fayl qovluğundan ixrac edirik
export { mockCategories, mockColumns, mockSchoolData, categoryStatus };
export { mockCategoryData };
export default mockCategoryData;
