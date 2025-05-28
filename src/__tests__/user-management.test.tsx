import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import UserManagement from '@/pages/UserManagement';
import { mockSupabase, mockUserRole, mockEdgeFunctions } from './test-utils';
import { useUsersQuery } from '@/hooks/users/useUsersQuery';
import { createUser } from '@/integrations/edge-functions';

vi.mock('@/hooks/users/useUsersQuery');
vi.mock('@/integrations/edge-functions', () => ({
  createUser: vi.fn()
}));

describe('User Management', () => {
  beforeEach(() => {
    mockSupabase();
    mockUserRole('superadmin');
    mockEdgeFunctions();

    (useUsersQuery as any).mockReturnValue({
      users: [],
      loading: false,
      error: null,
      total: 0,
      page: 1,
      limit: 10,
      setPage: vi.fn(),
      setLimit: vi.fn(),
      search: '',
      setSearch: vi.fn(),
      roleFilter: [],
      setRoleFilter: vi.fn(),
      statusFilter: [],
      setStatusFilter: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      refetch: vi.fn()
    });
  });

  it('should render UserManagement page', () => {
    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );
    expect(screen.getByText('İstifadəçilər')).toBeInTheDocument();
  });

  it('should open create user dialog', async () => {
    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );
    const createUserButton = screen.getByText('İstifadəçi yarat');
    await userEvent.click(createUserButton);
    expect(screen.getByText('Yeni istifadəçi yarat')).toBeInTheDocument();
  });

  it('should create user with proper form data', async () => {
    const createUserMock = vi.fn().mockResolvedValue({ success: true });
    (useUsersQuery as any).mockReturnValue({
      users: [],
      loading: false,
      error: null,
      total: 0,
      page: 1,
      limit: 10,
      setPage: vi.fn(),
      setLimit: vi.fn(),
      search: '',
      setSearch: vi.fn(),
      roleFilter: [],
      setRoleFilter: vi.fn(),
      statusFilter: [],
      setStatusFilter: vi.fn(),
      createUser: createUserMock,
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      refetch: vi.fn()
    });

    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );

    const createUserButton = screen.getByText('İstifadəçi yarat');
    await userEvent.click(createUserButton);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Ad Soyad'), {
      target: { value: 'Test User' }
    });
    fireEvent.click(screen.getByText('Məktəb Admini'));

    const submitButton = screen.getByText('Yarat');
    
    await userEvent.click(submitButton);
    
    expect(createUserMock).toHaveBeenCalledWith({
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'schooladmin'
    });
  });

  it('should display error message when create user fails', async () => {
    (useUsersQuery as any).mockReturnValue({
      users: [],
      loading: false,
      error: null,
      total: 0,
      page: 1,
      limit: 10,
      setPage: vi.fn(),
      setLimit: vi.fn(),
      search: '',
      setSearch: vi.fn(),
      roleFilter: [],
      setRoleFilter: vi.fn(),
      statusFilter: [],
      setStatusFilter: vi.fn(),
      createUser: vi.fn().mockRejectedValue(new Error('Failed to create user')),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      refetch: vi.fn()
    });

    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );

    const createUserButton = screen.getByText('İstifadəçi yarat');
    await userEvent.click(createUserButton);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Ad Soyad'), {
      target: { value: 'Test User' }
    });
    fireEvent.click(screen.getByText('Məktəb Admini'));

    const submitButton = screen.getByText('Yarat');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Xəta: Failed to create user')).toBeInTheDocument();
    });
  });
});
