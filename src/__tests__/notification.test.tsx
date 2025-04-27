// import { render, screen, fireEvent, act } from '@testing-library/react';
// import Notification from '../components/ui/notification/Notification';
// import { vi } from 'vitest';

// describe('Notification Component', () => {
//   it('should display a notification message', () => {
//     const message = 'This is a test notification';
//     render(<Notification message={message} />);
//     expect(screen.getByText(message)).toBeInTheDocument();
//   });

//   it('should display different types of notifications', () => {
//     const successMessage = 'Success notification';
//     const errorMessage = 'Error notification';

//     const { container } = render(
//       <>
//         <Notification message={successMessage} type="success" />
//         <Notification message={errorMessage} type="error" />
//       </>
//     );

//     const successElement = screen.getByText(successMessage).parentElement;
//     const errorElement = screen.getByText(errorMessage).parentElement;

//     expect(successElement).toHaveClass('bg-green-100');
//     expect(errorElement).toHaveClass('bg-red-100');
//   });

//   it('should handle closing the notification', () => {
//     const message = 'This is a closable notification';
//     const onClose = vi.fn();

//     render(<Notification message={message} onClose={onClose} autoClose={false} />);
    
//     const closeButton = screen.getByRole('button', { name: /close notification/i });
//     fireEvent.click(closeButton);

//     expect(onClose).toHaveBeenCalled();
//   });

//   it('should auto-close after specified duration', async () => {
//     vi.useFakeTimers();
//     const message = 'Auto-closing notification';
//     const onClose = vi.fn();
//     const duration = 2000;

//     render(
//       <Notification 
//         message={message} 
//         onClose={onClose} 
//         autoClose={true} 
//         duration={duration} 
//       />
//     );

//     expect(screen.getByText(message)).toBeInTheDocument();
    
//     act(() => {
//       vi.advanceTimersByTime(duration);
//     });

//     expect(onClose).toHaveBeenCalled();
//     vi.useRealTimers();
//   });
// });

// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { vi, describe, it, expect, beforeEach } from 'vitest';
// import { createTestWrapper } from '../setupTests';
// import { MemoryRouter } from 'react-router-dom';
// import NotificationSystem from '../components/ui/notification/NotificationSystem';
// import { NotificationProvider } from '../context/NotificationContext';
// import { AuthProvider } from '../context/AuthContext';

// describe('Edge Cases in Notification System', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   describe('Bildiriş limitləri', () => {
//     it('çoxsaylı bildirişlər', async () => {
//       const notifications = Array(100).fill(null).map((_, index) => ({
//         id: `notification-${index}`,
//         message: `Test Message ${index}`,
//         type: 'info',
//         timestamp: new Date().toISOString()
//       }));

//       render(
//         <AuthProvider>
//           <MemoryRouter>
//             <NotificationProvider initialNotifications={notifications}>
//               <NotificationSystem />
//             </NotificationProvider>
//           </MemoryRouter>
//         </AuthProvider>
//       );

//       // Maksimum 5 bildiriş göstərilməlidir
//       const displayedNotifications = screen.getAllByRole('alert');
//       expect(displayedNotifications).toHaveLength(5);
      
//       // "Daha çox" düyməsi göstərilməlidir
//       expect(screen.getByText('95 bildiriş daha')).toBeInTheDocument();
//     });

//     it('eyni vaxtda gələn bildirişlər', async () => {
//       render(
//         <AuthProvider>
//           <MemoryRouter>
//             <NotificationProvider>
//               <NotificationSystem />
//             </NotificationProvider>
//           </MemoryRouter>
//         </AuthProvider>
//       );

//       // Eyni vaxtda 10 bildiriş göndərək
//       const promises = Array(10).fill(null).map((_, index) => {
//         return new Promise(resolve => {
//           setTimeout(() => {
//             fireEvent(window, new CustomEvent('notification', {
//               detail: {
//                 message: `Test Message ${index}`,
//                 type: 'info'
//               }
//             }));
//             resolve(null);
//           }, 0);
//         });
//       });

//       await Promise.all(promises);

//       // Bildirişlər növbəyə alınmalıdır
//       const displayedNotifications = screen.getAllByRole('alert');
//       expect(displayedNotifications).toHaveLength(5);
//     });
//   });

//   describe('Bildiriş məzmunu', () => {
//     it('uzun mətnli bildiriş', async () => {
//       const longMessage = 'a'.repeat(1000);
      
//       render(
//         <AuthProvider>
//           <MemoryRouter>
//             <NotificationProvider>
//               <NotificationSystem />
//             </NotificationProvider>
//           </MemoryRouter>
//         </AuthProvider>
//       );

//       fireEvent(window, new CustomEvent('notification', {
//         detail: {
//           message: longMessage,
//           type: 'info'
//         }
//       }));

//       const notification = screen.getByRole('alert');
//       expect(notification).toBeInTheDocument();
//       expect(notification).toHaveStyle({
//         maxWidth: '400px',
//         overflow: 'hidden'
//       });
//     });

//     it('HTML tərkibli bildiriş', async () => {
//       render(
//         <AuthProvider>
//           <MemoryRouter>
//             <NotificationProvider>
//               <NotificationSystem />
//             </NotificationProvider>
//           </MemoryRouter>
//         </AuthProvider>
//       );

//       fireEvent(window, new CustomEvent('notification', {
//         detail: {
//           message: '<script>alert("test")</script><b>Bold Text</b>',
//           type: 'info'
//         }
//       }));

//       const notification = screen.getByRole('alert');
//       expect(notification).toHaveTextContent('<script>alert("test")</script><b>Bold Text</b>');
//       expect(notification.innerHTML).not.toContain('<script>');
//     });

//     it('emoji və xüsusi simvollar', async () => {
//       render(
//         <AuthProvider>
//           <MemoryRouter>
//             <NotificationProvider>
//               <NotificationSystem />
//             </NotificationProvider>
//           </MemoryRouter>
//         </AuthProvider>
//       );

//       fireEvent(window, new CustomEvent('notification', {
//         detail: {
//           message: '🎉 Test Message ✨ with special chars: ©®™',
//           type: 'info'
//         }
//       }));

//       const notification = screen.getByRole('alert');
//       expect(notification).toHaveTextContent('🎉 Test Message ✨ with special chars: ©®™');
//     });
//   });

//   describe('Bildiriş davranışı', () => {
//     it('avtomatik bağlanma', async () => {
//       vi.useFakeTimers();

//       render(
//         <AuthProvider>
//           <MemoryRouter>
//             <NotificationProvider>
//               <NotificationSystem />
//             </NotificationProvider>
//           </MemoryRouter>
//         </AuthProvider>
//       );

//       fireEvent(window, new CustomEvent('notification', {
//         detail: {
//           message: 'Test Message',
//           type: 'info'
//         }
//       }));

//       expect(screen.getByRole('alert')).toBeInTheDocument();

//       // 5 saniyə gözləyək
//       vi.advanceTimersByTime(5000);

//       await waitFor(() => {
//         expect(screen.queryByRole('alert')).not.toBeInTheDocument();
//       });

//       vi.useRealTimers();
//     });

//     it('manual bağlama', async () => {
//       render(
//         <AuthProvider>
//           <MemoryRouter>
//             <NotificationProvider>
//               <NotificationSystem />
//             </NotificationProvider>
//           </MemoryRouter>
//         </AuthProvider>
//       );

//       fireEvent(window, new CustomEvent('notification', {
//         detail: {
//           message: 'Test Message',
//           type: 'info'
//         }
//       }));

//       const closeButton = screen.getByLabelText('Bağla');
//       fireEvent.click(closeButton);

//       await waitFor(() => {
//         expect(screen.queryByRole('alert')).not.toBeInTheDocument();
//       });
//     });

//     it('hover zamanı avtomatik bağlanmanın dayandırılması', async () => {
//       vi.useFakeTimers();

//       render(
//         <AuthProvider>
//           <MemoryRouter>
//             <NotificationProvider>
//               <NotificationSystem />
//             </NotificationProvider>
//           </MemoryRouter>
//         </AuthProvider>
//       );

//       fireEvent(window, new CustomEvent('notification', {
//         detail: {
//           message: 'Test Message',
//           type: 'info'
//         }
//       }));

//       const notification = screen.getByRole('alert');
//       fireEvent.mouseEnter(notification);

//       // 10 saniyə gözləyək
//       vi.advanceTimersByTime(10000);

//       // Bildiriş hələ də görünməlidir
//       expect(notification).toBeInTheDocument();

//       // Mouse-u çəkdikdən sonra bildiriş bağlanmalıdır
//       fireEvent.mouseLeave(notification);
//       vi.advanceTimersByTime(5000);

//       await waitFor(() => {
//         expect(screen.queryByRole('alert')).not.toBeInTheDocument();
//       });

//       vi.useRealTimers();
//     });
//   });

//   describe('Bildiriş növləri', () => {
//     it('error bildirişinin xüsusi stili', async () => {
//       render(
//         <AuthProvider>
//           <MemoryRouter>
//             <NotificationProvider>
//               <NotificationSystem />
//             </NotificationProvider>
//           </MemoryRouter>
//         </AuthProvider>
//       );

//       fireEvent(window, new CustomEvent('notification', {
//         detail: {
//           message: 'Error Message',
//           type: 'error'
//         }
//       }));

//       const notification = screen.getByRole('alert');
//       expect(notification).toHaveClass('error');
//       expect(notification).toHaveStyle({
//         backgroundColor: 'var(--error-bg)',
//         color: 'var(--error-text)'
//       });
//     });

//     it('success bildirişinin xüsusi stili', async () => {
//       render(
//         <AuthProvider>
//           <MemoryRouter>
//             <NotificationProvider>
//               <NotificationSystem />
//             </NotificationProvider>
//           </MemoryRouter>
//         </AuthProvider>
//       );

//       fireEvent(window, new CustomEvent('notification', {
//         detail: {
//           message: 'Success Message',
//           type: 'success'
//         }
//       }));

//       const notification = screen.getByRole('alert');
//       expect(notification).toHaveClass('success');
//       expect(notification).toHaveStyle({
//         backgroundColor: 'var(--success-bg)',
//         color: 'var(--success-text)'
//       });
//     });
//   });

//   describe('Offline rejim', () => {
//     it('offline rejimdə bildirişlərin saxlanması', async () => {
//       const mockOnline = vi.spyOn(navigator, 'onLine', 'get');
//       mockOnline.mockReturnValue(false);

//       render(
//         <AuthProvider>
//           <MemoryRouter>
//             <NotificationProvider>
//               <NotificationSystem />
//             </NotificationProvider>
//           </MemoryRouter>
//         </AuthProvider>
//       );

//       fireEvent(window, new CustomEvent('notification', {
//         detail: {
//           message: 'Offline Message',
//           type: 'info'
//         }
//       }));

//       // Bildiriş localStorage-də saxlanmalıdır
//       const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
//       expect(storedNotifications).toHaveLength(1);
//       expect(storedNotifications[0].message).toBe('Offline Message');

//       mockOnline.mockRestore();
//     });

//     it('online qayıtdıqda bildirişlərin sinxronizasiyası', async () => {
//       const mockOnline = vi.spyOn(navigator, 'onLine', 'get');
//       mockOnline.mockReturnValue(false);

//       // Offline bildirişləri əlavə edək
//       localStorage.setItem('notifications', JSON.stringify([
//         {
//           id: '1',
//           message: 'Offline Message 1',
//           type: 'info',
//           timestamp: new Date().toISOString()
//         },
//         {
//           id: '2',
//           message: 'Offline Message 2',
//           type: 'info',
//           timestamp: new Date().toISOString()
//         }
//       ]));

//       render(
//         <AuthProvider>
//           <MemoryRouter>
//             <NotificationProvider>
//               <NotificationSystem />
//             </NotificationProvider>
//           </MemoryRouter>
//         </AuthProvider>
//       );

//       // Online rejimə keçək
//       mockOnline.mockReturnValue(true);
//       fireEvent(window, new Event('online'));

//       await waitFor(() => {
//         expect(screen.getByText('Offline Message 1')).toBeInTheDocument();
//         expect(screen.getByText('Offline Message 2')).toBeInTheDocument();
//       });

//       // LocalStorage təmizlənməlidir
//       expect(localStorage.getItem('notifications')).toBe('[]');

//       mockOnline.mockRestore();
//     });
//   });
// });