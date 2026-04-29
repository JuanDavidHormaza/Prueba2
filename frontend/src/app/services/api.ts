// API Service para conectar con el backend Django
import { config } from '../config';

const API_BASE_URL = config.apiBaseUrl;

// Tipos para las respuestas del backend
export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface Person {
  person_id: number;
  email: string;
  doc_type: 'CC' | 'CE' | 'TI' | 'PS' | 'OT';
  doc_num: string;
  first_name: string;
  last_name: string;
  phone_num?: number;
  status: 'ACTIVO' | 'INACTIVO';
  created_at: string;
}

export interface User {
  user_id: number;
  person: Person;
  role_id: 'ADMIN' | 'APRENDIZ' | 'MONITOR' | 'INSTRUCTOR';
  status: 'PENDIENTE' | 'EN_FORMACION' | 'CANCELADO' | 'TRASLADADO' | 'RETIRO' | 'APLAZADO';
  mfa: string;
  created_at: string;
}

export interface Subject {
  subject_id: string;
  description: string;
}

export interface DigitalDictionary {
  word_id: string;
  subject: Subject;
  definition: string;
  synonyms: string;
  audio: string;
  video?: string;
  image: string;
}

// Clase para manejar las peticiones a la API
class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Cargar tokens del localStorage al iniciar
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Configurar headers con autenticacion
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    
    return headers;
  }

  // Guardar tokens
  private saveTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }

  // Limpiar tokens
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
  }

  // Verificar si el usuario esta autenticado
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Login - usar endpoint personalizado que devuelve tokens y user info
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: { role: string; name: string; id: number; email: string } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: email,
          email: email,
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { 
          success: false, 
          error: data.error || 'Credenciales incorrectas' 
        };
      }

      // Guardar tokens
      this.saveTokens(data.tokens.access, data.tokens.refresh);
      
      // Guardar info del usuario en localStorage
      const user = data.user;
      localStorage.setItem('userName', `${user.first_name} ${user.last_name}`.trim() || user.username);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id.toString());
      localStorage.setItem('userEmail', user.email);

      return { 
        success: true,
        user: {
          id: user.id,
          role: user.role,
          name: `${user.first_name} ${user.last_name}`.trim() || user.username,
          email: user.email
        }
      };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: 'Error de conexion con el servidor' 
      };
    }
  }

  // Refrescar token
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access;
      localStorage.setItem('accessToken', data.access);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  // Obtener perfil del usuario autenticado
  async getProfile(): Promise<{ success: boolean; data?: { id: number; username: string; email: string; first_name: string; last_name: string; role: string }; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.status === 401) {
        // Intentar refrescar el token
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.getProfile();
        }
        return { success: false, error: 'Sesion expirada' };
      }

      if (!response.ok) {
        return { success: false, error: 'Error al obtener perfil' };
      }

      const data = await response.json();
      return { success: true, data: data.user };
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return { success: false, error: 'Error de conexion' };
    }
  }

  // Registrar nuevo usuario
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    docType: string;
    docNum: string;
    phoneNum?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.email, // Usar email como username
          email: userData.email,
          password: userData.password,
          first_name: userData.firstName,
          last_name: userData.lastName,
          doc_type: userData.docType,
          doc_num: userData.docNum,
          phone_num: userData.phoneNum || null,
          role: 'APRENDIZ', // Rol por defecto para nuevos usuarios
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Formatear errores del serializer
        let errorMsg = 'Error al crear el usuario';
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError)) {
            errorMsg = firstError[0] as string;
          }
        }
        return { success: false, error: errorMsg };
      }

      // Guardar tokens si el registro los devuelve
      if (data.tokens) {
        this.saveTokens(data.tokens.access, data.tokens.refresh);
        
        const user = data.user;
        localStorage.setItem('userName', `${user.first_name} ${user.last_name}`.trim() || user.username);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userId', user.id.toString());
        localStorage.setItem('userEmail', user.email);
      }

      return { success: true };
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: 'Error de conexion con el servidor' 
      };
    }
  }

  // Obtener lista de personas
  async getPersons(): Promise<{ success: boolean; data?: Person[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/persons/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return { success: false, error: 'Error al obtener personas' };
      }

      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('Error al obtener personas:', error);
      return { success: false, error: 'Error de conexion' };
    }
  }

  // Obtener lista de usuarios
  async getUsers(): Promise<{ success: boolean; data?: User[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return { success: false, error: 'Error al obtener usuarios' };
      }

      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return { success: false, error: 'Error de conexion' };
    }
  }

  // Obtener lista de materias
  async getSubjects(): Promise<{ success: boolean; data?: Subject[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return { success: false, error: 'Error al obtener materias' };
      }

      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('Error al obtener materias:', error);
      return { success: false, error: 'Error de conexion' };
    }
  }

  // Obtener diccionario digital
  async getDictionary(): Promise<{ success: boolean; data?: DigitalDictionary[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/dictionary/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return { success: false, error: 'Error al obtener diccionario' };
      }

      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('Error al obtener diccionario:', error);
      return { success: false, error: 'Error de conexion' };
    }
  }

  // Crear entrada en el diccionario
  async createDictionaryEntry(entry: {
    word_id: string;
    subject: string;
    definition: string;
    synonyms: string;
    audio: string;
    video?: string;
    image: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/dictionary/create/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        return { success: false, error: 'Error al crear entrada' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error al crear entrada:', error);
      return { success: false, error: 'Error de conexion' };
    }
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();
