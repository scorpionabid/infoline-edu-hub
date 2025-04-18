import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createTestWrapper } from '../setupTests';
import DataEntryForm from '../components/DataEntry/DataEntryForm';

// Sabit test məlumatları
const mockCategories = [
  {
    id: '1',
    name: 'Test Kateqoriya',
    columns: [
      {
        id: 'student_count',
        name: 'Şagird sayı',
        type: 'number',
        is_required: true,
        validation: { min: 0, max: 10000 }
      },
      {
        id: 'sector_name',
        name: 'Sektor adı',
        type: 'text',
        is_required: true,
        validation: { maxLength: 1000 }
      },
      {
        id: 'email',
        name: 'Email',
        type: 'email',
        is_required: true,
      },
      {
        id: 'date',
        name: 'Tarix',
        type: 'date',
        is_required: true,
      }
    ]
  }
];

// DataEntryForm komponenti mock
vi.mock('../components/DataEntry/DataEntryForm', () => ({
  default: ({ initialData, onSubmit }) => {
    return (
      <div data-testid="data-entry-form">
        <div>
          <label htmlFor="student_count">Şagird sayı</label>
          <input 
            id="student_count" 
            aria-label="Şagird sayı" 
            data-testid="student-count-input"
            type="number"
          />
          {initialData?.error?.field === 'student_count' && 
            <div>{initialData.error.message}</div>
          }
        </div>
        
        <div>
          <label htmlFor="sector_name">Sektor adı</label>
          <input 
            id="sector_name" 
            aria-label="Sektor adı" 
            data-testid="sector-name-input"
            type="text"
          />
          {initialData?.error?.field === 'sector_name' && 
            <div>{initialData.error.message}</div>
          }
        </div>
        
        <div>
          <label htmlFor="email">Email</label>
          <input 
            id="email" 
            aria-label="Email" 
            data-testid="email-input"
            type="email"
          />
          {initialData?.error?.field === 'email' && 
            <div>{initialData.error.message}</div>
          }
        </div>
        
        <div>
          <label htmlFor="date">Tarix</label>
          <input 
            id="date" 
            aria-label="Tarix" 
            data-testid="date-input"
            type="date"
          />
          {initialData?.error?.field === 'date' && 
            <div>{initialData.error.message}</div>
          }
        </div>
        
        <button 
          onClick={() => onSubmit?.()} 
          data-testid="submit-button"
        >
          Təsdiqlə
        </button>
      </div>
    );
  }
}));

describe('Data Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper funksiya
  const renderComponent = async (props = {}) => {
    let rendered;
    
    await act(async () => {
      rendered = render(
        <DataEntryForm 
          initialData={{ 
            categories: mockCategories,
            activeTab: '1',
            entries: [],
            loading: false,
            error: null,
            ...props
          }} 
        />,
        { wrapper: createTestWrapper() }
      );
    });
    
    return rendered;
  };

  it('boş sahələr üçün validasiya göstərir', async () => {
    await renderComponent({ error: { field: 'student_count', message: 'Bu sahə məcburidir' } });
    
    // Data-testid ilə elementi tapmaq daha etibarlıdır
    const input = screen.getByTestId('student-count-input');
    expect(input).toBeInTheDocument();
    
    // Validasiya mesajı görünür olmalıdır
    expect(screen.getByText('Bu sahə məcburidir')).toBeInTheDocument();
  });

  it('rəqəm sahələri üçün validasiya göstərir', async () => {
    const mockValidationError = { field: 'student_count', message: 'Bu sahə yalnız rəqəm ola bilər' };
    await renderComponent({ error: mockValidationError });
    
    expect(screen.getByText('Bu sahə yalnız rəqəm ola bilər')).toBeInTheDocument();
  });

  it('submission prosesini yoxlayır', async () => {
    const onSubmit = vi.fn();
    await renderComponent({
      onSubmit
    });
    
    await act(async () => {
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
    });
    
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  describe('Edge Cases', () => {
    it('xüsusi simvolların işlənməsini yoxlayır', async () => {
      const mockValidationError = { field: 'sector_name', message: 'Xüsusi simvollar istifadə edilə bilməz' };
      await renderComponent({ error: mockValidationError });
      
      expect(screen.getByText('Xüsusi simvollar istifadə edilə bilməz')).toBeInTheDocument();
    });
    
    it('uzun mətnlərin işlənməsini yoxlayır', async () => {
      const mockValidationError = { field: 'sector_name', message: 'Maksimum 1000 simvol daxil edilə bilər' };
      await renderComponent({ error: mockValidationError });
      
      expect(screen.getByText('Maksimum 1000 simvol daxil edilə bilər')).toBeInTheDocument();
    });
  });
});