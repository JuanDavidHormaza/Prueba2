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

  // Login - obtener tokens JWT
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: { role: string; name: string } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: email, // Django JWT usa username por defecto
          password 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.detail || 'Credenciales incorrectas' 
        };
      }

      const data: TokenResponse = await response.json();
      this.saveTokens(data.access, data.refresh);

      // Obtener informacion del perfil del usuario
      const profileResponse = await this.getProfile();
      
      if (profileResponse.success && profileResponse.data) {
        return { 
          success: true,
          user: {
            role: profileResponse.data.role || 'student',
            name: profileResponse.data.user || email
          }
        };
      }

      // Si no se puede obtener el perfil, usar datos basicos
      return { 
        success: true,
        user: {
          role: 'student',
          name: email.split('@')[0]
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
  async getProfile(): Promise<{ success: boolean; data?: { user: string; role: string }; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/perfil/`, {
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
      return { success: true, data };
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
      // Crear persona primero
      const personResponse = await fetch(`${API_BASE_URL}/persons/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          doc_type: userData.docType,
          doc_num: userData.docNum,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone_num: userData.phoneNum ? parseInt(userData.phoneNum) : null,
          status: 'ACTIVO',
        }),
      });

      if (!personResponse.ok) {
        const errorData = await personResponse.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.error || 'Error al crear el usuario' 
        };
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
      return { success: true, data };
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
      return { success: true, data };
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
      return { success: true, data };
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
      return { success: true, data };
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
