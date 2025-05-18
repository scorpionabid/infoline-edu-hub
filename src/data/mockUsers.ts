import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: '1',
    full_name: 'John Doe',
    email: 'john@example.com',
    avatar_url: 'https://i.pravatar.cc/150?img=1',
    role: 'superadmin',
    status: 'active',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true,
      deadlineReminders: true,
      statusUpdates: true,
      weeklyReports: true
    }
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    avatar_url: 'https://i.pravatar.cc/150?img=2',
    role: 'regionadmin',
    status: 'active',
    notificationSettings: {
      email: false,
      inApp: true,
      push: false,
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
    full_name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar_url: 'https://i.pravatar.cc/150?img=3',
    role: 'sectoradmin',
    status: 'inactive',
    notificationSettings: {
      email: true,
      inApp: false,
      push: true,
      sms: false,
      system: false,
      deadline: false,
      deadlineReminders: false,
      statusUpdates: true,
      weeklyReports: true
    }
  },
  {
    id: '4',
    full_name: 'Bob Williams',
    email: 'bob@example.com',
    avatar_url: 'https://i.pravatar.cc/150?img=4',
    role: 'schooladmin',
    status: 'pending',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: true,
      system: true,
      deadline: true,
      deadlineReminders: true,
      statusUpdates: true,
      weeklyReports: true
    }
  },
  {
    id: '5',
    full_name: 'Charlie Brown',
    email: 'charlie@example.com',
    avatar_url: 'https://i.pravatar.cc/150?img=5',
    role: 'user',
    status: 'active',
    notificationSettings: {
      email: false,
      inApp: false,
      push: false,
      sms: false,
      system: false,
      deadline: false,
      deadlineReminders: false,
      statusUpdates: false,
      weeklyReports: false
    }
  },
];

export default mockUsers;
