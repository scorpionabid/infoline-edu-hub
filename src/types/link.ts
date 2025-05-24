
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
