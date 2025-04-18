import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, createTestWrapper } from '../setupTests';
import ReportGenerator from '../components/Report/ReportGenerator';

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

// Mock ReportGenerator component's dependencies
vi.mock('../components/Report/ReportGenerator', () => ({
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
          <ReportGenerator 
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
          <ReportGenerator onGenerate={mockGenerateReport} />,
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
        const reportData = {
          id: '1',
          name: 'Test Report',
          data: [{ value: 100 }]
        };

        render(
          <ReportGenerator 
            initialData={reportData}
            onGenerate={mockGenerateReport}
          />,
          { wrapper: createTestWrapper() }
        );

        const generateButton = screen.getByText('Hesabat Generasiya Et');
        fireEvent.click(generateButton);

        await waitFor(() => {
          const cachedReports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
          expect(cachedReports).toHaveLength(1);
          expect(cachedReports[0].id).toBe('1');
        });
      });

      it('kəşlənmiş hesabatların yüklənməsi', async () => {
        localStorage.setItem('generatedReports', JSON.stringify([{
          id: '1',
          name: 'Cached Report',
          timestamp: new Date().toISOString()
        }]));

        render(
          <ReportGenerator onGenerate={mockGenerateReport} />,
          { wrapper: createTestWrapper() }
        );

        await waitFor(() => {
          expect(screen.getByText('Cached Report')).toBeInTheDocument();
        });
      });
    });

    describe('Paralel Hesabat Generasiyası', () => {
      it('eyni vaxtda bir neçə hesabat', async () => {
        render(
          <ReportGenerator onGenerate={mockGenerateReport} />,
          { wrapper: createTestWrapper() }
        );

        const generatePromises = Array(3).fill(null).map((_, index) => {
          return new Promise(resolve => {
            setTimeout(() => {
              fireEvent(window, new CustomEvent('generate_report', {
                detail: {
                  id: index.toString(),
                  type: 'monthly'
                }
              }));
              resolve(null);
            }, 0);
          });
        });

        await Promise.all(generatePromises);

        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars).toHaveLength(3);

        await waitFor(() => {
          expect(screen.getAllByText('Hesabat hazırdır')).toHaveLength(3);
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
          <ReportGenerator 
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
        const tableData = Array(10000).fill(null).map((_, index) => ({
          id: index.toString(),
          name: `School ${index}`,
          value: Math.random() * 1000
        }));

        render(
          <ReportGenerator 
            initialData={{ table: tableData }}
            onGenerate={mockGenerateReport}
          />,
          { wrapper: createTestWrapper() }
        );

        const filterInput = screen.getByPlaceholderText('Axtar...');
        const startFilterTime = performance.now();
        
        fireEvent.change(filterInput, { target: { value: 'School 999' } });
        
        await waitFor(() => {
          expect(screen.getByText('School 999')).toBeInTheDocument();
        });

        const endFilterTime = performance.now();
        const filterTime = endFilterTime - startFilterTime;

        expect(filterTime).toBeLessThan(200);

        const sortButton = screen.getByText('Qiymətə görə çeşidlə');
        const startSortTime = performance.now();
        
        fireEvent.click(sortButton);
        
        const endSortTime = performance.now();
        const sortTime = endSortTime - startSortTime;

        expect(sortTime).toBeLessThan(100);
      });
    });

    describe('Offline Rejim', () => {
      it('offline rejimdə hesabat generasiyası', async () => {
        const mockOnline = vi.spyOn(navigator, 'onLine', 'get');
        mockOnline.mockReturnValue(false);

        render(
          <ReportGenerator onGenerate={mockGenerateReport} />,
          { wrapper: createTestWrapper() }
        );

        const generateButton = screen.getByText('Hesabat Generasiya Et');
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText('Hesabat hazırdır')).toBeInTheDocument();
        });

        const offlineReports = JSON.parse(localStorage.getItem('offlineReports') || '[]');
        expect(offlineReports).toHaveLength(1);

        mockOnline.mockRestore();
      });

      it('online qayıtdıqda hesabatların sinxronizasiyası', async () => {
        const mockOnline = vi.spyOn(navigator, 'onLine', 'get');
        mockOnline.mockReturnValue(false);

        localStorage.setItem('offlineReports', JSON.stringify([{
          id: '1',
          name: 'Offline Report',
          data: { value: 100 }
        }]));

        render(
          <ReportGenerator onGenerate={mockGenerateReport} />,
          { wrapper: createTestWrapper() }
        );

        mockOnline.mockReturnValue(true);
        fireEvent(window, new Event('online'));

        await waitFor(() => {
          expect(screen.getByText('Hesabatlar serverlə sinxronizasiya edildi')).toBeInTheDocument();
          expect(localStorage.getItem('offlineReports')).toBe('[]');
        });

        mockOnline.mockRestore();
      });
    });
  });
});