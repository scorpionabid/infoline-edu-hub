
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
