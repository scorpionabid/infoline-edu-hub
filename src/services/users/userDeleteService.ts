import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NotificationCreator } from '@/services/notifications/notificationCreator';

// Enhanced user deletion service compatible with existing system
// Uses direct Supabase client calls like other entity deletions (schools, sectors)
export const userDeleteService = {
  
  /**
   * Soft delete a user (mark as inactive and set deleted_at)
   * Following the same pattern as school/sector soft delete
   * @param userId - Target user ID to soft delete
   * @returns Promise<boolean> - Success status
   */
  async softDeleteUser(userId: string): Promise<boolean> {
    try {
      console.log('🗑️  Starting soft delete for user:', userId);
      
      // First check if user exists and is not already deleted
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, full_name, deleted_at')
        .eq('id', userId)
        .single();
      
      if (checkError) {
        console.error('❌ Error checking user existence:', checkError);
        throw new Error('İstifadəçi tapılmadı');
      }
      
      if (existingUser.deleted_at) {
        console.warn('⚠️  User already soft deleted');
        toast.warning('İstifadəçi artıq deaktiv edilib');
        return false;
      }
      
      // Try using the database function first
      try {
        const { data, error } = await supabase.rpc('soft_delete_user_safe', {
          p_target_user_id: userId
        });
        
        if (error) {
          console.warn('Database function failed, falling back to direct update:', error);
          throw error;
        }
        
        if (data && !data.success) {
          console.error('❌ Soft delete failed:', data.error);
          toast.error('İstifadəçi deaktiv edilərkən xəta', {
            description: data.error
          });
          return false;
        }
        
        console.log('✅ User soft deleted via database function');
      } catch (funcError) {
        console.warn('Database function not available, using direct approach:', funcError);
        
        // Fallback to direct database operations (like schools/sectors)
        const currentTime = new Date().toISOString();
        const { data: currentUser } = await supabase.auth.getUser();
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            deleted_at: currentTime,
            deleted_by: currentUser.user?.id,
            status: 'inactive',
            updated_at: currentTime
          })
          .eq('id', userId)
          .is('deleted_at', null); // Only update if not already deleted
        
        if (updateError) {
          console.error('❌ Direct soft delete error:', updateError);
          throw updateError;
        }
        
        // Manual audit log (fallback)
        try {
          await supabase
            .from('audit_logs')
            .insert({
              user_id: currentUser.user?.id,
              action: 'soft_delete',
              entity_type: 'user',
              entity_id: userId,
              old_value: existingUser,
              new_value: { ...existingUser, deleted_at: currentTime, status: 'inactive' },
              created_at: currentTime
            });
        } catch (auditError) {
          console.warn('⚠️  Could not create audit log:', auditError);
        }
      }
      
      toast.success('İstifadəçi deaktiv edildi', {
        description: 'İstifadəçi uğurla deaktiv edildi və məlumatları saxlanıldı'
      });
      
      // Send notification to admins (non-blocking)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await NotificationCreator.createUserDeletionNotification(
            userId,
            existingUser.full_name || 'Naməlum istifadəçi',
            user.id,
            'soft'
          );
        }
      } catch (notifError) {
        console.warn('⚠️  Could not send deletion notification:', notifError);
        // Don't fail the deletion if notification fails
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Soft delete service error:', error);
      
      // Provide specific error messages like schools/sectors do
      if (error.message?.includes('permission') || error.message?.includes('Permission')) {
        toast.error('İcazə xətası', {
          description: 'Bu istifadəçini deaktiv etmək üçün səlahiyyətiniz yoxdur'
        });
      } else if (error.message?.includes('not found')) {
        toast.error('İstifadəçi tapılmadı', {
          description: 'Silinməli istifadəçi tapılmadı və ya artıq silinib'
        });
      } else {
        toast.error('İstifadəçi deaktiv edilərkən xəta', {
          description: error.message || 'Naməlum xəta baş verdi'
        });
      }
      
      return false;
    }
  },

  /**
   * Hard delete a user (permanently remove from database)
   * Following the same pattern as school/sector hard delete with dependency management
   * @param userId - Target user ID to hard delete
   * @returns Promise<boolean> - Success status
   */
  async hardDeleteUser(userId: string): Promise<boolean> {
    try {
      console.log('💥 Starting hard delete for user:', userId);
      
      // First check dependencies like sectors do
      const dependencies = await this.checkUserDependencies(userId);
      
      if (dependencies.hasActiveData) {
        console.warn('⚠️  User has active dependencies');
        toast.warning('İstifadəçinin aktiv məlumatları var', {
          description: 'Əvvəlcə bütün əlaqəli məlumatları təmizləyin və ya soft delete istifadə edin'
        });
        return false;
      }
      
      // Get user data before deletion
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId)
        .single();
      
      if (checkError) {
        console.error('❌ Error checking user existence:', checkError);
        throw new Error('İstifadəçi tapılmadı');
      }
      
      // Try using the database function first
      try {
        const { data, error } = await supabase.rpc('hard_delete_user_safe', {
          p_target_user_id: userId
        });
        
        if (error) {
          console.warn('Database function failed, falling back to manual deletion:', error);
          throw error;
        }
        
        if (data && !data.success) {
          console.error('❌ Hard delete failed:', data.error);
          toast.error('İstifadəçi silinərkən xəta', {
            description: data.error
          });
          return false;
        }
        
        console.log('✅ User hard deleted via database function');
      } catch (funcError) {
        console.warn('Database function not available, using direct approach:', funcError);
        
        // Fallback to manual deletion (like sectors do)
        const currentTime = new Date().toISOString();
        const { data: currentUser } = await supabase.auth.getUser();
        
        // Manual audit log before deletion
        try {
          await supabase
            .from('audit_logs')
            .insert({
              user_id: currentUser.user?.id,
              action: 'hard_delete',
              entity_type: 'user',
              entity_id: userId,
              old_value: existingUser,
              new_value: null,
              created_at: currentTime
            });
        } catch (auditError) {
          console.warn('⚠️  Could not create audit log:', auditError);
        }
        
        // Delete user_roles first (FK constraint)
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        
        if (roleError) {
          console.error('❌ Error deleting user roles:', roleError);
          throw new Error(`User roles silinərkən xəta: ${roleError.message}`);
        }
        
        // Delete from profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (profileError) {
          console.error('❌ Error deleting user profile:', profileError);
          throw new Error(`User profile silinərkən xəta: ${profileError.message}`);
        }
      }
      
      toast.success('İstifadəçi tamamilə silindi', {
        description: 'İstifadəçi və bütün məlumatları sistemdən silindi'
      });
      
      // Send notification to admins (non-blocking)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await NotificationCreator.createUserDeletionNotification(
            userId,
            existingUser.full_name || 'Silinnən istifadəçi',
            user.id,
            'hard'
          );
        }
      } catch (notifError) {
        console.warn('⚠️  Could not send deletion notification:', notifError);
        // Don't fail the deletion if notification fails
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Hard delete service error:', error);
      
      // Provide specific error messages
      if (error.message?.includes('permission') || error.message?.includes('Permission')) {
        toast.error('İcazə xətası', {
          description: 'Bu istifadəçini silmək üçün səlahiyyətiniz yoxdur'
        });
      } else if (error.message?.includes('foreign key')) {
        toast.error('Məlumat əlaqəsi xətası', {
          description: 'Bu istifadəçi silinə bilməz - əlaqəli məlumatlar mövcuddur'
        });
      } else if (error.message?.includes('not found')) {
        toast.error('İstifadəçi tapılmadı', {
          description: 'Silinməli istifadəçi tapılmadı'
        });
      } else {
        toast.error('İstifadəçi silinərkən xəta', {
          description: error.message || 'Naməlum xəta baş verdi'
        });
      }
      
      return false;
    }
  },

  /**
   * Check user dependencies before hard delete (like sectors do)
   * @param userId - User ID to check dependencies for
   * @returns Promise<{hasActiveData: boolean, details: any}> - Dependency status
   */
  async checkUserDependencies(userId: string): Promise<{hasActiveData: boolean, details: any}> {
    try {
      console.log('🔍 Checking user dependencies for:', userId);
      
      // Check if user has created any data entries
      const { count: dataEntriesCount, error: dataError } = await supabase
        .from('data_entries')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId);
      
      // Check if user has approved any data entries
      const { count: approvedEntriesCount, error: approvedError } = await supabase
        .from('data_entries')
        .select('*', { count: 'exact', head: true })
        .eq('approved_by', userId);
      
      // Check if user is assigned to any active school/sector/region
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', userId);
      
      const details = {
        dataEntriesCreated: dataEntriesCount || 0,
        dataEntriesApproved: approvedEntriesCount || 0,
        activeRoles: roles || [],
        errors: [dataError, approvedError, rolesError].filter(Boolean)
      };
      
      // Consider user has active data if they created/approved entries or have critical roles
      const hasActiveData = (dataEntriesCount || 0) > 0 || 
                           (approvedEntriesCount || 0) > 0 ||
                           (roles && roles.some(role => role.role === 'superadmin'));
      
      console.log('📊 User dependency check result:', { userId, hasActiveData, details });
      
      return { hasActiveData, details };
    } catch (error) {
      console.error('❌ Error checking user dependencies:', error);
      // On error, assume user has dependencies to be safe
      return { hasActiveData: true, details: { error: error.message } };
    }
  },

  /**
   * Restore a soft-deleted user (following school/sector pattern)
   * @param userId - Target user ID to restore
   * @returns Promise<boolean> - Success status
   */
  async restoreUser(userId: string): Promise<boolean> {
    try {
      console.log('🔄 Starting user restore for:', userId);
      
      // Check if user exists and is soft deleted
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, full_name, deleted_at')
        .eq('id', userId)
        .single();
      
      if (checkError) {
        console.error('❌ Error checking user:', checkError);
        throw new Error('İstifadəçi tapılmadı');
      }
      
      if (!existingUser.deleted_at) {
        toast.info('İstifadəçi artıq aktiv vəziyyətdədir');
        return true;
      }
      
      // Restore the user (direct update like schools/sectors)
      const currentTime = new Date().toISOString();
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          deleted_at: null,
          deleted_by: null,
          status: 'active',
          updated_at: currentTime
        })
        .eq('id', userId)
        .not('deleted_at', 'is', null); // Only restore soft-deleted users
      
      if (updateError) {
        console.error('❌ Restore error:', updateError);
        throw updateError;
      }
      
      // Create audit log for restoration
      try {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: currentUser.user?.id,
            action: 'restore',
            entity_type: 'user',
            entity_id: userId,
            old_value: { ...existingUser, deleted_at: existingUser.deleted_at },
            new_value: { ...existingUser, deleted_at: null, status: 'active' },
            created_at: currentTime
          });
      } catch (auditError) {
        console.warn('⚠️  Could not create audit log:', auditError);
      }
      
      console.log('✅ User restored successfully');
      toast.success('İstifadəçi bərpa edildi', {
        description: 'İstifadəçi uğurla bərpa edildi və aktiv vəziyyətdədir'
      });
      
      // Send notification to admins (non-blocking)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await NotificationCreator.createUserRestorationNotification(
            userId,
            existingUser.full_name || 'Naməlum istifadəçi',
            user.id
          );
        }
      } catch (notifError) {
        console.warn('⚠️  Could not send restoration notification:', notifError);
        // Don't fail the restoration if notification fails
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Restore service error:', error);
      
      toast.error('İstifadəçi bərpa edilərkən xəta', {
        description: error.message || 'Naməlum xəta baş verdi'
      });
      
      return false;
    }
  },

  /**
   * Get list of soft-deleted users (for admin management)
   * @returns Promise<any[]> - List of soft-deleted users
   */
  async getSoftDeletedUsers(): Promise<any[]> {
    try {
      console.log('📋 Fetching soft-deleted users');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          deleted_at,
          deleted_by,
          created_at,
          status
        `)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching soft-deleted users:', error);
        throw error;
      }
      
      console.log(`📊 Found ${data?.length || 0} soft-deleted users`);
      return data || [];
    } catch (error: any) {
      console.error('❌ Get soft-deleted users error:', error);
      toast.error('Silinmiş istifadəçilər əldə edilərkən xəta', {
        description: error.message || 'Naməlum xəta baş verdi'
      });
      return [];
    }
  },

  /**
   * Get audit logs for user deletion activities
   * @param userId - Optional: Filter by specific user
   * @returns Promise<any[]> - List of audit logs
   */
  async getDeletionAuditLogs(userId?: string): Promise<any[]> {
    try {
      console.log('📋 Fetching deletion audit logs');
      
      let query = supabase
        .from('audit_logs')
        .select(`
          id,
          user_id,
          action,
          entity_type,
          entity_id,
          old_value,
          new_value,
          created_at
        `)
        .in('action', ['soft_delete', 'hard_delete', 'restore'])
        .eq('entity_type', 'user')
        .order('created_at', { ascending: false });
      
      if (userId) {
        query = query.eq('entity_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching audit logs:', error);
        throw error;
      }
      
      console.log(`📊 Found ${data?.length || 0} deletion audit logs`);
      return data || [];
    } catch (error: any) {
      console.error('❌ Get audit logs error:', error);
      toast.error('Audit logları əldə edilərkən xəta', {
        description: error.message || 'Naməlum xəta baş verdi'
      });
      return [];
    }
  },

  /**
   * Bulk soft delete multiple users (following sector pattern)
   * @param userIds - Array of user IDs to soft delete
   * @returns Promise<{success: number, failed: number, errors: string[]}> - Bulk operation result
   */
  async bulkSoftDeleteUsers(userIds: string[]): Promise<{success: number, failed: number, errors: string[]}> {
    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    console.log(`🗑️  Starting bulk soft delete for ${userIds.length} users`);
    
    for (const userId of userIds) {
      try {
        const success = await this.softDeleteUser(userId);
        if (success) {
          result.success++;
        } else {
          result.failed++;
          result.errors.push(`Failed to soft delete user ${userId}`);
        }
      } catch (error: any) {
        result.failed++;
        result.errors.push(`Error deleting user ${userId}: ${error.message}`);
      }
    }
    
    // Show summary toast
    if (result.success > 0) {
      toast.success(`Toplu əməliyyat tamamlandı`, {
        description: `${result.success} istifadəçi deaktiv edildi, ${result.failed} xəta`
      });
    } else {
      toast.error('Toplu əməliyyat uğursuz', {
        description: `Bütün əməliyyatlar uğursuz oldu`
      });
    }
    
    console.log('📊 Bulk soft delete result:', result);
    return result;
  }
};

// Legacy exports for backward compatibility
export const deleteUser = userDeleteService.hardDeleteUser;
export const softDeleteUser = userDeleteService.softDeleteUser;
export const hardDeleteUser = userDeleteService.hardDeleteUser;
export const restoreUser = userDeleteService.restoreUser;
export const getSoftDeletedUsers = userDeleteService.getSoftDeletedUsers;
export const getDeletionAuditLogs = userDeleteService.getDeletionAuditLogs;
export const bulkSoftDeleteUsers = userDeleteService.bulkSoftDeleteUsers;

export default userDeleteService;