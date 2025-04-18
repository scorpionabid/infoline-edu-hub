import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createTestWrapper } from '../setupTests';
import DataEntryForm from '../components/DataEntry/DataEntryForm';
import { LanguageProvider } from '../context/LanguageContext';

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', role: 'superadmin' },
    isAuthenticated: true,
    isLoading: false
  })
}));

// Mock category data
const mockCategories = [
  {
    id: '1',
    name: 'Test Kateqoriya 1',
    columns: [
      {
        id: 'student_count',
        name: 'Şagird sayı',
        type: 'number',
        is_required: true,
        placeholder: 'Şagird sayını daxil edin',
        validation: {
          min: 0,
          max: 1000
        }
      },
      {
        id: 'sector_name',
        name: 'Sektor adı',
        type: 'text',
        is_required: true,
        placeholder: 'Sektor adını daxil edin',
        validation: {
          maxLength: 1000
        }
      },
      {
        id: 'email',
        name: 'Email',
        type: 'email',
        is_required: true,
        placeholder: 'Email ünvanını daxil edin',
        validation: {
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        }
      },
      {
        id: 'date',
        name: 'Tarix',
        type: 'date',
        is_required: true,
        placeholder: 'Tarixi seçin',
        validation: {
          min: '2000-01-01',
          max: new Date().toISOString().split('T')[0]
        }
      }
    ]
  },
  {
    id: '2',
    name: 'Test Kateqoriya 2',
    columns: []
  }
];

// Mock useCategoryData hook
vi.mock('@/hooks/useCategoryData', () => ({
  useCategoryData: () => ({
    categories: mockCategories,
    loading: false,
    error: null
  })
}));

describe('Data Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithWrapper = (ui: React.ReactElement) => {
    return render(ui, {
      wrapper: ({ children }) => (
        createTestWrapper(
          <LanguageProvider>
            {children}
          </LanguageProvider>
        )
      )
    });
  };

  it('boş sahələr üçün validasiya', async () => {
    await act(async () => {
      renderWithWrapper(
        <DataEntryForm 
          initialData={{ 
            categories: mockCategories,
            activeTab: '1',
            entries: [],
            loading: false,
            error: null
          }} 
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Şagird sayı')).toBeInTheDocument();
    }, {
      timeout: 5000,
      interval: 100
    });

    const input = screen.getByLabelText('Şagird sayı');
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Bu sahə məcburidir')).toBeInTheDocument();
    });
  });

  it('rəqəm sahələri üçün validasiya', async () => {
    await act(async () => {
      renderWithWrapper(
        <DataEntryForm 
          initialData={{ 
            categories: mockCategories,
            activeTab: '1',
            entries: [],
            loading: false,
            error: null
          }} 
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Şagird sayı')).toBeInTheDocument();
    }, {
      timeout: 5000,
      interval: 100
    });

    const input = screen.getByLabelText('Şagird sayı');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'abc' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Bu sahə yalnız rəqəm ola bilər')).toBeInTheDocument();
    });
  });

  it('maksimum hədd validasiyası', async () => {
    await act(async () => {
      renderWithWrapper(
        <DataEntryForm 
          initialData={{ 
            categories: mockCategories,
            activeTab: '1',
            entries: [],
            loading: false,
            error: null
          }} 
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Şagird sayı')).toBeInTheDocument();
    }, {
      timeout: 5000,
      interval: 100
    });

    const input = screen.getByLabelText('Şagird sayı');
    await act(async () => {
      fireEvent.change(input, { target: { value: '99999' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Maksimum hədd 10000-dir')).toBeInTheDocument();
    });
  });

  it('minimum hədd validasiyası', async () => {
    await act(async () => {
      renderWithWrapper(
        <DataEntryForm 
          initialData={{ 
            categories: mockCategories,
            activeTab: '1',
            entries: [],
            loading: false,
            error: null
          }} 
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Şagird sayı')).toBeInTheDocument();
    }, {
      timeout: 5000,
      interval: 100
    });

    const input = screen.getByLabelText('Şagird sayı');
    await act(async () => {
      fireEvent.change(input, { target: { value: '-1' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Minimum hədd 0-dır')).toBeInTheDocument();
    });
  });

  it('email format validasiyası', async () => {
    await act(async () => {
      renderWithWrapper(
        <DataEntryForm 
          initialData={{ 
            categories: mockCategories,
            activeTab: '1',
            entries: [],
            loading: false,
            error: null
          }} 
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    }, {
      timeout: 5000,
      interval: 100
    });

    const input = screen.getByLabelText('Email');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'invalid-email' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Düzgün email formatı daxil edin')).toBeInTheDocument();
    });
  });

  it('tarix validasiyası', async () => {
    await act(async () => {
      renderWithWrapper(
        <DataEntryForm 
          initialData={{ 
            categories: mockCategories,
            activeTab: '1',
            entries: [],
            loading: false,
            error: null
          }} 
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Tarix')).toBeInTheDocument();
    }, {
      timeout: 5000,
      interval: 100
    });

    const input = screen.getByLabelText('Tarix');
    await act(async () => {
      fireEvent.change(input, { target: { value: '2025-13-45' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Düzgün tarix formatı daxil edin')).toBeInTheDocument();
    });
  });

  it('uğurlu form təsdiqi', async () => {
    const onSubmit = vi.fn();
    await act(async () => {
      renderWithWrapper(
        <DataEntryForm 
          initialData={{ 
            categories: mockCategories,
            activeTab: '1',
            entries: [],
            loading: false,
            error: null
          }} 
          onSubmit={onSubmit} 
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Şagird sayı')).toBeInTheDocument();
    }, {
      timeout: 5000,
      interval: 100
    });

    const input = screen.getByLabelText('Şagird sayı');
    await act(async () => {
      fireEvent.change(input, { target: { value: '100' } });
    });

    const submitButton = screen.getByText('Təsdiqlə');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(screen.queryByText('Bu sahə məcburidir')).not.toBeInTheDocument();
    });
  });

  it('xəta mesajlarının təmizlənməsi', async () => {
    await act(async () => {
      renderWithWrapper(
        <DataEntryForm 
          initialData={{ 
            categories: mockCategories,
            activeTab: '1',
            entries: [],
            loading: false,
            error: null
          }} 
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Şagird sayı')).toBeInTheDocument();
    }, {
      timeout: 5000,
      interval: 100
    });

    const input = screen.getByLabelText('Şagird sayı');
    
    // Əvvəlcə səhv dəyər daxil edək
    await act(async () => {
      fireEvent.change(input, { target: { value: 'abc' } });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Bu sahə yalnız rəqəm ola bilər')).toBeInTheDocument();
    });

    // Sonra düzgün dəyər daxil edək
    await act(async () => {
      fireEvent.change(input, { target: { value: '100' } });
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Bu sahə yalnız rəqəm ola bilər')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases in Data Validation', () => {
    describe('Rəqəm sahələri', () => {
      it('çox böyük rəqəmlər', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Şagird sayı')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Şagird sayı');
        await act(async () => {
          fireEvent.change(input, { target: { value: '999999999999999' } });
        });

        await waitFor(() => {
          expect(screen.getByText('Daxil edilən rəqəm həddindən böyükdür')).toBeInTheDocument();
        });
      });

      it('kəsr ədədlər', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Şagird sayı')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Şagird sayı');
        await act(async () => {
          fireEvent.change(input, { target: { value: '12.34' } });
        });

        await waitFor(() => {
          expect(screen.getByText('Yalnız tam ədədlər daxil edilə bilər')).toBeInTheDocument();
        });
      });

      it('sıfırlar', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Şagird sayı')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Şagird sayı');
        await act(async () => {
          fireEvent.change(input, { target: { value: '00123' } });
        });

        await waitFor(() => {
          expect(input).toHaveValue('123');
        });
      });
    });

    describe('Mətn sahələri', () => {
      it('xüsusi simvollar', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Sektor adı')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Sektor adı');
        await act(async () => {
          fireEvent.change(input, { target: { value: '<script>alert("test")</script>' } });
        });

        await waitFor(() => {
          expect(screen.getByText('Xüsusi simvollar istifadə edilə bilməz')).toBeInTheDocument();
        });
      });

      it('uzun mətnlər', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Sektor adı')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Sektor adı');
        const longText = 'a'.repeat(1001);
        await act(async () => {
          fireEvent.change(input, { target: { value: longText } });
        });

        await waitFor(() => {
          expect(screen.getByText('Maksimum 1000 simvol daxil edilə bilər')).toBeInTheDocument();
        });
      });

      it('yalnız boşluqlar', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Sektor adı')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Sektor adı');
        await act(async () => {
          fireEvent.change(input, { target: { value: '   ' } });
        });

        await waitFor(() => {
          expect(screen.getByText('Bu sahə boş ola bilməz')).toBeInTheDocument();
        });
      });
    });

    describe('Tarix sahələri', () => {
      it('gələcək tarixlər', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Tarix')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Tarix');
        const futureDate = '2026-01-01';
        await act(async () => {
          fireEvent.change(input, { target: { value: futureDate } });
        });

        await waitFor(() => {
          expect(screen.getByText('Gələcək tarix seçilə bilməz')).toBeInTheDocument();
        });
      });

      it('çox köhnə tarixlər', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Tarix')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Tarix');
        await act(async () => {
          fireEvent.change(input, { target: { value: '1900-01-01' } });
        });

        await waitFor(() => {
          expect(screen.getByText('Tarix 2000-ci ildən əvvəl ola bilməz')).toBeInTheDocument();
        });
      });

      it('29 fevral', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Tarix')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Tarix');
        // Uzun il
        await act(async () => {
          fireEvent.change(input, { target: { value: '2024-02-29' } });
        });
        await waitFor(() => {
          expect(input).toHaveValue('2024-02-29');
        });

        // Uzun il olmayan
        await act(async () => {
          fireEvent.change(input, { target: { value: '2023-02-29' } });
        });
        await waitFor(() => {
          expect(screen.getByText('Düzgün tarix daxil edin')).toBeInTheDocument();
        });
      });
    });

    describe('Email sahələri', () => {
      it('domain olmayan email', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Email')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Email');
        await act(async () => {
          fireEvent.change(input, { target: { value: 'test@' } });
        });

        await waitFor(() => {
          expect(screen.getByText('Düzgün email formatı daxil edin')).toBeInTheDocument();
        });
      });

      it('@ işarəsi olmayan email', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Email')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Email');
        await act(async () => {
          fireEvent.change(input, { target: { value: 'test.example.com' } });
        });

        await waitFor(() => {
          expect(screen.getByText('Düzgün email formatı daxil edin')).toBeInTheDocument();
        });
      });

      it('çox uzun email', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Email')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Email');
        const longEmail = 'a'.repeat(200) + '@example.com';
        await act(async () => {
          fireEvent.change(input, { target: { value: longEmail } });
        });

        await waitFor(() => {
          expect(screen.getByText('Email ünvanı çox uzundur')).toBeInTheDocument();
        });
      });
    });

    describe('Məlumatların sinxronizasiyası', () => {
      it('eyni vaxtda bir neçə dəyişiklik', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Sektor adı')).toBeInTheDocument();
          expect(screen.getByLabelText('Şagird sayı')).toBeInTheDocument();
          expect(screen.getByLabelText('Tarix')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const sectorInput = screen.getByLabelText('Sektor adı');
        const countInput = screen.getByLabelText('Şagird sayı');
        const dateInput = screen.getByLabelText('Tarix');

        await act(async () => {
          fireEvent.change(sectorInput, { target: { value: 'Test Sektor' } });
          fireEvent.change(countInput, { target: { value: '100' } });
          fireEvent.change(dateInput, { target: { value: '2025-04-18' } });
        });

        await waitFor(() => {
          expect(screen.queryByText('Xəta')).not.toBeInTheDocument();
        });
      });

      it('tez-tez dəyişikliklər', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Şagird sayı')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Şagird sayı');

        // Tez-tez dəyişikliklər
        for (let i = 0; i < 10; i++) {
          await act(async () => {
            fireEvent.change(input, { target: { value: i.toString() } });
          });
        }

        await waitFor(() => {
          expect(screen.queryByText('Xəta')).not.toBeInTheDocument();
        });
      });
    });

    describe('Xüsusi simvollar', () => {
      it('HTML teqləri', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Sektor adı')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Sektor adı');
        await act(async () => {
          fireEvent.change(input, { target: { value: '<script>alert("test")</script>' } });
        });

        await waitFor(() => {
          expect(screen.getByText('Xüsusi simvollar istifadə edilə bilməz')).toBeInTheDocument();
        });
      });

      it('emoji və unicode', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Sektor adı')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Sektor adı');
        await act(async () => {
          fireEvent.change(input, { target: { value: '😀 Test 🎉' } });
        });

        await waitFor(() => {
          expect(screen.getByText('Xüsusi simvollar istifadə edilə bilməz')).toBeInTheDocument();
        });
      });
    });

    describe('Məlumat həcmi', () => {
      it('çox uzun mətn', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Sektor adı')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Sektor adı');
        const longText = 'a'.repeat(1000);
        await act(async () => {
          fireEvent.change(input, { target: { value: longText } });
        });

        await waitFor(() => {
          expect(screen.getByText('Maksimum simvol sayı aşıldı')).toBeInTheDocument();
        });
      });

      it('böyük ədədlər', async () => {
        await act(async () => {
          renderWithWrapper(
            <DataEntryForm 
              initialData={{ 
                categories: mockCategories,
                activeTab: '1',
                entries: [],
                loading: false,
                error: null
              }} 
            />
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText('Şagird sayı')).toBeInTheDocument();
        }, {
          timeout: 5000,
          interval: 100
        });

        const input = screen.getByLabelText('Şagird sayı');
        await act(async () => {
          fireEvent.change(input, { target: { value: '999999999999' } });
        });

        await waitFor(() => {
          expect(screen.getByText('Düzgün say daxil edin')).toBeInTheDocument();
        });
      });
    });
  });
});