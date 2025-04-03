
// Bütün istifadəçi xidmətlərini bir nöqtədən ixrac edirik
export * from './userFetch';
export * from './userCreate';
export * from './userUpdate';
export * from './userDelete';
export * from './types';

// fetchUsers funksiyasını getUsers olaraq yenidən ixrac edir
import { fetchUsers } from './userFetch';
export { fetchUsers as getUsers };
