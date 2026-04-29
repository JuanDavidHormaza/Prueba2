import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, type ApiUser, type UserPermissions, type RegisterData } from '../services/api';

interface AuthContextType {
  user: ApiUser | null;
  permissions: UserPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPermissions: UserPermissions = {
  canManageUsers: false,
  canManageDocuments: false,
  canViewStatistics: false,
  canGiveFeedback: false,
  canTakeQuiz: false,
  canViewResults: false,
  canManageSubjects: false,
  canConfigureLevels: false,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!api.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.getProfile();
      setUser(userData);
      setPermissions(userData.permissions || defaultPermissions);
      
      // Also update localStorage for backward compatibility
      localStorage.setItem('userName', userData.full_name);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userId', String(userData.id));
      localStorage.setItem('userPermissions', JSON.stringify(userData.permissions));
    } catch (error) {
      console.error('Failed to load user:', error);
      // Token might be invalid, clear it
      api.logout();
      setUser(null);
      setPermissions(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.login(email, password);
      
      const userData: ApiUser = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        role: response.user.role,
        full_name: response.user.full_name,
        is_active: true,
        date_joined: new Date().toISOString(),
        permissions: response.user.permissions,
      };
      
      setUser(userData);
      setPermissions(response.user.permissions);
      
      // Update localStorage for backward compatibility
      localStorage.setItem('userName', response.user.full_name);
      localStorage.setItem('userRole', response.user.role);
      localStorage.setItem('userId', String(response.user.id));
      localStorage.setItem('userPermissions', JSON.stringify(response.user.permissions));
      
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de conexion';
      return { success: false, error: message };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.register(data);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de registro';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setPermissions(null);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const value: AuthContextType = {
    user,
    permissions,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook for checking specific permissions
export function usePermission(permission: keyof UserPermissions): boolean {
  const { permissions } = useAuth();
  return permissions?.[permission] ?? false;
}

// Helper hook for checking if user has a specific role
export function useRole(allowedRoles: string[]): boolean {
  const { user } = useAuth();
  return user ? allowedRoles.includes(user.role) : false;
}
