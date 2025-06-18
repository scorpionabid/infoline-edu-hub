import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoginForm from '@/components/auth/LoginForm';
import { AuthProvider } from '@/contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';

// Mock the translation context
vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => key,
    language: 'az',
    setLanguage: vi.fn(),
    isLoading: false,
    error: null,
    isReady: true
  }))
}));

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(() => Promise.resolve()),
    logout: vi.fn(() => Promise.resolve()),
    user: null,
    isLoading: false,
    error: null,
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form elements', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Daxil ol' })).toBeInTheDocument();
  });

  it('calls the login function with correct data when the form is submitted', async () => {
    const loginMock = vi.fn(() => Promise.resolve());
    (vi.mocked(useTranslation)).mockImplementation(() => ({
      t: (key: string) => key,
      language: 'az',
      setLanguage: vi.fn(),
      isLoading: false,
      error: null,
      isReady: true
    }));
    (vi.mocked(useAuth)).mockImplementation(() => ({
      login: loginMock,
      logout: vi.fn(() => Promise.resolve()),
      user: null,
      isLoading: false,
      error: null,
    }));

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Daxil ol' }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays an error message if login fails', async () => {
    (vi.mocked(useTranslation)).mockImplementation(() => ({
      t: (key: string) => key,
      language: 'az',
      setLanguage: vi.fn(),
      isLoading: false,
      error: null,
      isReady: true
    }));
    (vi.mocked(useAuth)).mockImplementation(() => ({
      login: vi.fn(() => Promise.reject('Invalid credentials')),
      logout: vi.fn(() => Promise.resolve()),
      user: null,
      isLoading: false,
      error: null,
    }));

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'Daxil ol' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
