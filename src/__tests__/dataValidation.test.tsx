import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createTestWrapper } from '../setupTests';
import DataEntryForm from '../components/DataEntry/DataEntryForm';
import { LanguageProvider } from '../context/LanguageContext';

// Mock hooks
vi.mock('../hooks/auth/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '123',
      role: 'schooladmin',
      schoolId: '456'
    },
    isAuthenticated: true
  })
}));

describe('Data Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithWrapper = (ui: React.ReactElement) => {
    return render(ui, {
      wrapper: createTestWrapper({
        initialAuthState: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: 'superadmin'
          },
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              user_metadata: { role: 'superadmin' }
            }
          },
          isAuthenticated: true,
          isLoading: false,
          error: null
        }
      })
    });
  };

  it('boş sahələr üçün validasiya', async () => {
    renderWithWrapper(
      <LanguageProvider>
        <DataEntryForm />
      </LanguageProvider>
    );

    const submitButton = screen.getByText('Təsdiqlə');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Bu sahə məcburidir')).toBeInTheDocument();
    });
  });

  it('rəqəm sahələri üçün validasiya', async () => {
    renderWithWrapper(
      <LanguageProvider>
        <DataEntryForm />
      </LanguageProvider>
    );

    const numericInput = screen.getByLabelText('Şagird sayı');
    fireEvent.change(numericInput, { target: { value: 'abc' } });

    await waitFor(() => {
      expect(screen.getByText('Bu sahə yalnız rəqəm ola bilər')).toBeInTheDocument();
    });
  });

  it('maksimum hədd validasiyası', async () => {
    renderWithWrapper(
      <LanguageProvider>
        <DataEntryForm />
      </LanguageProvider>
    );

    const numericInput = screen.getByLabelText('Şagird sayı');
    fireEvent.change(numericInput, { target: { value: '99999' } });

    await waitFor(() => {
      expect(screen.getByText('Maksimum hədd 10000-dir')).toBeInTheDocument();
    });
  });

  it('minimum hədd validasiyası', async () => {
    renderWithWrapper(
      <LanguageProvider>
        <DataEntryForm />
      </LanguageProvider>
    );

    const numericInput = screen.getByLabelText('Şagird sayı');
    fireEvent.change(numericInput, { target: { value: '-1' } });

    await waitFor(() => {
      expect(screen.getByText('Minimum hədd 0-dır')).toBeInTheDocument();
    });
  });

  it('email format validasiyası', async () => {
    renderWithWrapper(
      <LanguageProvider>
        <DataEntryForm />
      </LanguageProvider>
    );

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    await waitFor(() => {
      expect(screen.getByText('Düzgün email formatı daxil edin')).toBeInTheDocument();
    });
  });

  it('tarix validasiyası', async () => {
    renderWithWrapper(
      <LanguageProvider>
        <DataEntryForm />
      </LanguageProvider>
    );

    const dateInput = screen.getByLabelText('Tarix');
    fireEvent.change(dateInput, { target: { value: '2025-13-45' } });

    await waitFor(() => {
      expect(screen.getByText('Düzgün tarix formatı daxil edin')).toBeInTheDocument();
    });
  });

  it('uğurlu form təsdiqi', async () => {
    const onSubmit = vi.fn();
    renderWithWrapper(
      <LanguageProvider>
        <DataEntryForm onSubmit={onSubmit} />
      </LanguageProvider>
    );

    // Bütün məcburi sahələri dolduraq
    fireEvent.change(screen.getByLabelText('Şagird sayı'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Tarix'), { target: { value: '2025-04-18' } });

    const submitButton = screen.getByText('Təsdiqlə');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(screen.queryByText('Bu sahə məcburidir')).not.toBeInTheDocument();
    });
  });

  it('xəta mesajlarının təmizlənməsi', async () => {
    renderWithWrapper(
      <LanguageProvider>
        <DataEntryForm />
      </LanguageProvider>
    );

    const numericInput = screen.getByLabelText('Şagird sayı');
    
    // Əvvəlcə səhv dəyər daxil edək
    fireEvent.change(numericInput, { target: { value: 'abc' } });
    
    await waitFor(() => {
      expect(screen.getByText('Bu sahə yalnız rəqəm ola bilər')).toBeInTheDocument();
    });

    // Sonra düzgün dəyər daxil edək
    fireEvent.change(numericInput, { target: { value: '100' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Bu sahə yalnız rəqəm ola bilər')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases in Data Validation', () => {
    describe('Rəqəm sahələri', () => {
      it('çox böyük rəqəmlər', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Şagird sayı');
        fireEvent.change(input, { target: { value: '999999999999999' } });

        await waitFor(() => {
          expect(screen.getByText('Daxil edilən rəqəm həddindən böyükdür')).toBeInTheDocument();
        });
      });

      it('kəsr ədədlər', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Şagird sayı');
        fireEvent.change(input, { target: { value: '12.34' } });

        await waitFor(() => {
          expect(screen.getByText('Yalnız tam ədədlər daxil edilə bilər')).toBeInTheDocument();
        });
      });

      it('sıfırlar', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Şagird sayı');
        fireEvent.change(input, { target: { value: '00123' } });

        await waitFor(() => {
          expect(input).toHaveValue('123');
        });
      });
    });

    describe('Mətn sahələri', () => {
      it('xüsusi simvollar', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Sektor adı');
        fireEvent.change(input, { target: { value: '<script>alert("test")</script>' } });

        await waitFor(() => {
          expect(screen.getByText('Xüsusi simvollar istifadə edilə bilməz')).toBeInTheDocument();
        });
      });

      it('uzun mətnlər', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Sektor adı');
        const longText = 'a'.repeat(1001);
        fireEvent.change(input, { target: { value: longText } });

        await waitFor(() => {
          expect(screen.getByText('Maksimum 1000 simvol daxil edilə bilər')).toBeInTheDocument();
        });
      });

      it('yalnız boşluqlar', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Sektor adı');
        fireEvent.change(input, { target: { value: '   ' } });

        await waitFor(() => {
          expect(screen.getByText('Bu sahə boş ola bilməz')).toBeInTheDocument();
        });
      });
    });

    describe('Tarix sahələri', () => {
      it('gələcək tarixlər', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Tarix');
        const futureDate = '2026-01-01';
        fireEvent.change(input, { target: { value: futureDate } });

        await waitFor(() => {
          expect(screen.getByText('Gələcək tarix seçilə bilməz')).toBeInTheDocument();
        });
      });

      it('çox köhnə tarixlər', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Tarix');
        fireEvent.change(input, { target: { value: '1900-01-01' } });

        await waitFor(() => {
          expect(screen.getByText('Tarix 2000-ci ildən əvvəl ola bilməz')).toBeInTheDocument();
        });
      });

      it('29 fevral', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Tarix');
        // Uzun il
        fireEvent.change(input, { target: { value: '2024-02-29' } });
        expect(input).toHaveValue('2024-02-29');

        // Uzun il olmayan
        fireEvent.change(input, { target: { value: '2023-02-29' } });
        await waitFor(() => {
          expect(screen.getByText('Düzgün tarix daxil edin')).toBeInTheDocument();
        });
      });
    });

    describe('Email sahələri', () => {
      it('domain olmayan email', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Email');
        fireEvent.change(input, { target: { value: 'test@' } });

        await waitFor(() => {
          expect(screen.getByText('Düzgün email formatı daxil edin')).toBeInTheDocument();
        });
      });

      it('@ işarəsi olmayan email', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Email');
        fireEvent.change(input, { target: { value: 'test.example.com' } });

        await waitFor(() => {
          expect(screen.getByText('Düzgün email formatı daxil edin')).toBeInTheDocument();
        });
      });

      it('çox uzun email', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Email');
        const longEmail = 'a'.repeat(200) + '@example.com';
        fireEvent.change(input, { target: { value: longEmail } });

        await waitFor(() => {
          expect(screen.getByText('Email ünvanı çox uzundur')).toBeInTheDocument();
        });
      });
    });

    describe('Məlumatların sinxronizasiyası', () => {
      it('eyni vaxtda bir neçə dəyişiklik', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const sectorInput = screen.getByLabelText('Sektor adı');
        const countInput = screen.getByLabelText('Şagird sayı');
        const dateInput = screen.getByLabelText('Tarix');

        // Eyni vaxtda bir neçə dəyişiklik
        fireEvent.change(sectorInput, { target: { value: 'Test Sektor' } });
        fireEvent.change(countInput, { target: { value: '100' } });
        fireEvent.change(dateInput, { target: { value: '2025-04-18' } });

        const submitButton = screen.getByText('Təsdiqlə');
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Məlumatlar uğurla yadda saxlanıldı')).toBeInTheDocument();
        });
      });

      it('tez-tez dəyişikliklər', async () => {
        renderWithWrapper(
          <LanguageProvider>
            <DataEntryForm />
          </LanguageProvider>
        );

        const input = screen.getByLabelText('Şagird sayı');

        // Tez-tez dəyişikliklər
        for (let i = 0; i < 10; i++) {
          fireEvent.change(input, { target: { value: i.toString() } });
        }

        await waitFor(() => {
          expect(input).toHaveValue('9');
        });
      });
    });
  });
});