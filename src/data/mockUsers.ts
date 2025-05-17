import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    full_name: 'Super Admin',
    role: 'superadmin',
    status: 'active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true,
      deadlineReminders: true,
      statusUpdates: true,
      weeklyReports: false
    }
  },
  {
    id: '2',
    email: 'region@example.com',
    full_name: 'Region Admin',
    role: 'regionadmin',
    status: 'active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=region',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true,
      deadlineReminders: true,
      statusUpdates: true,
      weeklyReports: false
    }
  },
  {
    id: '3',
    email: 'sector@example.com',
    full_name: 'Sector Admin',
    role: 'sectoradmin',
    status: 'active',
    region_id: 'reg1',
    sector_id: 'sec1',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sector',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true,
      deadlineReminders: true,
      statusUpdates: true,
      weeklyReports: false
    }
  },
  {
    id: '4',
    email: 'school@example.com',
    full_name: 'School Admin',
    role: 'schooladmin',
    status: 'active',
    region_id: 'reg1',
    sector_id: 'sec1',
    school_id: 'sch1',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=school',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true,
      deadlineReminders: true,
      statusUpdates: true,
      weeklyReports: false
    }
  },
  {
    id: '5',
    email: 'user@example.com',
    full_name: 'Regular User',
    role: 'user',
    status: 'active',
    region_id: 'reg1',
    sector_id: 'sec1',
    school_id: 'sch1',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true,
      deadlineReminders: true,
      statusUpdates: true,
      weeklyReports: false
    }
  },
  {
    id: '6',
    email: 'inactive@example.com',
    full_name: 'Inactive User',
    role: 'user',
    status: 'inactive',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=inactive',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true,
      deadlineReminders: true,
      statusUpdates: true,
      weeklyReports: false
    }
  },
  {
    id: '7',
    email: 'pending@example.com',
    full_name: 'Pending User',
    role: 'user',
    status: 'pending',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pending',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true,
      deadlineReminders: true,
      statusUpdates: true,
      weeklyReports: false
    }
  },
  {
    id: '8',
    email: 'suspended@example.com',
    full_name: 'Suspended User',
    role: 'user',
    status: 'suspended',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suspended',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true,
      deadlineReminders: true,
      statusUpdates: true,
      weeklyReports: false
    }
  }
];
