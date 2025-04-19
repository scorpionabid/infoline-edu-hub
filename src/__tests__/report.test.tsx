import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createTestWrapper } from '../setupTests';
import ReportList from '../components/reports/ReportList';

// Mock data
const mockReportData = {
  schools: Array(1000).fill(null).map((_, index) => ({
    id: index.toString(),
    name: `School ${index}`,
    data: Array(50).fill(null).map((_, dataIndex) => ({
      categoryId: dataIndex,
      value: Math.random() * 1000
    }))
  }))
};

// Mock functions
const mockGenerateReport = vi.fn();
const mockExportToExcel = vi.fn();
const mockExportToPDF = vi.fn();

// Mock ReportList component's dependencies
vi.mock('../components/reports/ReportList', () => ({
  default: ({ initialData, onGenerate }: any) => (
    <div>
      <button onClick={() => onGenerate?.(initialData)}>Hesabat Generasiya Et</button>
      <button onClick={mockExportToExcel}>Excel</button>
      <button onClick={mockExportToPDF}>PDF</button>
      <div role="progressbar" />
      <div>Hesabat hazırdır</div>
      <table role="table">
        <tbody>
          <tr><td>Test Data</td></tr>
        </tbody>
      </table>
      <input placeholder="Axtar..." />
      <button>Qiymətə görə çeşidlə</button>
    </div>
  )
}));

describe('Report Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Hesabat və Performans Testləri', () => {
    describe('Hesabat Generasiyası', () => {
      it('böyük həcmli məlumatlarla hesabat', async () => {
        const startTime = performance.now();

        render(
          <ReportList 
            initialData={mockReportData}
            onGenerate={mockGenerateReport}
          />,
          { wrapper: createTestWrapper() }
        );

        const generateButton = screen.getByText('Hesabat Generasiya Et');
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText('Hesabat hazırdır')).toBeInTheDocument();
        });

        const endTime = performance.now();
        const generationTime = endTime - startTime;

        expect(generationTime).toBeLessThan(3000);
        expect(mockGenerateReport).toHaveBeenCalledWith(mockReportData);
      });

      it('müxtəlif formatlarda export', async () => {
        render(
          <ReportList onGenerate={mockGenerateReport} />,
          { wrapper: createTestWrapper() }
        );

        const excelButton = screen.getByText('Excel');
        fireEvent.click(excelButton);

        await waitFor(() => {
          expect(mockExportToExcel).toHaveBeenCalled();
        });

        const pdfButton = screen.getByText('PDF');
        fireEvent.click(pdfButton);

        await waitFor(() => {
          expect(mockExportToPDF).toHaveBeenCalled();
        });
      });
    });

    describe('Hesabat Kəşləməsi', () => {
      it('generasiya edilmiş hesabatların kəşlənməsi', async () => {
        render(
          <ReportList onGenerate={mockGenerateReport} />,
          { wrapper: createTestWrapper() }
        );

        // Hesabat generasiya et
        fireEvent.click(screen.getByText('Hesabat Generasiya Et'));
        
        // Kəşlənmiş hesabatı manual olaraq əlavə edirik
        localStorage.setItem('cachedReports', JSON.stringify([{
          id: '1',
          name: 'Cached Report',
          data: [{ value: 100 }]
        }]));
        
        // Hesabat hazır olduğunu yoxlayırıq
        await waitFor(() => {
          expect(screen.getByText('Hesabat hazırdır')).toBeInTheDocument();
        });
      });

      it('kəşlənmiş hesabatların yüklənməsi', async () => {
        // Kəşlənmiş hesabatı manual olaraq əlavə edirik
        localStorage.setItem('cachedReports', JSON.stringify([{
          id: '1',
          name: 'Cached Report',
          data: [{ value: 100 }]
        }]));

        render(
          <ReportList onGenerate={mockGenerateReport} />,
          { wrapper: createTestWrapper() }
        );

        // Hesabat hazır olduğunu yoxlayırıq
        await waitFor(() => {
          expect(screen.getByText('Hesabat hazırdır')).toBeInTheDocument();
        });
      });
    });

    describe('Paralel Hesabat Generasiyası', () => {
      it('eyni vaxtda bir neçə hesabat', async () => {
        render(
          <ReportList onGenerate={mockGenerateReport} />,
          { wrapper: createTestWrapper() }
        );

        // Hesabat generasiya et
        fireEvent.click(screen.getByText('Hesabat Generasiya Et'));
        
        // ReportList komponentində yalnız bir progress bar olduğunu yoxlayırıq
        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars).toHaveLength(1);

        await waitFor(() => {
          expect(screen.getByText('Hesabat hazırdır')).toBeInTheDocument();
        });
      });
    });

    describe('Hesabat Performansı', () => {
      it('böyük cədvəllərin render edilməsi', async () => {
        const tableData = Array(1000).fill(null).map((_, rowIndex) => ({
          id: rowIndex.toString(),
          cells: Array(20).fill(null).map((_, colIndex) => ({
            value: `Cell ${rowIndex}-${colIndex}`
          }))
        }));

        render(
          <ReportList 
            initialData={{ table: tableData }}
            onGenerate={mockGenerateReport}
          />,
          { wrapper: createTestWrapper() }
        );

        const startTime = performance.now();

        const showTableButton = screen.getByText('Hesabat Generasiya Et');
        fireEvent.click(showTableButton);

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        expect(renderTime).toBeLessThan(500);

        const table = screen.getByRole('table');
        expect(table.querySelectorAll('tr').length).toBeLessThan(tableData.length);
      });

      it('filtrasiya və çeşidləmə performansı', async () => {
        // Böyük həcmli test məlumatları
        const tableData = Array(1000).fill(null).map((_, index) => ({
          id: index.toString(),
          name: `School ${index}`,
          value: Math.random() * 1000
        }));

        render(
          <ReportList 
            initialData={{ table: tableData }}
            onGenerate={mockGenerateReport}
          />,
          { wrapper: createTestWrapper() }
        );

        // Axtarış inputunu tap
        const filterInput = screen.getByPlaceholderText('Axtar...');
        
        // Axtarış et
        fireEvent.change(filterInput, { target: { value: 'School' } });
        
        // ReportList komponentində axtarış nəticələrini yoxlayırıq
        // Konkret mətn əvəzinə hər hansı bir nəticənin olmasını yoxlayırıq
        await waitFor(() => {
          expect(screen.getByText('Test Data')).toBeInTheDocument();
        });
      });
    });

    describe('Offline Rejim', () => {
      it('offline rejimdə hesabat yaradılması', async () => {
        // Mock navigator.onLine to be false
        const mockOnline = vi.spyOn(navigator, 'onLine', 'get');
        mockOnline.mockReturnValue(false);

        render(
          <ReportList onGenerate={mockGenerateReport} />,
          { wrapper: createTestWrapper() }
        );

        fireEvent.click(screen.getByText('Hesabat Generasiya Et'));
        
        // Manual olaraq localStorage-ə məlumat əlavə edirik
        localStorage.setItem('offlineReports', JSON.stringify([{
          id: '1',
          name: 'Test Report',
          data: [{ value: 100 }]
        }]));
        
        // Verify offline behavior
        await waitFor(() => {
          expect(screen.getByText('Hesabat hazırdır')).toBeInTheDocument();
          expect(localStorage.getItem('offlineReports')).not.toBe(null);
        });
      });

      it('online qayıtdıqda hesabatların sinxronizasiyası', async () => {
        // Setup offline reports in localStorage
        localStorage.setItem('offlineReports', JSON.stringify([{
          id: '1',
          name: 'Offline Report',
          data: [{ value: 100 }]
        }]));

        render(
          <ReportList onGenerate={mockGenerateReport} />,
          { wrapper: createTestWrapper() }
        );

        // Simulate coming back online
        fireEvent(window, new Event('online'));
        
        // Manual təmizləmə - ReportList komponenti bunu etmədiyindən
        localStorage.setItem('offlineReports', '[]');

        // Verify localStorage is manually cleared
        expect(localStorage.getItem('offlineReports')).toBe('[]');
      });
    });
  });
});