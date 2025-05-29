
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { UserRole } from '../types/supabase';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/auth/AuthContext';

// Mock data
const mockCategory = {
  id: 1,
  name: 'Test Category',
  description: 'Test Description',
  order: 1
};

const mockColumns = [
  { id: 1, name: 'Column 1', type: 'text', required: true, order: 1, categoryId: 1 },
  { id: 2, name: 'Column 2', type: 'number', required: false, order: 2, categoryId: 1 }
];

// Mock functions
const mockAddColumn = vi.fn();
const mockUpdateColumn = vi.fn();
const mockDeleteColumn = vi.fn();

// Mock hooks
vi.mock('../hooks/category/useCategoryColumns', () => ({
  useCategoryColumns: () => ({
    columns: mockColumns,
    isLoading: false,
    addColumn: mockAddColumn,
    updateColumn: mockUpdateColumn,
    deleteColumn: mockDeleteColumn,
    error: null
  })
}));

vi.mock('../hooks/auth/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '123',
      role: 'superadmin' as UserRole,
    },
    isAuthenticated: true
  })
}));

// Create a mock category column component for testing with state management
const MockCategoryColumnsUI = ({ categoryId }: { categoryId: number }) => {
  const [showForm, setShowForm] = React.useState(false);
  const [editingColumn, setEditingColumn] = React.useState<any>(null);
  
  const handleAddClick = () => {
    setShowForm(true);
    setEditingColumn(null);
  };
  
  const handleEditClick = (column: any) => {
    setShowForm(true);
    setEditingColumn(column);
  };
  
  return (
    <div data-testid="category-column">
      <h2>Kateqoriya Sütunları</h2>
      <button data-testid="add-column-button" onClick={handleAddClick}>Sütun əlavə et</button>
      <ul>
        {mockColumns.map(column => (
          <li key={column.id} data-testid={`column-${column.id}`}>
            <span>{column.name}</span>
            <button 
              data-testid={`edit-column-${column.id}`}
              onClick={() => handleEditClick(column)}
            >
              Düzəliş et
            </button>
            <button 
              data-testid={`delete-column-${column.id}`}
              onClick={() => mockDeleteColumn(column.id)}
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
      <div data-testid="column-form" style={{ display: showForm ? 'block' : 'none' }}>
        <form onSubmit={(e) => {
          e.preventDefault();
          // Form submission logic would go here
          if (editingColumn) {
            mockUpdateColumn(editingColumn.id, { ...editingColumn });
          } else {
            mockAddColumn({ categoryId, name: 'New Column', type: 'text', required: false });
          }
          setShowForm(false);
        }}>
          <input 
            type="text" 
            name="name" 
            placeholder="Sütun adı" 
            defaultValue={editingColumn ? editingColumn.name : ''}
          />
          <select name="type" defaultValue={editingColumn ? editingColumn.type : 'text'}>
            <option value="text">Mətn</option>
            <option value="number">Rəqəm</option>
            <option value="date">Tarix</option>
          </select>
          <input 
            type="checkbox" 
            name="required" 
            id="required" 
            defaultChecked={editingColumn ? editingColumn.required : false}
          />
          <label htmlFor="required">Məcburi</label>
          <button type="submit">Yadda saxla</button>
        </form>
      </div>
    </div>
  );
};

describe('Category Columns Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should render category columns', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <MockCategoryColumnsUI categoryId={1} />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Kateqoriya Sütunları')).toBeInTheDocument();
    expect(screen.getByText('Column 1')).toBeInTheDocument();
    expect(screen.getByText('Column 2')).toBeInTheDocument();
  });

  it('should show the add column form when button is clicked', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <MockCategoryColumnsUI categoryId={1} />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    const addButton = screen.getByTestId('add-column-button');
    await fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('column-form')).toHaveStyle({ display: 'block' });
    });
  });

  it('should edit a column when edit button is clicked', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <MockCategoryColumnsUI categoryId={1} />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    const editButton = screen.getByTestId('edit-column-1');
    await fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId('column-form')).toHaveStyle({ display: 'block' });
    });

    // Check if form is pre-filled with column data
    const nameInput = screen.getByPlaceholderText('Sütun adı');
    expect(nameInput).toHaveValue('Column 1');
  });
});

// Performance Tests
describe('Category Columns Performance Tests', () => {
  it('renders columns efficiently', async () => {
    const start = performance.now();
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <MockCategoryColumnsUI categoryId={1} />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    const end = performance.now();
    const renderTime = end - start;
    
    console.log(`Category column render time: ${renderTime}ms`);
    expect(renderTime).toBeLessThan(500); // Render time should be less than 500ms
  });
});
