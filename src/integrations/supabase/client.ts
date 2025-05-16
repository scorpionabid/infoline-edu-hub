import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Supabase client configuration
const supabaseUrl = "https://olbfnauhzpdskqnxtwav.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4";

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing');
  throw new Error('Supabase configuration is incomplete');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        try {
          const value = localStorage.getItem(key);
          return value;
        } catch (error) {
          console.error('Error getting item from storage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error setting item in storage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing item from storage:', error);
        }
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-client'
    }
  }
});

// Types for service responses
type ServiceResponse<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * Supabase Edge Functions handler
 */
export async function callEdgeFunction<T = any>(
  functionName: string,
  options?: {
    body?: object;
    headers?: Record<string, string>;
  }
): Promise<ServiceResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke<T>(functionName, {
      body: options?.body,
      headers: options?.headers,
    });

    if (error) {
      console.error(`Error invoking ${functionName}:`, error);
      return { data: null, error: error as Error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error(`Exception in ${functionName}:`, error);
    return { data: null, error };
  }
}

/**
 * Profile services
 */
export const profileService = {
  /**
   * Get user profile by ID
   */
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getProfile:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in updateProfile:', error);
      return null;
    }
  },

  /**
   * Get all users
   */
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getUsers:', error);
      return [];
    }
  },

  /**
   * Update user details
   */
  async updateUser(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in updateUser:', error);
      return null;
    }
  },

  /**
   * Delete user
   */
  async deleteUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deleteUser:', error);
      return false;
    }
  },
};

/**
 * Location services (Regions, Sectors, Schools)
 */
export const locationService = {
  /**
   * Get all regions
   */
  async getRegions() {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching regions:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getRegions:', error);
      return [];
    }
  },

  /**
   * Get sectors by region ID
   */
  async getSectors(regionId: string) {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('region_id', regionId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching sectors:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getSectors:', error);
      return [];
    }
  },

  /**
   * Get schools by sector ID
   */
  async getSchools(sectorId: string) {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('sector_id', sectorId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching schools:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getSchools:', error);
      return [];
    }
  },

  /**
   * Get school details
   */
  async getSchoolDetails(schoolId: string) {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();

      if (error) {
        console.error('Error fetching school details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getSchoolDetails:', error);
      return null;
    }
  },

  /**
   * Get sector details
   */
  async getSectorDetails(sectorId: string) {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', sectorId)
        .single();

      if (error) {
        console.error('Error fetching sector details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getSectorDetails:', error);
      return null;
    }
  },

  /**
   * Get region details
   */
  async getRegionDetails(regionId: string) {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('id', regionId)
        .single();

      if (error) {
        console.error('Error fetching region details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getRegionDetails:', error);
      return null;
    }
  },

  /**
   * School CRUD operations
   */
  async createSchool(school: any) {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert([school])
        .select()
        .single();

      if (error) {
        console.error('Error creating school:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createSchool:', error);
      return null;
    }
  },

  async updateSchool(schoolId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', schoolId)
        .select()
        .single();

      if (error) {
        console.error('Error updating school:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in updateSchool:', error);
      return null;
    }
  },

  async deleteSchool(schoolId: string) {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);

      if (error) {
        console.error('Error deleting school:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deleteSchool:', error);
      return false;
    }
  },

  /**
   * Sector CRUD operations
   */
  async createSector(sector: any) {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .insert([sector])
        .select()
        .single();

      if (error) {
        console.error('Error creating sector:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createSector:', error);
      return null;
    }
  },

  async updateSector(sectorId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .update(updates)
        .eq('id', sectorId)
        .select()
        .single();

      if (error) {
        console.error('Error updating sector:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in updateSector:', error);
      return null;
    }
  },

  async deleteSector(sectorId: string) {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', sectorId);

      if (error) {
        console.error('Error deleting sector:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deleteSector:', error);
      return false;
    }
  },

  /**
   * Region CRUD operations
   */
  async createRegion(region: any) {
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert([region])
        .select()
        .single();

      if (error) {
        console.error('Error creating region:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createRegion:', error);
      return null;
    }
  },

  async updateRegion(regionId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('regions')
        .update(updates)
        .eq('id', regionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating region:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in updateRegion:', error);
      return null;
    }
  },

  async deleteRegion(regionId: string) {
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', regionId);

      if (error) {
        console.error('Error deleting region:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deleteRegion:', error);
      return false;
    }
  },
};

/**
 * Category and Column services
 */
export const categoryService = {
  /**
   * Get all categories
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getCategories:', error);
      return [];
    }
  },

  /**
   * Get columns by category ID
   */
  async getColumns(categoryId: string) {
    try {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching columns:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getColumns:', error);
      return [];
    }
  },

  /**
   * Get category details
   */
  async getCategoryDetails(categoryId: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) {
        console.error('Error fetching category details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getCategoryDetails:', error);
      return null;
    }
  },

  /**
   * Get column details
   */
  async getColumnDetails(columnId: string) {
    try {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('id', columnId)
        .single();

      if (error) {
        console.error('Error fetching column details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getColumnDetails:', error);
      return null;
    }
  },

  /**
   * Category CRUD operations
   */
  async createCategory(category: any) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createCategory:', error);
      return null;
    }
  },

  async updateCategory(categoryId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in updateCategory:', error);
      return null;
    }
  },

  async deleteCategory(categoryId: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting category:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deleteCategory:', error);
      return false;
    }
  },

  /**
   * Column CRUD operations
   */
  async createColumn(column: any) {
    try {
      const { data, error } = await supabase
        .from('columns')
        .insert([column])
        .select()
        .single();

      if (error) {
        console.error('Error creating column:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createColumn:', error);
      return null;
    }
  },

  async updateColumn(columnId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('columns')
        .update(updates)
        .eq('id', columnId)
        .select()
        .single();

      if (error) {
        console.error('Error updating column:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in updateColumn:', error);
      return null;
    }
  },

  async deleteColumn(columnId: string) {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (error) {
        console.error('Error deleting column:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deleteColumn:', error);
      return false;
    }
  },
};

/**
 * Data Entry services
 */
export const dataEntryService = {
  /**
   * Get data entries by school and category
   */
  async getDataEntries(schoolId: string, categoryId: string) {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (error) {
        console.error('Error fetching data entries:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getDataEntries:', error);
      return [];
    }
  },

  /**
   * Create a new data entry
   */
  async createDataEntry(entry: any) {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .insert([entry])
        .select()
        .single();

      if (error) {
        console.error('Error creating data entry:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createDataEntry:', error);
      return null;
    }
  },

  /**
   * Update a data entry
   */
  async updateDataEntry(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating data entry:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in updateDataEntry:', error);
      return null;
    }
  },

  /**
   * Delete a data entry
   */
  async deleteDataEntry(id: string) {
    try {
      const { error } = await supabase
        .from('data_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting data entry:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deleteDataEntry:', error);
      return false;
    }
  },
};

/**
 * Notification services
 */
export const notificationService = {
  /**
   * Get notifications for a user
   */
  async getNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getNotifications:', error);
      return [];
    }
  },

  /**
   * Create a notification
   */
  async createNotification(notification: any) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createNotification:', error);
      return null;
    }
  },

  /**
   * Update a notification
   */
  async updateNotification(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in updateNotification:', error);
      return null;
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deleteNotification:', error);
      return false;
    }
  },
};

/**
 * Dashboard and analytics services
 */
export const analyticsService = {
  /**
   * Get dashboard stats
   */
  async getDashboardStats() {
    try {
      // This would be replaced with actual database calls
      // For now returning mock data
      return {
        totalSchools: 100,
        activeSchools: 80,
        pendingForms: 20,
      };
    } catch (error) {
      console.error('Unexpected error in getDashboardStats:', error);
      return {
        totalSchools: 0,
        activeSchools: 0,
        pendingForms: 0,
      };
    }
  },

  /**
   * Get completion rate for a category
   */
  async getCompletionRate(categoryId: string) {
    try {
      // This would be replaced with actual database calls
      // For now returning mock data
      return 75;
    } catch (error) {
      console.error('Unexpected error in getCompletionRate:', error);
      return 0;
    }
  },

  /**
   * Get recent form submissions
   */
  async getRecentSubmissions() {
    try {
      // This would be replaced with actual database calls
      // For now returning empty array
      return [];
    } catch (error) {
      console.error('Unexpected error in getRecentSubmissions:', error);
      return [];
    }
  },

  /**
   * Get form statistics
   */
  async getFormStats() {
    try {
      // This would be replaced with actual database calls
      // For now returning mock data
      return {
        pending: 10,
        approved: 50,
        rejected: 5,
        total: 65,
      };
    } catch (error) {
      console.error('Unexpected error in getFormStats:', error);
      return {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
      };
    }
  },
};

/**
 * File services
 */
export const fileService = {
  /**
   * Upload a file
   */
  async uploadFile(file: File, path: string = 'public') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 11)}_${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading file:', error);
        return null;
      }

      // Get the URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Unexpected error in uploadFile:', error);
      return null;
    }
  },

  /**
   * Get uploaded files
   */
  async getUploadedFiles(path: string = 'public') {
    try {
      const { data, error } = await supabase.storage
        .from('uploads')
        .list(path);

      if (error) {
        console.error('Error fetching files:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getUploadedFiles:', error);
      return [];
    }
  },

  /**
   * Delete a file
   */
  async deleteFile(filePath: string) {
    try {
      const { error } = await supabase.storage
        .from('uploads')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deleteFile:', error);
      return false;
    }
  },
};

/**
 * Form services
 */
export const formService = {
  /**
   * Get form data
   */
  async getFormData(formId: string) {
    try {
      // This would be replaced with actual database calls
      // For now returning mock data
      return {
        title: 'Sample Form',
        fields: [],
      };
    } catch (error) {
      console.error('Unexpected error in getFormData:', error);
      return null;
    }
  },

  /**
   * Submit a form
   */
  async submitForm(formId: string, data: any) {
    try {
      // This would be replaced with actual database calls
      // For now returning mock success
      return {
        success: true,
      };
    } catch (error) {
      console.error('Unexpected error in submitForm:', error);
      return {
        success: false,
      };
    }
  },

  /**
   * Get form templates
   */
  async getFormTemplates() {
    try {
      // This would be replaced with actual database calls
      // For now returning empty array
      return [];
    } catch (error) {
      console.error('Unexpected error in getFormTemplates:', error);
      return [];
    }
  },
};

/**
 * Admin assignment services
 */
export const adminService = {
  /**
   * Assign a school admin
   */
  async assignSchoolAdmin(schoolId: string, userId: string) {
    try {
      // This would be replaced with actual database calls
      // For now returning mock success
      return {
        success: true,
      };
    } catch (error) {
      console.error('Unexpected error in assignSchoolAdmin:', error);
      return {
        success: false,
      };
    }
  },

  /**
   * Assign a sector admin
   */
  async assignSectorAdmin(sectorId: string, userId: string) {
    try {
      // This would be replaced with actual database calls
      // For now returning mock success
      return {
        success: true,
      };
    } catch (error) {
      console.error('Unexpected error in assignSectorAdmin:', error);
      return {
        success: false,
      };
    }
  },

  /**
   * Assign a region admin
   */
  async assignRegionAdmin(regionId: string, userId: string) {
    try {
      // This would be replaced with actual database calls
      // For now returning mock success
      return {
        success: true,
      };
    } catch (error) {
      console.error('Unexpected error in assignRegionAdmin:', error);
      return {
        success: false,
      };
    }
  },
};

// Export convenience aliases for backward compatibility
export const getProfile = profileService.getProfile;
export const updateProfile = profileService.updateProfile;
export const getRegions = locationService.getRegions;
export const getSectors = locationService.getSectors;
export const getSchools = locationService.getSchools;
export const getCategories = categoryService.getCategories;
export const getColumns = categoryService.getColumns;
export const getDataEntries = dataEntryService.getDataEntries;
export const updateDataEntry = dataEntryService.updateDataEntry;
export const createDataEntry = dataEntryService.createDataEntry;
export const deleteDataEntry = dataEntryService.deleteDataEntry;
export const getUsers = profileService.getUsers;
export const updateUser = profileService.updateUser;
export const deleteUser = profileService.deleteUser;