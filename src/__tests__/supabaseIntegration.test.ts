
// // <-- Bu fayl yalnız test üçün nəzərdə tutulmuşdur -->
// import { supabase } from '../integrations/supabase/client';
// import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock('../integrations/supabase/client', () => ({
//   supabase: {
//     auth: {
//       signUp: vi.fn(),
//       signInWithPassword: vi.fn(),
//       signOut: vi.fn(),
//       onAuthStateChange: vi.fn(),
//     },
//     from: vi.fn().mockReturnThis(),
//     select: vi.fn().mockReturnThis(),
//     insert: vi.fn().mockReturnThis(),
//     update: vi.fn().mockReturnThis(),
//     delete: vi.fn().mockReturnThis(),
//     eq: vi.fn().mockReturnThis(),
//   }
// }));

// describe('Supabase Integration', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   it('should sign up a user', async () => {
//     const mockResponse = {
//       data: { user: { id: '123' } },
//       error: null
//     };
    
//     (supabase.auth.signUp as any).mockResolvedValue(mockResponse);
    
//     const response = await supabase.auth.signUp({
//       email: 'test@example.com',
//       password: 'password123'
//     });
    
//     expect(supabase.auth.signUp).toHaveBeenCalledWith({
//       email: 'test@example.com',
//       password: 'password123'
//     });
//     expect(response).toEqual(mockResponse);
//   });

//   it('should sign in a user', async () => {
//     const mockResponse = {
//       data: { user: { id: '123' } },
//       error: null
//     };
    
//     (supabase.auth.signInWithPassword as any).mockResolvedValue(mockResponse);
    
//     const response = await supabase.auth.signInWithPassword({
//       email: 'test@example.com',
//       password: 'password123'
//     });
    
//     expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
//       email: 'test@example.com',
//       password: 'password123'
//     });
//     expect(response).toEqual(mockResponse);
//   });

//   it('should sign out a user', async () => {
//     const mockResponse = { error: null };
//     (supabase.auth.signOut as any).mockResolvedValue(mockResponse);
    
//     const response = await supabase.auth.signOut();
    
//     expect(supabase.auth.signOut).toHaveBeenCalled();
//     expect(response).toEqual(mockResponse);
//   });

//   // Test data operations - moc data üçün moc cədvəl adı üçün xüsusi test
//   it('should insert data', async () => {
//     const mockData = { id: '123', name: 'Test' };
//     const mockResponse = { data: mockData, error: null };
    
//     // from metodu üçün xüsusi mock
//     (supabase.from as any).mockReturnValue({
//       insert: vi.fn().mockReturnValue({
//         select: vi.fn().mockResolvedValue(mockResponse)
//       })
//     });
    
//     // Bu test üçün faktiki Supabase sorğusunu simulyasiya edirik
//     // data_entries cədvəlindən istifadə edirik
//     const response = await supabase
//       .from('data_entries')
//       .insert(mockData)
//       .select();
    
//     expect(supabase.from).toHaveBeenCalledWith('data_entries');
//     expect(response).toEqual(mockResponse);
//   });
// });
