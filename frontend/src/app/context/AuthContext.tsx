import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

export type UserRole = 'ADMIN' | 'APRENDIZ' | 'MONITOR' | 'INSTRUCTOR' | 'admin' | 'teacher' | 'student';

interface AuthUser {
  id?: string;
  name: string;
  email?: string;
  role: UserRole;
  program?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  docType: string;
  docNum: string;
  phoneNum?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      const userName = localStorage.getItem('userName');
      const userRole = localStorage.getItem('userRole') as UserRole;
      const userEmail = localStorage.getItem('userEmail');
      const userId = localStorage.getItem('userId');
      const userProgram = localStorage.getItem('userProgram');

      if (userName && userRole && apiService.isAuthenticated()) {
        setUser({
          id: userId || undefined,
          name: userName,
          email: userEmail || undefined,
          role: userRole,
          program: userProgram || undefined,
        });
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Funcion de login
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    const result = await apiService.login(email, password);
    
    if (result.success && result.user) {
      // Mapear roles del backend al frontend
      let mappedRole: UserRole = 'student';
      const backendRole = result.user.role.toUpperCase();
      
      if (backendRole === 'ADMIN') {
        mappedRole = 'admin';
      } else if (backendRole === 'INSTRUCTOR') {
        mappedRole = 'teacher';
      } else if (backendRole === 'MONITOR') {
        mappedRole = 'teacher';
      } else {
        mappedRole = 'student';
      }
      
      const authUser: AuthUser = {
        name: result.user.name,
        email: email,
        role: mappedRole,
      };
      
      setUser(authUser);
      
      // Guardar en localStorage
      localStorage.setItem('userName', authUser.name);
      localStorage.setItem('userRole', mappedRole);
      localStorage.setItem('userEmail', email);
    }
    
    setIsLoading(false);
    return result;
  };

  // Funcion de logout
  const logout = () => {
    apiService.clearTokens();
    setUser(null);
  };

  // Funcion de registro
  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    const result = await apiService.register(userData);
    
    if (result.success) {
      // Despues del registro, hacer login automatico
      const loginResult = await login(userData.email, userData.password);
      if (loginResult.success) {
        // Actualizar nombre con el nombre completo
        const fullName = `${userData.firstName} ${userData.lastName}`;
        localStorage.setItem('userName', fullName);
        setUser(prev => prev ? { ...prev, name: fullName } : null);
      }
    }
    
    setIsLoading(false);
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
