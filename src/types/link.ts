
export interface School {
  id: string;
  name: string;
  region_id?: string;
  sector_id?: string;
}

export interface SchoolLink {
  id: string;
  school_id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  schools?: School; // Region və sektor adminləri üçün sorğularda birləşdirilir
}

export interface CreateSchoolLinkData {
  school_id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
}

export interface UpdateSchoolLinkData {
  title?: string;
  url?: string;
  description?: string;
  category?: string;
  is_active?: boolean;
}
