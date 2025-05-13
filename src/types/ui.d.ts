
export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  type?: string;
  expanded?: boolean;
  selected?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  data?: any;
}

export interface SideNavItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
  items?: SideNavItem[];
  active?: boolean;
}

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ReactNode;
  label?: string;
  description?: string;
}

export interface Tab {
  id: string;
  label: string;
  count?: number;
  content?: React.ReactNode;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  region_id?: string;
  sector_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  principal_name?: string;
  logo?: string | null;
  region_name?: string;
  sector_name?: string;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  school_id?: string;
  sector_id?: string;
  region_id?: string;
  status?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}
