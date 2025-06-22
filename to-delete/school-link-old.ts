
export interface SchoolLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  school_id: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface SectorLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  sector_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}
