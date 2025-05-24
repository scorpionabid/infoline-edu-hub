
import { supabase } from '@/lib/supabase';
import { SchoolLink, CreateSchoolLinkData, UpdateSchoolLinkData } from '@/types/link';

export const linkService = {
  // Get all links for a school
  async getSchoolLinks(schoolId: string): Promise<SchoolLink[]> {
    const { data, error } = await supabase
      .from('school_links')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a new link
  async createLink(linkData: CreateSchoolLinkData): Promise<SchoolLink> {
    const { data, error } = await supabase
      .from('school_links')
      .insert({
        ...linkData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a link
  async updateLink(linkId: string, updateData: UpdateSchoolLinkData): Promise<SchoolLink> {
    const { data, error } = await supabase
      .from('school_links')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', linkId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a link (soft delete)
  async deleteLink(linkId: string): Promise<void> {
    const { error } = await supabase
      .from('school_links')
      .update({ is_active: false })
      .eq('id', linkId);

    if (error) throw error;
  }
};
