// import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// import { vi, describe, it, expect, beforeEach } from 'vitest';
// import { MemoryRouter } from 'react-router-dom';
// import DataEntryPage from '../pages/DataEntry';
// import { LanguageProvider } from '../context/LanguageContext';

// // React Router mock
// vi.mock('react-router-dom', async () => {
//   const actual = await vi.importActual('react-router-dom');
//   return {
//     ...actual,
//     useNavigate: () => vi.fn(),
//     useSearchParams: () => [new URLSearchParams(), vi.fn()]
//   };
// });

// // Auth Context mock
// vi.mock('../context/auth', () => ({
//   useAuth: () => ({
//     user: {
//       id: '123e4567-e89b-12d3-a456-426614174000',
//       role: 'schooladmin',
//       schoolId: '123e4567-e89b-12d3-a456-426614174001'
//     },
//     isAuthenticated: true,
//     isLoading: false,
//     error: null
//   })
// }));

// // Language Context mock
// vi.mock('../context/LanguageContext', () => ({
//   useLanguage: () => ({
//     t: (key: string) => key,
//     currentLanguage: 'az',
//     setLanguage: vi.fn()
//   }),
//   LanguageProvider: ({ children }) => children
// }));

// // Category Data Hook mock
// vi.mock('../hooks/dataEntry/useCategoryData', () => ({
//   useCategoryData: () => ({
//     categories: [
//       {
//         id: 1,
//         name: 'Sektorlara aid kateqoriya',
//         description: 'Sektorlar üzrə məlumatlar',
//         columns: [
//           { id: 1, name: 'Sektor adı', type: 'text', required: true },
//           { id: 2, name: 'Məktəb sayı', type: 'number', required: true }
//         ]
//       },
//       {
//         id: 2,
//         name: 'Şagird Statistikası',
//         description: 'Şagirdlər haqqında məlumatlar',
//         columns: [
//           { id: 3, name: 'Sinif', type: 'text', required: true },
//           { id: 4, name: 'Şagird sayı', type: 'number', required: true }
//         ]
//       },
//       {
//         id: 3,
//         name: 'Müəllim və personal heyyəti',
//         description: 'Müəllim və personal haqqında məlumatlar',
//         columns: [
//           { id: 5, name: 'Vəzifə', type: 'text', required: true },
//           { id: 6, name: 'İşçi sayı', type: 'number', required: true }
//         ]
//       },
//       {
//         id: 4,
//         name: 'Təhsil Keyfiyyət Göstəriciləri',
//         description: 'Təhsil keyfiyyəti haqqında məlumatlar',
//         columns: [
//           { id: 7, name: 'Göstərici', type: 'text', required: true },
//           { id: 8, name: 'Dəyər', type: 'number', required: true }
//         ]
//       }
//     ],
//     loading: false,
//     error: null,
//     refreshCategories: vi.fn()
//   })
// }));

// describe('DataEntry Component', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   it('loading spinnerini göstərir', async () => {
//     render(
//       <MemoryRouter>
//         <LanguageProvider>
//           <DataEntryPage />
//         </LanguageProvider>
//       </MemoryRouter>
//     );

//     expect(screen.getByRole('status')).toBeInTheDocument();
//   });

//   it('kateqoriyaları düzgün göstərir', async () => {
//     render(
//       <MemoryRouter>
//         <LanguageProvider>
//           <DataEntryPage />
//         </LanguageProvider>
//       </MemoryRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByText('Sektorlara aid kateqoriya')).toBeInTheDocument();
//       expect(screen.getByText('Şagird Statistikası')).toBeInTheDocument();
//       expect(screen.getByText('Müəllim və personal heyyəti')).toBeInTheDocument();
//       expect(screen.getByText('Təhsil Keyfiyyət Göstəriciləri')).toBeInTheDocument();
//     });
//   });

//   it('kateqoriya seçildikdə formu göstərir', async () => {
//     render(
//       <MemoryRouter>
//         <LanguageProvider>
//           <DataEntryPage />
//         </LanguageProvider>
//       </MemoryRouter>
//     );

//     await waitFor(() => {
//       const categoryButton = screen.getByText('Sektorlara aid kateqoriya');
//       expect(categoryButton).toBeInTheDocument();
//       fireEvent.click(categoryButton);
//     }, { timeout: 5000 });

//     await waitFor(() => {
//       expect(screen.getByText('Sektor adı')).toBeInTheDocument();
//       expect(screen.getByText('Məktəb sayı')).toBeInTheDocument();
//     }, { timeout: 5000 });
//   });
// });