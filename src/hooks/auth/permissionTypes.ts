
export type PermissionLevel = 'read' | 'write' | 'delete' | 'admin';

export interface PermissionChecker {
  (userId: string, entityId: string, level?: PermissionLevel): Promise<boolean>;
}

export interface PermissionResult {
  granted: boolean;
  message?: string;
  code?: string;
}
