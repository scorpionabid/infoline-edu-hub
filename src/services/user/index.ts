
// Bütün istifadəçi xidmətlərini bir nöqtədən ixrac edirik
export * from './userFetch';
export * from './types';

// userDelete faylından deleteUser funksiyasını konkret ixrac edirik
import { deleteUser } from './userDelete';
export { deleteUser };

// userUpdate faylından yalnız updateUser funksiyasını ixrac edirik, deleteUser deyil
import { updateUser, createUser as updateCreateUser } from './userUpdate';
export { updateUser };

// userCreate.ts faylından gələn ixracı əlavə edirik
import { createUser as createUserFunc } from './userCreate';
export { createUserFunc as createUser };

// fetchUsers funksiyasını getUsers olaraq yenidən ixrac edir
import { fetchUsers } from './userFetch';
export { fetchUsers as getUsers };
