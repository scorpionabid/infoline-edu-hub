
import { SupabaseClient } from '@supabase/supabase-js';

// Bu tiplər Supabase verilənlər bazası ilə işləməmizə kömək edəcək
export type ReportTable = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  content: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  is_template: boolean;
  shared_with: any;
  filters: any;
  insights: string[] | null;
  recommendations: string[] | null;
  thumbnail_url?: string | null;
  view_count?: number;
  last_viewed_at?: string | null;
  tags?: string[] | null;
};

export type ReportTemplateTable = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  config: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  thumbnail_url?: string | null;
  tags?: string[] | null;
};

// Genişləndirilmiş Supabase client tipləri
export type ExtendedSupabaseClient = SupabaseClient & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from<T>(table: string): any;
};

// Supabase verilənlər bazasındakı cədvəllərin adları
export enum TableNames {
  AUDIT_LOGS = 'audit_logs',
  CATEGORIES = 'categories',
  COLUMNS = 'columns',
  DATA_ENTRIES = 'data_entries',
  NOTIFICATIONS = 'notifications',
  PROFILES = 'profiles',
  REGIONS = 'regions',
  REPORTS = 'reports',
  REPORT_TEMPLATES = 'report_templates',
  SCHOOLS = 'schools',
  SECTORS = 'sectors',
  USER_ROLES = 'user_roles'
}

// Report statusu üçün tipler
export type ReportStatus = 'draft' | 'published' | 'archived';
