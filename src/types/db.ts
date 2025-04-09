
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
};

// Genişləndirilmiş Supabase client
export type ExtendedSupabaseClient = SupabaseClient & {
  from<T>(table: string): any;
};
