
import { User } from '@/types/user';

export type { User } from '@/types/user';

export interface UserFilter {
  role?: string[];
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface FilterOption {
  value: string;
  label: string;
}
