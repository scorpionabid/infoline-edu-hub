
export interface Region {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  status?: 'active' | 'inactive';
  archived?: boolean;
  school_count?: number;
  sector_count?: number;
}

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
