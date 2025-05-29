
export interface BaseLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface SchoolLink extends BaseLink {
  school_id: string;
  schools?: string; // Add schools property for component compatibility
}

export interface RegionLink extends BaseLink {
  region_id: string;
}

export interface SectorLink extends BaseLink {
  sector_id: string;
}

export type Link = SchoolLink | RegionLink | SectorLink;

