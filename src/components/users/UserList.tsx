
import React from 'react';
import UserListTable from './UserListTable';
import { UserFilter } from '@/types/user';

interface UserListProps {
  refreshTrigger: number;
  filterParams: UserFilter;
}

const UserList: React.FC<UserListProps> = ({ refreshTrigger, filterParams }) => {
  return (
    <div>
      <UserListTable 
        refreshTrigger={refreshTrigger}
        filterParams={filterParams}
      />
    </div>
  );
};

export default UserList;
