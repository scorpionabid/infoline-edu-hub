import { User } from '@/types/user';

const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'superadmin',
    avatar: '/avatars/avatar-1.png',
    position: 'Administrator',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'regionadmin',
    avatar: '/avatars/avatar-2.png',
    position: 'Regional Manager',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true
    }
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'sectoradmin',
    avatar: '/avatars/avatar-3.png',
    position: 'Sector Coordinator',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true
    }
  },
  {
    id: '4',
    name: 'Bob Williams',
    email: 'bob@example.com',
    role: 'schooladmin',
    avatar: '/avatars/avatar-4.png',
    position: 'School Principal',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true
    }
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'user',
    avatar: '/avatars/avatar-5.png',
    position: 'Teacher',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true
    }
  },
  {
    id: '6',
    name: 'Diana Miller',
    email: 'diana@example.com',
    role: 'user',
    avatar: '/avatars/avatar-6.png',
    position: 'Student',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true
    }
  },
  {
    id: '7',
    name: 'Ethan Davis',
    email: 'ethan@example.com',
    role: 'user',
    avatar: '/avatars/avatar-7.png',
    position: 'Parent',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true
    }
  },
  {
    id: '8',
    name: 'Fiona Wilson',
    email: 'fiona@example.com',
    role: 'user',
    avatar: '/avatars/avatar-8.png',
    position: 'Librarian',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      sms: false,
      system: true,
      deadline: true
    }
  }
];

export default users;
