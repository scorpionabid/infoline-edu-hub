
// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
// import LoginForm from '../components/auth/LoginForm';
// import { vi } from 'vitest';
// import { LanguageProvider } from '@/context/LanguageContext';

// // Mock AuthContext
// vi.mock('@/context/auth', () => ({
//   useAuth: () => ({
//     login: vi.fn().mockResolvedValue(true),
//     clearError: vi.fn(),
//   }),
// }));

// // Mock toast
// vi.mock('sonner', () => ({
//   toast: {
//     success: vi.fn(),
//     error: vi.fn(),
//   },
// }));

// // Mock react-router-dom
// vi.mock('react-router-dom', () => ({
//   ...vi.importActual('react-router-dom'),
//   useNavigate: () => vi.fn(),
// }));

// describe('LoginForm', () => {
//   const renderLoginForm = (error = null) => {
//     return render(
//       <MemoryRouter>
//         <LanguageProvider>
//           <LoginForm error={error} clearError={vi.fn()} />
//         </LanguageProvider>
//       </MemoryRouter>
//     );
//   };

//   it('renders login form correctly', () => {
//     renderLoginForm();
    
//     expect(screen.getByText('Daxil ol')).toBeInTheDocument();
//     expect(screen.getByLabelText('E-poçt')).toBeInTheDocument();
//     expect(screen.getByLabelText('Şifrə')).toBeInTheDocument();
//     expect(screen.getByRole('button', { name: /daxil ol/i })).toBeInTheDocument();
//   });

//   it('displays error when provided', () => {
//     const errorMessage = 'Test error message';
//     renderLoginForm(errorMessage);
    
//     expect(screen.getByText(errorMessage)).toBeInTheDocument();
//   });

//   it('toggles password visibility', () => {
//     renderLoginForm();
    
//     const passwordInput = screen.getByLabelText('Şifrə');
//     expect(passwordInput).toHaveAttribute('type', 'password');
    
//     const toggleButton = passwordInput.nextSibling;
//     fireEvent.click(toggleButton);
    
//     expect(passwordInput).toHaveAttribute('type', 'text');
    
//     fireEvent.click(toggleButton);
//     expect(passwordInput).toHaveAttribute('type', 'password');
//   });

//   it('validates email format', async () => {
//     renderLoginForm();
    
//     const emailInput = screen.getByLabelText('E-poçt');
//     fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
//     const submitButton = screen.getByRole('button', { name: /daxil ol/i });
//     fireEvent.click(submitButton);
    
//     // Error message should appear for invalid email
//     expect(await screen.findByText(/düzgün e-poçt formatı deyil/i)).toBeInTheDocument();
//   });

//   it('validates password length', async () => {
//     renderLoginForm();
    
//     const passwordInput = screen.getByLabelText('Şifrə');
//     fireEvent.change(passwordInput, { target: { value: '123' } });
    
//     const submitButton = screen.getByRole('button', { name: /daxil ol/i });
//     fireEvent.click(submitButton);
    
//     // Error message should appear for short password
//     expect(await screen.findByText(/şifrə ən azı 6 simvol olmalıdır/i)).toBeInTheDocument();
//   });
// });
