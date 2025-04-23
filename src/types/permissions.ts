
export type EntityType = 'region' | 'sector' | 'school' | 'category' | 'column' | 'data_entry';

export interface AccessControl {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove?: boolean;
}

export interface EntityAccess {
  type: EntityType;
  id: string;
  access: AccessControl;
}

export interface DataAccessError {
  message: string;
  code: string;
}

export interface CategoryPermission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSubmit: boolean;
  canApprove: boolean;
}

export interface ColumnPermission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canValidate: boolean;
}

export interface DataEntryPermission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSubmit: boolean;
  canApprove: boolean;
}

export interface PermissionsState {
  userRole: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  permissions: {
    categories: Record<string, CategoryPermission>;
    columns: Record<string, ColumnPermission>;
    dataEntries: Record<string, DataEntryPermission>;
  };
}
