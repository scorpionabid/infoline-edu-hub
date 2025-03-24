
// Kateqoriya üçün sütun tipi
export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'textarea' | 'email' | 'phone' | 'boolean';

// Cədvəl analizləri üçün sütun tipi
export type CategoryColumn = {
  id: string;
  categoryId: string;
  name: string;
  type: ColumnType;
  order: number;
  status: 'active' | 'inactive';
  isRequired?: boolean;
};

// Sütun məlumatı tipi
export type ColumnData = {
  columnId: string;
  value: any;
};

// Məktəb məlumatları ilə sütun məlumatları
export type SchoolColumnData = {
  schoolId: string;
  schoolName: string;
  region?: string;
  sector?: string;
  status: string;
  rejectionReason?: string;
  columnData: ColumnData[];
};

// Excel ixracı üçün parametrlər
export type ExportOptions = {
  fileName?: string;
  includeEmptyColumns?: boolean;
  includeRejected?: boolean;
  includeHiddenColumns?: boolean;
  includeStatus?: boolean;
  customFileName?: string; // Excel ixracı üçün əlavə edildi
};

// Hesabat növü
export type ReportType = 'column' | 'category' | 'school' | 'region' | 'sector' | 'completion' | 'custom' | 'statistics' | 'comparison';

// Hesabat tipi
export type Report = {
  id: string;
  name: string;
  title?: string; // ReportList və digər komponentlərdə istifadə olunur
  description: string;
  type: ReportType;
  dateCreated?: string;
  createdAt?: string; // Yaradılma tarixi (alternativ)
  created?: string; // Yaradılma tarixi (alternativ)
  lastUpdated?: string;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  downloadUrl?: string;
  data?: any[]; // Hesabat üçün məlumatlar massivi
  summary?: string; // Hesabat xülasəsi
  insights?: string[]; // Hesabat təhlilləri
  recommendations?: string[]; // Tövsiyələr
};

// Kateqoriya hesabat tipi
export type CategoryReport = {
  id: string;
  name: string;
  totalSchools: number;
  completedSchools: number;
  pendingSchools: number;
  rejectedSchools: number;
  completionRate: number;
  deadlineDays?: number;
  deadline?: string;
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'overdue';
};

// Status filtri üçün parametrlər
export type StatusFilterOptions = {
  pending?: boolean;
  approved?: boolean;
  rejected?: boolean;
};
