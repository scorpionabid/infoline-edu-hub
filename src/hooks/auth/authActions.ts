
import { UserStatus } from '@/types/user';
import { UserRole } from '@/types/role';

// Define auth action types
export const AUTH_ACTIONS = {
  INITIALIZE_START: 'auth/initializeStart',
  INITIALIZE_SUCCESS: 'auth/initializeSuccess',
  INITIALIZE_ERROR: 'auth/initializeError',
  LOGIN_START: 'auth/loginStart',
  LOGIN_SUCCESS: 'auth/loginSuccess',
  LOGIN_ERROR: 'auth/loginError',
  LOGOUT_START: 'auth/logoutStart',
  LOGOUT_SUCCESS: 'auth/logoutSuccess',
  LOGOUT_ERROR: 'auth/logoutError',
  UPDATE_USER: 'auth/updateUser',
  CLEAR_ERROR: 'auth/clearError',
  REFRESH_SESSION_START: 'auth/refreshSessionStart',
  REFRESH_SESSION_SUCCESS: 'auth/refreshSessionSuccess',
  REFRESH_SESSION_ERROR: 'auth/refreshSessionError',
} as const;

// Action creators
export const initializeStart = () => ({
  type: AUTH_ACTIONS.INITIALIZE_START,
});

export const initializeSuccess = (payload: { user: any; session: any }) => ({
  type: AUTH_ACTIONS.INITIALIZE_SUCCESS,
  payload,
});

export const initializeError = (error: Error | string) => ({
  type: AUTH_ACTIONS.INITIALIZE_ERROR,
  payload: typeof error === 'string' ? error : error.message,
});

export const loginStart = () => ({
  type: AUTH_ACTIONS.LOGIN_START,
});

export const loginSuccess = (payload: { user: any; session: any }) => ({
  type: AUTH_ACTIONS.LOGIN_SUCCESS,
  payload,
});

export const loginError = (error: Error | string) => ({
  type: AUTH_ACTIONS.LOGIN_ERROR,
  payload: typeof error === 'string' ? error : error.message,
});

export const logoutStart = () => ({
  type: AUTH_ACTIONS.LOGOUT_START,
});

export const logoutSuccess = () => ({
  type: AUTH_ACTIONS.LOGOUT_SUCCESS,
});

export const logoutError = (error: Error | string) => ({
  type: AUTH_ACTIONS.LOGOUT_ERROR,
  payload: typeof error === 'string' ? error : error.message,
});

export const updateUser = (user: any) => ({
  type: AUTH_ACTIONS.UPDATE_USER,
  payload: user,
});

export const clearError = () => ({
  type: AUTH_ACTIONS.CLEAR_ERROR,
});

export const refreshSessionStart = () => ({
  type: AUTH_ACTIONS.REFRESH_SESSION_START,
});

export const refreshSessionSuccess = (payload: { user: any; session: any }) => ({
  type: AUTH_ACTIONS.REFRESH_SESSION_SUCCESS,
  payload,
});

export const refreshSessionError = (error: Error | string) => ({
  type: AUTH_ACTIONS.REFRESH_SESSION_ERROR,
  payload: typeof error === 'string' ? error : error.message,
});

// Type definitions
export type AuthAction =
  | ReturnType<typeof initializeStart>
  | ReturnType<typeof initializeSuccess>
  | ReturnType<typeof initializeError>
  | ReturnType<typeof loginStart>
  | ReturnType<typeof loginSuccess>
  | ReturnType<typeof loginError>
  | ReturnType<typeof logoutStart>
  | ReturnType<typeof logoutSuccess>
  | ReturnType<typeof logoutError>
  | ReturnType<typeof updateUser>
  | ReturnType<typeof clearError>
  | ReturnType<typeof refreshSessionStart>
  | ReturnType<typeof refreshSessionSuccess>
  | ReturnType<typeof refreshSessionError>;

export interface AuthState {
  user: any | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
export const authReducer = (state: AuthState = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AUTH_ACTIONS.INITIALIZE_START:
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.LOGOUT_START:
    case AUTH_ACTIONS.REFRESH_SESSION_START:
      return {
        ...state,
        isLoading: true,
      };
    case AUTH_ACTIONS.INITIALIZE_SUCCESS:
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REFRESH_SESSION_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        isAuthenticated: !!action.payload.session,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGOUT_SUCCESS:
      return {
        ...state,
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.INITIALIZE_ERROR:
    case AUTH_ACTIONS.LOGIN_ERROR:
    case AUTH_ACTIONS.LOGOUT_ERROR:
    case AUTH_ACTIONS.REFRESH_SESSION_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};
