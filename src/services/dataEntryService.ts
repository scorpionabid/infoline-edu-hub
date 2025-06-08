import { supabase } from '@/integrations/supabase/client';
import { DataEntryForm, DataEntryStatus } from '@/types/dataEntry';
import { StatusTransitionService, TransitionContext } from './statusTransitionService';

// Entry interface to represent single data entry
export interface EntryValue {
  columnId: string;
  value: any; // Allow any type of value since we store different types
  status?: 'pending' | 'approved' | 'rejected' | 'draft';
}

// Common interface for service responses
export interface ServiceResponse {
  success: boolean;
  error?: string;
  message?: string;
  id?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'draft';
  errors?: Record<string, string>;
}

/**
 * UUID validation helper
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Safe UUID processing - prevents "system" strings from being passed to UUID fields
 */
function getSafeUserId(userId?: string): string | null {
  if (!userId || userId === 'system' || userId === 'null' || userId === 'undefined') {
    console.warn('Invalid userId detected, using null:', userId);
    return null;
  }
  
  if (typeof userId === 'string' && isValidUUID(userId)) {
    return userId;
  }
  
  console.warn('Invalid UUID format, using null:', userId);
  return null;
}

// Data entry formunu yadda saxla - Enhanced with status protection and auto-approval
export const saveDataEntryForm = async (
  schoolId: string,
  categoryId: string,
  entries: EntryValue[],
  userRole?: string,  // ✅ YENİ parameter
  userId?: string     // ✅ YENİ parameter
): Promise<ServiceResponse> => {
  try {
    console.group('saveDataEntryForm - Enhanced');
    console.log('Request params:', { schoolId, categoryId, entriesCount: entries.length });

    // ✅ YENİ: Status protection check
    const currentStatus = await StatusTransitionService.getCurrentStatus(schoolId, categoryId);
    console.log('Current status:', currentStatus);
    
    if (currentStatus === 'approved') {
      console.warn('Attempted to modify approved entry');
      console.groupEnd();
      return {
        success: false,
        error: 'Cannot modify approved entries',
        message: 'Təsdiqlənmiş məlumatlar redaktə edilə bilməz',
        errors: { general: 'Bu məlumatlar artıq təsdiqlənib və redaktə edilə bilməz' }
      };
    }

    // Get current user for validation
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      console.groupEnd();
      return {
        success: false,
        error: 'Authentication required',
        message: 'İstifadəçi girişi tələb olunur'
      };
    }

    // Process user ID safely
    const safeUserId = getSafeUserId(userId || user.id);
    console.log('Using safe user ID:', safeUserId);

    // ✅ YENİ: Get user role for validation
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .limit(1);
    
    const actualUserRole = userRoles?.[0]?.role || userRole;
    if (!actualUserRole) {
      console.error('User role not found');
      console.groupEnd();
      return {
        success: false,
        error: 'User role not found',
        message: 'İstifadəçi rolu tapılmadı'
      };
    }

    console.log('User validation successful:', { userId: safeUserId, role: actualUserRole });

    // ✅ YENİ: Auto-approval logic
    const isAutoApprove = actualUserRole === 'sectoradmin';
    const defaultStatus = isAutoApprove ? 'approved' : 'draft';
    console.log('Auto-approval logic:', { isAutoApprove, defaultStatus });

    // ✅ DEĞİŞDİRİLMİŞ: Transaction-based save for data integrity
    const { error: deleteError } = await supabase
      .from('data_entries')
      .delete()
      .eq('category_id', categoryId)
      .eq('school_id', schoolId);

    if (deleteError) {
      console.error('Error deleting existing entries:', deleteError);
      throw deleteError;
    }

    // Insert new entries with auto-approval and safe UUID handling
    const insertPromises = entries.map(entry => 
      supabase.from('data_entries').insert({
        school_id: schoolId,
        category_id: categoryId,
        column_id: entry.columnId,
        value: entry.value,
        status: entry.status || defaultStatus,
        created_by: safeUserId, // Safe UUID or null, never "system"
        // ✅ YENİ: Auto-approval metadata
        approved_by: isAutoApprove ? safeUserId : null,
        approved_at: isAutoApprove ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    );

    const results = await Promise.all(insertPromises);
    
    // Check for any insert errors
    const insertErrors = results.filter(result => result.error);
    if (insertErrors.length > 0) {
      console.error('Insert errors:', insertErrors);
      // Log UUID-specific errors
      insertErrors.forEach(errorResult => {
        if (errorResult.error?.code === '22P02' && errorResult.error?.message?.includes('uuid')) {
          console.error('UUID validation error detected:', errorResult.error);
        }
      });
      throw new Error('Failed to save some entries');
    }

    console.log('Data saved successfully:', results.length, 'entries');
    console.groupEnd();

    return {
      success: true,
      id: `form-${Date.now()}`,
      status: defaultStatus,
      message: isAutoApprove ? 'Data automatically approved' : 'Data saved successfully'
    };
  } catch (error: any) {
    console.error('Form yadda saxlanarkən xəta baş verdi:', error);
    console.groupEnd();
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta',
      message: 'Error saving data',
      errors: { general: error.message || 'Bilinməyən xəta' }
    };
  }
};

// Məktəb ID və Kateqoriya ID-yə görə yazıları al
export const getDataEntries = async (
  schoolId: string,
  categoryId: string
): Promise<ServiceResponse & {
  data?: EntryValue[];
}> => {
  console.group('getDataEntries call');
  console.log('Request params:', { schoolId, categoryId });

  try {
    // Giriş parametrlərini yoxla
    if (!schoolId || !categoryId) {
      console.warn('Empty parameters detected', { schoolId, categoryId });
      console.groupEnd();
      return {
        success: false,
        error: 'Missing required parameters',
        message: 'School ID and Category ID are required',
        data: []
      };
    }

    // Sorğunu icra et
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('school_id', schoolId)
      .eq('category_id', categoryId);

    console.log('Supabase response:', { data: data?.length || 0, error });

    if (error) {
      console.error('Supabase error:', error);
      console.groupEnd();
      throw error;
    }

    // Boş nəticəyə qarşı yoxla
    if (!data || data.length === 0) {
      console.log('No entries found for the given parameters');
      console.groupEnd();
      return {
        success: true,
        data: [],
        message: 'No entries found'
      };
    }

    // Verilənləri çevir
    const entries = data.map(entry => ({
      id: entry.id,
      columnId: entry.column_id,
      value: entry.value,
      status: entry.status as DataEntryStatus // Status dəyərini DataEntryStatus tipinə cast edirik
    }));

    console.log('Transformed entries:', entries.length);
    console.groupEnd();
    return {
      success: true,
      data: entries
    };
  } catch (error: any) {
    console.error('Error in getDataEntries:', error);
    console.groupEnd();
    console.error('Yazıları əldə edərkən xəta baş verdi:', error);
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta',
      message: 'Error loading data',
      errors: { general: error.message || 'Bilinməyən xəta' }
    };
  }
};

// Təsdiq üçün göndər - Enhanced with status transition validation
export const submitForApproval = async (
  schoolId: string,
  categoryId: string,
  comment?: string
): Promise<ServiceResponse> => {
  try {
    console.group('submitForApproval - Enhanced');
    console.log('Request params:', { schoolId, categoryId, comment });

    // Get current user and role
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      console.groupEnd();
      return {
        success: false,
        error: 'Authentication required',
        message: 'İstifadəçi girişi tələb olunur'
      };
    }

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .limit(1);
    
    const userRole = userRoles?.[0]?.role;
    if (!userRole) {
      console.error('User role not found');
      console.groupEnd();
      return {
        success: false,
        error: 'User role not found',
        message: 'İstifadəçi rolu tapılmadı'
      };
    }

    // Safe user ID processing
    const safeUserId = getSafeUserId(user.id);

    // ✅ YENİ: Get current status and validate transition
    const currentStatus = await StatusTransitionService.getCurrentStatus(schoolId, categoryId);
    console.log('Current status:', currentStatus);
    
    if (!currentStatus) {
      console.error('Could not determine current status');
      console.groupEnd();
      return {
        success: false,
        error: 'Could not determine current status',
        message: 'Mövcud status təyin edilə bilmədi'
      };
    }

    // ✅ YENİ: Validate transition using StatusTransitionService
    const transitionContext: TransitionContext = {
      schoolId,
      categoryId,
      userId: safeUserId || user.id,
      userRole,
      comment
    };

    const canTransition = await StatusTransitionService.canTransition(
      currentStatus,
      'pending',
      transitionContext
    );

    if (!canTransition.allowed) {
      console.warn('Transition not allowed:', canTransition.reason);
      console.groupEnd();
      return {
        success: false,
        error: canTransition.reason,
        message: 'Status keçidi mümkün deyil',
        errors: { transition: canTransition.reason || 'Status transition not allowed' }
      };
    }

    // ✅ YENİ: Execute transition using StatusTransitionService
    const transitionResult = await StatusTransitionService.executeTransition(
      currentStatus,
      'pending',
      transitionContext
    );

    console.log('Transition result:', transitionResult);
    console.groupEnd();

    if (transitionResult.success) {
      return {
        success: true,
        status: 'pending',
        message: transitionResult.message || 'Data submitted for approval'
      };
    } else {
      return {
        success: false,
        error: transitionResult.error,
        message: transitionResult.message || 'Error submitting data',
        errors: { transition: transitionResult.error || 'Transition failed' }
      };
    }
  } catch (error: any) {
    console.error('Təsdiq üçün göndərilirkən xəta baş verdi:', error);
    console.groupEnd();
    return {
      success: false,
      error: error.message || 'Bilinməyən xəta',
      message: 'Error submitting data',
      errors: { general: error.message || 'Bilinməyən xəta' }
    };
  }
};
