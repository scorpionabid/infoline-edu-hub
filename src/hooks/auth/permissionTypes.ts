
import { UserRole } from '@/types/supabase';

export type EntityPermission = 'view' | 'manage' | 'edit' | 'delete' | 'approve';

export interface EntityPermissions {
  users: {
    view: boolean;
    manage: boolean;
  };
  regions: {
    view: boolean;
    manage: boolean;
  };
  sectors: {
    view: boolean;
    manage: boolean;
  };
  schools: {
    view: boolean;
    manage: boolean;
  };
  categories: {
    view: boolean;
    manage: boolean;
  };
  data: {
    view: boolean;
    manage: boolean;
    approve: boolean;
  };
}

export type PermissionChecker = (role: UserRole) => boolean;

export interface RolePermissionsMap {
  [key: string]: {
    [permission: string]: boolean;
  };
}

export const DEFAULT_PERMISSIONS: EntityPermissions = {
  users: {
    view: false,
    manage: false,
  },
  regions: {
    view: false,
    manage: false,
  },
  sectors: {
    view: false,
    manage: false,
  },
  schools: {
    view: false,
    manage: false,
  },
  categories: {
    view: false,
    manage: false,
  },
  data: {
    view: false,
    manage: false,
    approve: false
  }
};
