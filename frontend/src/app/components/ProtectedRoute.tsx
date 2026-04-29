import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Verificar tambien localStorage como fallback
  const localUserName = localStorage.getItem('userName');
  const localUserRole = localStorage.getItem('userRole');
  const hasLocalAuth = !!localUserName && !!localUserRole;
  
  // Mostrar loading mientras se verifica la autenticacion
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-sena-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  // Si no esta autenticado (ni por contexto ni por localStorage), redirigir al login
  if (!isAuthenticated && !hasLocalAuth) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar roles permitidos
  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = user?.role || localUserRole;
    
    if (currentRole) {
      // Mapear roles para comparacion
      const normalizedRole = currentRole.toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
      
      // Verificar si el rol actual esta permitido
      let isAllowed = normalizedAllowedRoles.includes(normalizedRole);
      
      // Mapear roles del backend a roles del frontend
      if (!isAllowed) {
        if (normalizedRole === 'instructor' || normalizedRole === 'monitor') {
          isAllowed = normalizedAllowedRoles.includes('teacher');
        }
        if (normalizedRole === 'aprendiz') {
          isAllowed = normalizedAllowedRoles.includes('student');
        }
      }
      
      if (!isAllowed) {
        // Redirigir segun el rol actual
        if (normalizedRole === 'admin') {
          return <Navigate to="/admin" replace />;
        } else if (normalizedRole === 'teacher' || normalizedRole === 'instructor' || normalizedRole === 'monitor') {
          return <Navigate to="/teacher" replace />;
        } else {
          return <Navigate to="/dashboard" replace />;
        }
      }
    }
  }
  
  return <>{children}</>;
}
