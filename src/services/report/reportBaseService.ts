
import { supabase } from '@/integrations/supabase/client';
import { TableNames } from '@/types/db';

export const getReportTableName = (): string => {
  return TableNames.REPORTS;
};

export const getReportTemplateTableName = (): string => {
  return TableNames.REPORT_TEMPLATES;
};
