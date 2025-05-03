
import { Database } from './database.types';

export type User = Database['public']['Tables']['profiles']['Row'];

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  adminEntity?: {
    schoolName?: string;
    sectorName?: string;
    regionName?: string;
  };
}

export interface UserFormData {
  email: string;
  full_name: string;
  password?: string;
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}
