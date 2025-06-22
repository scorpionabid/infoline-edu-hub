// School Links type definitions
export interface SchoolLink {
  id: string;
  school_id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateSchoolLinkData {
  school_id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  is_active?: boolean;
  created_by?: string;
}

export interface UpdateSchoolLinkData {
  title?: string;
  url?: string;
  description?: string;
  category?: string;
  is_active?: boolean;
}

// Sector Links type definitions
export interface SectorLink {
  id: string;
  sector_id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateSectorLinkData {
  sector_id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  is_active?: boolean;
  created_by?: string;
}

export interface UpdateSectorLinkData {
  title?: string;
  url?: string;
  description?: string;
  category?: string;
  is_active?: boolean;
}

// Link categories
export type LinkCategory = 'general' | 'education' | 'forms' | 'reports' | 'resources';

export interface LinkCategoryOption {
  value: LinkCategory;
  label: string;
}

// Link statistics
export interface LinkStats {
  total: number;
  active: number;
  categories: string[];
  lastUpdated?: string;
}

// Common link interface for shared functionality
export interface BaseLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}
