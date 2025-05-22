
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

/**
 * Enhanced region with additional calculated or joined fields
 */
export interface EnhancedRegion extends Region {
  // Required fields
  id: string; 
  
  // Count fields (with various naming conventions for compatibility)
  school_count?: number;
  sector_count?: number;
  schools_count?: number;
  sectors_count?: number;
  
  // Admin info fields (with various naming conventions for compatibility)
  admin_name?: string;
  adminName?: string;
  adminEmail?: string;
  
  // Performance/stats fields
  completion_rate?: number;
  completionRate?: number;
  
  // Related object
  admin?: {
    id: string;
    full_name: string;
    email: string;
  };
}

// Export RegionAdminDialogProps and other types for compatibility
export interface RegionAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regionId: string;
}

export interface RegionFormData {
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface DeleteRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: Region;
  onDelete: () => void;
}

export interface EditRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: Region;
  onSave: (data: RegionFormData) => void;
}

export interface RegionDialogsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
