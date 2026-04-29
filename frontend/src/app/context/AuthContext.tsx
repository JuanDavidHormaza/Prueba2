import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, tokenStorage, ApiUser, RegisterData, ApiError } from '../services/api';
import type { UserRole, UserPermissions } from '../data/users';
import { getDefaultPermissions } from '../data/users';

// Map backend role to frontend role
function mapRole(backendRole: string): UserRole {
  switch (backendRole) {
    case 'ADMIN':
      return 'admin';
    case 'INSTRUCTOR':
      return 'teacher';
    case 'APRENDIZ':
    case 'MONITOR':
    default:
      return 'student';
  }
}

// User type for the auth context (frontend format)
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  backendRole: string;
  permissions: UserPermissions;
  person?: {
    personId: number;
    docType: string;
    docNum: string;
    phoneNum: number | null;
    status: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert API user to AuthUser
function convertApiUser(apiUser: ApiUser): AuthUser {
  const role = mapRole(apiUser.role);
  return {
    id: String(apiUser.id),
    username: apiUser.username,
    email: apiUser.email,
    name: `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.username,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    role,
    backendRole: apiUser.role,
    permissions: getDefaultPermissions(role),
    person: apiUser.person ? {
      personId: apiUser.person.person_id,
      docType: apiUser.person.doc_type,
      docNum: apiUser.person.doc_num,
      phoneNum: apiUser.person.phone_num,
      status: apiUser.person.status,
    } : undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = tokenStorage.getUser();
      const token = tokenStorage.getAccessToken();
      
      if (storedUser && token) {
        try {
          // Verify token is still valid by fetching profile
          const freshUser = await api.getProfile();
          setUser(convertApiUser(freshUser));
        } catch {
          // Token invalid, clear storage
          tokenStorage.clear();
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.login(email, password);
      setUser(convertApiUser(response.user));
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : 'Error al iniciar sesion. Intenta de nuevo.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.register(data);
      setUser(convertApiUser(response.user));
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : 'Error al registrarse. Intenta de nuevo.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
