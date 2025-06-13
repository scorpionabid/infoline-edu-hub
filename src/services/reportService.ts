import { Report, ReportTypeValues, SchoolColumnData, StatusFilterOptions } from '@/types/core/report';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandler';
import * as XLSX from 'xlsx';
import { ExportOptions } from '@/types/excel';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';

// Import Supabase client types
import { SupabaseClient as OriginalSupabaseClient } from '@supabase/supabase-js';
// Import PostgrestError type separately to avoid conflicts
import type { PostgrestError as SupabasePostgrestError } from '@supabase/supabase-js';

// Import the generated Database type from Supabase
import type { Database } from '@/integrations/supabase/types';

// Define our custom table types
interface SchoolDataSubmissionsRow {
  id: string;
  school_id: string;
  category_id: string;
  column_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  value?: string;
}

interface DataStatusHistoryRow {
  id: string;
  school_id: string;
  category_id: string;
  status: string;
  feedback: string | null;
  changed_by: string | null;
  created_at: string;
}

interface DataFeedbackHistoryRow {
  id: string;
  school_id: string;
  category_id: string;
  feedback: string | null;
  created_by: string | null;
  created_at: string;
}

interface ReportsRow {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  content: Record<string, unknown>;
  filters: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_template: boolean;
  shared_with: Record<string, unknown>;
  insights: string[] | null;
  recommendations: string[] | null;
  feedback: string[] | null;
  school_id: string | null;
  data: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  version: number | null;
}

// Import Database type from generated types
import type { Database as GeneratedDb } from '@/integrations/supabase/types';

// Extend the Supabase schema types to include our custom tables and functions
declare module '@supabase/supabase-js' {
  export interface Database {
    public: {
      Tables: {
        school_data_submissions: {
          Row: SchoolDataSubmissionsRow;
          Insert: Omit<SchoolDataSubmissionsRow, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<SchoolDataSubmissionsRow>;
          Relationships: [];
        };
        data_status_history: {
          Row: DataStatusHistoryRow;
          Insert: Omit<DataStatusHistoryRow, 'id' | 'created_at'> & {
            id?: string;
            created_at?: string;
          };
          Update: Partial<Omit<DataStatusHistoryRow, 'id' | 'created_at'>> & {
            id?: string;
            created_at?: string;
          };
          Relationships: [];
        };
        data_feedback_history: {
          Row: DataFeedbackHistoryRow;
          Insert: Omit<DataFeedbackHistoryRow, 'id' | 'created_at'> & {
            id?: string;
            created_at?: string;
          };
          Update: Partial<Omit<DataFeedbackHistoryRow, 'id' | 'created_at'>> & {
            id?: string;
            created_at?: string;
          };
          Relationships: [];
        };
        reports: {
          Row: ReportsRow;
          Insert: Omit<ReportsRow, 'id' | 'created_at' | 'updated_at'> & {
            id?: string;
            created_at?: string;
            updated_at?: string;
          };
          Update: Partial<Omit<ReportsRow, 'id' | 'created_at' | 'updated_at'>> & {
            id?: string;
            created_at?: string;
            updated_at?: string;
          };
          Relationships: [];
        };
        // Include all the base tables from the generated type
        audit_logs: GeneratedDb['public']['Tables']['audit_logs'];
        categories: GeneratedDb['public']['Tables']['categories'];
        columns: GeneratedDb['public']['Tables']['columns'];
        data_entries: GeneratedDb['public']['Tables']['data_entries'];
        schools: GeneratedDb['public']['Tables']['schools'];
        file_categories: GeneratedDb['public']['Tables']['file_categories'];
        notifications: GeneratedDb['public']['Tables']['notifications'];
        profiles: GeneratedDb['public']['Tables']['profiles'];
        regions: GeneratedDb['public']['Tables']['regions'];
        report_templates: GeneratedDb['public']['Tables']['report_templates'];
        school_files: GeneratedDb['public']['Tables']['school_files'];
        sectors: GeneratedDb['public']['Tables']['sectors'];
        user_roles: GeneratedDb['public']['Tables']['user_roles'];
      };
      Views: {
        status_history_view: GeneratedDb['public']['Views']['status_history_view'];
      };
      Functions: {
        check_table_exists: {
          Args: { table_name: string };
          Returns: boolean;
        };
      };
      Enums: {};
      CompositeTypes: {};
    }
  }
}

// Export types for use in other files
export type { SchoolDataSubmissionsRow, DataStatusHistoryRow, DataFeedbackHistoryRow, ReportsRow };

// Custom simplified client type that avoids deep TypeScript inference issues
export interface SupabaseClient extends Omit<OriginalSupabaseClient, 'from' | 'rpc'> {
  rpc<Result = any>(
    fn: string,
    params?: object,
    options?: { head?: boolean; count?: 'exact' | 'planned' | 'estimated' }
  ): Promise<QueryResponse<Result>>;
  
  // Method to access tables with proper typing
  from<T = any>(table: string): GenericQueryBuilder<T>;
}

// Simplified interfaces for Supabase query builders
interface QueryResponse<T = any> {
  data: T | null;
  error: SupabasePostgrestError | null;
}

// Enhanced interface that supports both direct method calls and promise results
interface GenericFilterBuilder<T = any> extends Promise<QueryResponse<T>> {
  eq(column: string, value: any): GenericFilterBuilder<T>;
  neq(column: string, value: any): GenericFilterBuilder<T>;
  filter(column: string, operator: string, value: any): GenericFilterBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): GenericFilterBuilder<T>;
  limit(count: number): GenericFilterBuilder<T>;
  single(): GenericFilterBuilder<T>;
  maybeSingle(): GenericFilterBuilder<T>;
  then<TResult1 = QueryResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResponse<T>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2>;
}

interface GenericQueryBuilder<T = any> {
  select(columns?: string): GenericFilterBuilder<T>;
  insert(values: any, options?: any): GenericFilterBuilder<T>;
  update(values: any, options?: any): GenericFilterBuilder<T>;
  delete(): GenericFilterBuilder<T>;
}

// Define types for tables we need to access
type CustomTableNames = 'school_data_submissions' | 'data_status_history' | 'data_feedback_history' | 'reports';
type CustomViewNames = 'status_history_view';

// Type for JSON field in data
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Define the database report interface that matches our Supabase table
interface DbReport {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  is_template: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  school_id?: string | null;
  feedback?: string | null;
  version?: number;
  content?: Json | null;
  filters?: Json | null;
  shared_with?: Json | null;
  data?: Json | null;
  metadata?: Json | null;
  insights?: string | string[] | null;
  recommendations?: string | string[] | null;
}

// Type guard to check if a value is a DbReport
const isDbReport = (value: unknown): value is DbReport => {
  return typeof value === 'object' && value !== null && 'id' in value && 'title' in value;
};

/**
 * Type guard to check if a value is a string array
 * @param value The value to check
 * @returns True if the value is a string array, false otherwise
 */
const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

/**
 * Type guard to check if an error is a PostgrestError
 * @param error The error to check
 */
function isPostgrestError(error: unknown): error is SupabasePostgrestError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as any).code === 'string'
  );
}

// Helper function to handle string | string[] conversion to string[]
const toStringArray = (value: string | string[] | null | undefined): string[] => {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  return value;
};

// Type guard to check if error is a specific type
type PostgrestError = {
  code: string;
  message: string;
  details?: string;
};

// Helper function to handle JSON data
const toJsonObject = (value: unknown): Record<string, unknown> => {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
};

const mapDbReportToReport = (dbReport: DbReport): Report => {
  // Safely parse shared_with which is stored as JSONB
  let sharedWith: string[] = [];

  if (typeof dbReport.shared_with === 'string') {
    try {
      const parsed = JSON.parse(dbReport.shared_with as string);
      if (Array.isArray(parsed)) {
        sharedWith = parsed.filter(item => typeof item === 'string');
      }
    } catch (e) {
      console.error('Error parsing shared_with:', e);
      // Leave as empty array
    }
  } else if (Array.isArray(dbReport.shared_with)) {
    sharedWith = isStringArray(dbReport.shared_with) ? dbReport.shared_with : [];
  }

  return {
    id: dbReport.id,
    title: dbReport.title,
    description: dbReport.description || '',
    type: dbReport.type as unknown as ReportTypeValues,
    status: dbReport.status,
    is_template: dbReport.is_template || false,
    created_by: dbReport.created_by,
    created_at: dbReport.created_at,
    updated_at: dbReport.updated_at,
    school_id: dbReport.school_id || '',
    feedback: Array.isArray(dbReport.feedback) ? dbReport.feedback : [],
    insights: toStringArray(dbReport.insights),
    recommendations: toStringArray(dbReport.recommendations),
    content: toJsonObject(dbReport.content),
    filters: toJsonObject(dbReport.filters),
    shared_with: sharedWith,
    data: toJsonObject(dbReport.data),
    metadata: toJsonObject(dbReport.metadata),
    version: dbReport.version || 1
  };
};

const mapReportToDbReport = (report: Partial<Report>): Partial<DbReport> => {
  // Helper function to handle string[] to string conversion if needed
  const toStringOrArray = (value: string | string[] | undefined): string | string[] | undefined => {
    if (value === undefined) return undefined;
    if (Array.isArray(value)) return value.length === 1 ? value[0] : value;
    return value;
  };

  return {
    id: report.id || uuidv4(),
    title: report.title || 'Untitled Report',
    description: report.description || '',
    type: report.type || 'custom',
    status: report.status || 'draft',
    is_template: report.is_template || false,
    created_by: report.created_by,
    created_at: report.created_at || new Date().toISOString(),
    updated_at: report.updated_at || new Date().toISOString(),
    school_id: report.school_id || null,
    feedback: report.feedback ? (Array.isArray(report.feedback) ? report.feedback.join('\n') : report.feedback) : null,
    version: report.version || 1,
    content: report.content || null,
    filters: report.filters || null,
    shared_with: report.shared_with || null,
    data: report.data || null,
    metadata: report.metadata || null,
    insights: toStringOrArray(report.insights),
    recommendations: toStringOrArray(report.recommendations),
  };
};

// Define types for custom tables
type SchoolDataSubmission = {
  id: string;
  school_id: string;
  data: Json;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  rejection_reason?: string;
  school_name?: string;
  region?: string;
  sector?: string;
};

type DataStatusHistory = {
  id: string;
  table_name: string;
  record_id: string;
  field_name: string;
  old_value: Json;
  new_value: Json;
  changed_by: string;
  changed_at: string;
  change_reason?: string;
};

// Define our custom types for the Supabase schema
interface CustomDatabase {
  public: {
    Tables: {
      school_data_submissions: {
        Row: SchoolDataSubmission;
        Insert: Omit<SchoolDataSubmission, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SchoolDataSubmission, 'id' | 'created_at' | 'created_by'>>;
      };
      data_status_history: {
        Row: DataStatusHistory;
        Insert: Omit<DataStatusHistory, 'id' | 'changed_at'>;
        Update: Partial<Omit<DataStatusHistory, 'id' | 'changed_at' | 'changed_by'>>;
      };
      reports: {
        Row: DbReport;
        Insert: Omit<DbReport, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DbReport, 'id' | 'created_at' | 'created_by'>>;
      };
    };
    Functions: {
      table_exists: {
        Args: { table_name: string };
        Returns: boolean;
      };
    };
  }
}

// Check if table exists
const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const client = supabase as unknown as SupabaseClient;
    const { data, error } = await client.rpc('check_table_exists', {
      table_name: tableName
    });

    if (error) {
      console.error('Error checking if table exists:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in tableExists function:', error);
    return false;
  }
};

export const getReport = async (reportId: string): Promise<Report | null> => {
  try {
    // First check if reports table exists
    const reportsTableExists = await tableExists('reports');
    if (!reportsTableExists) {
      console.warn('Reports table does not exist');
      return null;
    }

    // Create a type-safe client
    const client = supabase as unknown as SupabaseClient;
    
        // Execute the query with proper typing
    // Create query and execute in one step - this avoids TypeScript errors with chaining
    const { data: reportData, error } = await client
      .from<DbReport>('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) {
      if (isPostgrestError(error) && error.code === 'PGRST116') {
        // Not found error
        console.warn(`Report not found with id ${reportId}`);
        return null;
      }
      throw error;
    }

    // Safety check - make sure we actually got data
    if (!reportData || !isDbReport(reportData)) {
      console.warn(`No valid report data found for id ${reportId}`);
      return null;
    }

    return mapDbReportToReport(reportData);
  } catch (error) {
    console.error('Error fetching report:', error);
    throw handleError(error);
  }
};

export const getSchoolDataSubmissions = async (schoolId: string): Promise<SchoolDataSubmission[]> => {
  try {
    // First check if table exists
    const submissionsTableExists = await tableExists('school_data_submissions');
    if (!submissionsTableExists) {
      console.warn('School data submissions table does not exist');
      return [];
    }

    const client = supabase as unknown as SupabaseClient;
    const { data, error } = await client
      .from('school_data_submissions')
      .select('*')
      .eq('school_id', schoolId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching school data submissions:', error);
    throw handleError(error);
  }
};

export const updateSchoolDataSubmission = async (
  submissionId: string,
  status: 'pending' | 'approved' | 'rejected',
  rejectionReason?: string
): Promise<void> => {
  try {
    // First check if table exists
    const submissionsTableExists = await tableExists('school_data_submissions');
    if (!submissionsTableExists) {
      throw new Error('School data submissions table does not exist');
    }

    const client = supabase as unknown as SupabaseClient;
    const { error } = await client
      .from('school_data_submissions')
      .update({
        status,
        rejection_reason: status === 'rejected' ? rejectionReason || null : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating school data submission:', error);
    throw handleError(error);
  }
};

export const updateSchoolDataSubmissionStatus = async (
  submissionId: string,
  status: 'pending' | 'approved' | 'rejected',
  rejectionReason?: string
): Promise<void> => {
  try {
    // Use cast to our SupabaseClient type to fix type checking
    const client = supabase as unknown as SupabaseClient;
    
    // Create query and execute in one step - this avoids TypeScript errors with chaining
    const { data: submissionData, error: submissionError } = await client
      .from<SchoolDataSubmissionsRow>('school_data_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submissionData) {
      console.error('Error fetching submission:', submissionError);
      throw new Error(`Error fetching submission: ${submissionError?.message || 'Unknown error'}`);
    }
    
    // Update the submission status
    // Create query and execute in one step - this avoids TypeScript errors with chaining
    const { error: updateError } = await client
      .from<SchoolDataSubmissionsRow>('school_data_submissions')
      .update({
        status,
        rejection_reason: status === 'rejected' ? rejectionReason || null : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission status:', updateError);
      throw new Error(`Error updating submission: ${updateError.message}`);
    }
  } catch (error) {
    console.error('Error in updateSchoolDataSubmission:', error);
    throw error;
  }
};

export const updateDataStatus = async (
  schoolId: string,
  categoryId: string,
  status: 'pending' | 'approved' | 'rejected',
  feedback?: string
): Promise<void> => {
  try {
    // Check if school_data_submissions table exists
    const tableToCheck = 'school_data_submissions';
    const submissionsTableExists = await tableExists(tableToCheck);

    if (submissionsTableExists) {
      try {
        // First try to update existing record
        const client = supabase as unknown as SupabaseClient;
        const { data: existingData, error: selectError } = await client
          .from('school_data_submissions')
          .select('*')
          .eq('school_id', schoolId)
          .eq('category_id', categoryId)
          .single();

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "Not found"
          console.error('Error checking existing data:', selectError);
          throw new Error(`Error checking existing data: ${selectError.message}`);
        }

        if (existingData) {
          // Update existing record
          const { error: updateError } = await client
            .from('school_data_submissions')
            .update({
              status: status,
              rejection_reason: status === 'rejected' ? feedback || null : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingData.id);

          if (updateError) {
            console.error('Error updating data status:', updateError);
            throw new Error(`Error updating data status: ${updateError.message}`);
          }
        } else {
          // Insert new record
          const { error: insertError } = await client
            .from('school_data_submissions')
            .insert({
              school_id: schoolId,
              category_id: categoryId,
              status: status,
              rejection_reason: status === 'rejected' ? feedback || null : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error inserting data status:', insertError);
            throw new Error(`Error inserting data status: ${insertError.message}`);
          }
        }
      } catch (error) {
        console.error('Error updating submission status:', error);
        throw error;
      }
    }

        // Check if the history table exists
    const historyTableExists = await tableExists('data_status_history');
    
    if (historyTableExists) {
      // Add to status history with type safety
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      
      try {
        const client = supabase as unknown as SupabaseClient;
        const { error: historyError } = await client
          .from('data_status_history')
          .insert({
            school_id: schoolId,
            category_id: categoryId,
            status,
            feedback: status === 'rejected' ? feedback || null : null,
            changed_by: user?.id || null,
            created_at: new Date().toISOString()
          });

        if (historyError) {
          console.error('Error saving status history:', historyError);
          // Don't throw here as this is a non-critical operation
        }
      } catch (historyErr) {
        console.error('Unexpected error saving status history:', historyErr);
        // Continue execution even if history saving fails
      }
    }
    
    // Check if the feedback table exists
    const feedbackTableExists = await tableExists('data_feedback_history');
    
    if (feedbackTableExists) {
      // If there's feedback, record it separately
      if (feedback) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          const currentUser = userData.user;
          
          const client = supabase as unknown as SupabaseClient;
          const { error: feedbackError } = await client
            .from('data_feedback_history')
            .insert({
              school_id: schoolId,
              category_id: categoryId,
              feedback: feedback || null,
              created_by: currentUser?.id || null,
              created_at: new Date().toISOString()
            });
          
          if (feedbackError) {
            console.warn('Failed to record feedback history:', feedbackError);
            // Non-critical, so no throw
          }
        } catch (feedbackErr) {
          console.error('Error recording feedback:', feedbackErr);
          // Not throwing as this is non-critical
        }
      }
    }
  } catch (error) {
    console.error('Error in updateDataStatus:', error);
    throw error;
  }
};
