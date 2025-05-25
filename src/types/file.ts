
export interface FileCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  region_id?: string;
  sector_id?: string;
}

export interface SchoolFile {
  id: string;
  school_id: string;
  category_id?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  description?: string;
  is_active: boolean;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  category?: FileCategory;
  schools?: School; // Region və sektor adminləri üçün sorğularda birləşdirilir
}

export interface UploadFileData {
  school_id: string;
  category_id?: string;
  file_name?: string; // Əlavə edildi: useEntityFiles hook-unda istifadə edilir
  description?: string;
}
