import { supabase } from '@/lib/supabase';
import { FullUserData, UserRole, UserStatus } from '@/types/auth';

// Function to fetch all users
export const getAllUsers = async (): Promise<FullUserData[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data.map(adaptUser);
  } catch (error: any) {
    console.error('Error in getAllUsers:', error.message);
    throw error;
  }
};

// Function to fetch a single user by ID
export const getUserById = async (id: string): Promise<FullUserData | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }

    return adaptUser(data);
  } catch (error: any) {
    console.error('Error in getUserById:', error.message);
    return null;
  }
};

// Function to create a new user
export const createUser = async (userData: Omit<FullUserData, 'id'>): Promise<FullUserData | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([userData])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return adaptUser(data);
  } catch (error: any) {
    console.error('Error in createUser:', error.message);
    return null;
  }
};

// Function to update an existing user
export const updateUser = async (id: string, userData: Partial<FullUserData>): Promise<FullUserData | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return adaptUser(data);
  } catch (error: any) {
    console.error('Error in updateUser:', error.message);
    return null;
  }
};

// Function to delete a user by ID
export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Error in deleteUser:', error.message);
    return false;
  }
};

// Function to update user status
export const updateUserStatus = async (id: string, status: UserStatus): Promise<FullUserData | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating user status:', error);
      return null;
    }

    return adaptUser(data);
  } catch (error: any) {
    console.error('Error in updateUserStatus:', error.message);
    return null;
  }
};

// Function to assign a role to a user
export const assignRoleToUser = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Error assigning role to user:', error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Error in assignRoleToUser:', error.message);
    return false;
  }
};

// When dealing with notification settings, use notificationSettings consistently
const adaptUser = (user: any): FullUserData => {
  return {
    ...user,
    notificationSettings: user.notificationSettings || user.notification_settings || {
      email: true,
      push: true,
      app: true
    }
  };
};
