
export interface FilterOption {
  label: string;
  value: string;
}

export interface UserFilter {
  search?: string;
  role?: string;
  status?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}
