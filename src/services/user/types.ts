
import { UserRole } from '@/types/supabase';

export interface UserFetchFilters {
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: string;
  search?: string;
}

export interface UserPagination {
  page: number;
  pageSize: number;
}

export interface UsersResponse {
  data: any[]; // FullUserData tipini any ilə əvəz edirik
  count: number;
}
