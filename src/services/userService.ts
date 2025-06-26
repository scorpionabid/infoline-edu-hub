
// Re-export all user service functions from their respective files
import { userFetchService } from './users/userFetchService';
import { createUser } from './users/userCreateService';
import { updateUser } from './users/userUpdateService';
import { deleteUser } from './users/userDeleteService';
import { resetUserPassword } from './users/userAuthService';
import { getAdminEntity } from './users/userAdminService';

// Main exports using the service functions with correct method names
export const getUsers = userFetchService.getAllUsers;
export const getUser = userFetchService.getUserById;

export {
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getAdminEntity
};
