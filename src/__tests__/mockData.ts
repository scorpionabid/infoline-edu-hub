export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'superadmin',
  language: 'az',
  status: 'active',
  created_at: '',
  updated_at: '',
  name: 'Test User',
};

export const mockAuth = {
  isAuthenticated: true,
  isLoading: false,
  user: mockUser,
  error: null,
  login: () => {},
  logout: () => {},
  clearError: () => {},
  updateUser: () => {},
};