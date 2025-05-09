
export type PermissionLevel = 'read' | 'write' | 'admin';

export interface PermissionResult {
  granted: boolean;
  message: string;
  code?: string;
}
