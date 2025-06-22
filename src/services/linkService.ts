import { supabase } from '@/integrations/supabase/client';
import { SchoolLink, CreateSchoolLinkData, UpdateSchoolLinkData } from '@/types/link';
import { ENV } from '@/config/environment';

export const linkService = {
  // Get all links for a school
  async getSchoolLinks(schoolId: string): Promise<SchoolLink[]> {
    try {
      console.log('🔍 Loading links for school:', schoolId);
      console.log('🔗 Supabase URL:', ENV.supabase.url);
      console.log('🔑 API Key present:', !!ENV.supabase.anonKey);
      
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('❌ Auth error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      console.log('👤 Current user:', user?.id, user?.email);
      
      const { data, error } = await supabase
        .from('school_links')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to fetch links: ${error.message}`);
      }

      console.log('✅ Loaded links:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('LinkService.getSchoolLinks error:', error);
      throw error;
    }
  },

  // Create a new link
  async createLink(linkData: CreateSchoolLinkData): Promise<SchoolLink> {
    try {
      console.log('Creating new link:', linkData);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('school_links')
        .insert({
          ...linkData,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating link:', error);
        throw new Error(`Failed to create link: ${error.message}`);
      }

      console.log('Link created successfully:', data);
      return data;
    } catch (error) {
      console.error('LinkService.createLink error:', error);
      throw error;
    }
  },

  // Update a link
  async updateLink(linkId: string, updateData: UpdateSchoolLinkData): Promise<SchoolLink> {
    try {
      console.log('Updating link:', linkId, updateData);
      
      const { data, error } = await supabase
        .from('school_links')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', linkId)
        .select()
        .single();

      if (error) {
        console.error('Error updating link:', error);
        throw new Error(`Failed to update link: ${error.message}`);
      }

      console.log('Link updated successfully:', data);
      return data;
    } catch (error) {
      console.error('LinkService.updateLink error:', error);
      throw error;
    }
  },

  // Delete a link (soft delete)
  async deleteLink(linkId: string): Promise<void> {
    try {
      console.log('Deleting link:', linkId);
      
      const { error } = await supabase
        .from('school_links')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', linkId);

      if (error) {
        console.error('Error deleting link:', error);
        throw new Error(`Failed to delete link: ${error.message}`);
      }

      console.log('Link deleted successfully');
    } catch (error) {
      console.error('LinkService.deleteLink error:', error);
      throw error;
    }
  },

  // Get link statistics for a school
  async getLinkStats(schoolId: string): Promise<{
    total: number;
    active: number;
    categories: string[];
  }> {
    try {
      const { data, error } = await supabase
        .from('school_links')
        .select('category, is_active')
        .eq('school_id', schoolId);

      if (error) {
        console.error('Error fetching link stats:', error);
        throw new Error(`Failed to fetch link stats: ${error.message}`);
      }

      const total = data?.length || 0;
      const active = data?.filter(link => link.is_active).length || 0;
      const categories = [...new Set(data?.map(link => link.category).filter(Boolean))] || [];

      return { total, active, categories };
    } catch (error) {
      console.error('LinkService.getLinkStats error:', error);
      throw error;
    }
  }
};
