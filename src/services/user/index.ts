
// Bütün istifadəçi xidmətlərini bir nöqtədən ixrac edirik
import { fetchUsers, getUserById, getUserByEmail } from './userFetch';
import { updateUser } from './userUpdate';
import { deleteUser } from './userDelete';
import { createUser as createUserFunc } from './userCreate';

// Konkret ixraclar
export { fetchUsers, getUserById, getUserByEmail };
export { updateUser };
export { deleteUser };
export { createUserFunc as createUser };

// fetchUsers funksiyasını getUsers olaraq yenidən ixrac edir
export { fetchUsers as getUsers };

// Tipləri ixrac edirik
export * from './types';

