
// Bütün istifadəçi xidmətlərini bir nöqtədən ixrac edirik
export * from './userFetch';
export * from './userUpdate';
export * from './userDelete';
export * from './types';

// userCreate.ts faylından gələn ixracı əlavə edirik, amma eyni addan qaçınırıq
import { createUser as createUserFunc } from './userCreate';
export { createUserFunc as createUser };

// fetchUsers funksiyasını getUsers olaraq yenidən ixrac edir
import { fetchUsers } from './userFetch';
export { fetchUsers as getUsers };
