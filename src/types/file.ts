
export interface FileCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  sort_order: number;
  created_at: string;
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
}

export interface UploadFileData {
  school_id: string;
  category_id?: string;
  file: File;
  description?: string;
}
