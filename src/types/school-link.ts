
export interface SchoolLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  school_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  schools?: {
    name: string;
  };
}
