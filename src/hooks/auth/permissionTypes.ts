
export type PermissionLevel = 'read' | 'write' | 'admin';

export interface PermissionResult {
  granted: boolean;
  message: string;
  code?: string;
}

export type PermissionChecker = (resource: string, action: string, level?: PermissionLevel) => PermissionResult;
