import { config } from '../config';

const API_BASE_URL = config.API_BASE_URL;

// Types for API responses
export interface ApiTokens {
  access: string;
  refresh: string;
}

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'APRENDIZ' | 'MONITOR' | 'INSTRUCTOR';
  person: ApiPerson | null;
}

export interface ApiPerson {
  person_id: number;
  email: string;
  doc_type: string;
  doc_num: string;
  first_name: string;
  last_name: string;
  phone_num: number | null;
  status: 'ACTIVO' | 'INACTIVO';
  created_at: string;
}

export interface ApiSenaUser {
  user_id: number;
  person: ApiPerson;
  role_id: 'ADMIN' | 'APRENDIZ' | 'MONITOR' | 'INSTRUCTOR';
  status: string;
  mfa: string;
  created_at: string;
}

export interface ApiSubject {
  subject_id: string;
  description: string;
}

export interface ApiDictionaryEntry {
  word_id: string;
  subject: ApiSubject | null;
  definition: string;
  synonyms: string;
  audio: string;
  video: string | null;
  image: string;
}

export interface ApiStats {
  totals: {
    users: number;
    persons: number;
    subjects: number;
    dictionary: number;
  };
  users_by_role: Array<{ role_id: string; count: number }>;
  users_by_status: Array<{ status: string; count: number }>;
  persons_by_status: Array<{ status: string; count: number }>;
  recent_users: ApiSenaUser[];
  current_user: ApiUser;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  doc_type: string;
  doc_num: string;
  first_name: string;
  last_name: string;
  phone_num?: number;
  role: string;
}

export interface LoginResponse {
  user: ApiUser;
  tokens: ApiTokens;
}

export interface RegisterResponse {
  user: ApiUser;
  tokens: ApiTokens;
  message: string;
}

// Token management
const TOKEN_KEY = 'sena_access_token';
const REFRESH_TOKEN_KEY = 'sena_refresh_token';
const USER_KEY = 'sena_user';

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setAccessToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  getUser: (): ApiUser | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: ApiUser): void => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  setTokens: (tokens: ApiTokens, user: ApiUser): void => {
    tokenStorage.setAccessToken(tokens.access);
    tokenStorage.setRefreshToken(tokens.refresh);
    tokenStorage.setUser(user);
  },
};

// API Error class
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Base fetch with auth
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = tokenStorage.getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle token expiration
  if (response.status === 401 && token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry request with new token
      (headers as Record<string, string>)['Authorization'] = `Bearer ${tokenStorage.getAccessToken()}`;
      return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    }
  }

  return response;
}

// Refresh access token
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      tokenStorage.setAccessToken(data.access);
      return true;
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
  }

  tokenStorage.clear();
  return false;
}

// Generic request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(endpoint, options);
  
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.error || data?.detail || 'Error en la solicitud',
      response.status,
      data
    );
  }

  return data as T;
}

// API methods
export const api = {
  // ============== AUTH ==============
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    tokenStorage.setTokens(response.tokens, response.user);
    return response;
  },

  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await apiRequest<RegisterResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    tokenStorage.setTokens(response.tokens, response.user);
    return response;
  },

  logout: (): void => {
    tokenStorage.clear();
  },

  getProfile: async (): Promise<ApiUser> => {
    return apiRequest<ApiUser>('/auth/profile/');
  },

  updateProfile: async (data: Partial<ApiUser>): Promise<ApiUser> => {
    return apiRequest<ApiUser>('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // ============== PERSONS ==============
  getPersons: async (): Promise<ApiPerson[]> => {
    return apiRequest<ApiPerson[]>('/persons/');
  },

  getPerson: async (id: number): Promise<ApiPerson> => {
    return apiRequest<ApiPerson>(`/persons/${id}/`);
  },

  createPerson: async (data: Omit<ApiPerson, 'person_id' | 'created_at'>): Promise<ApiPerson> => {
    return apiRequest<ApiPerson>('/persons/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePerson: async (id: number, data: Partial<ApiPerson>): Promise<ApiPerson> => {
    return apiRequest<ApiPerson>(`/persons/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deletePerson: async (id: number): Promise<void> => {
    await apiRequest<void>(`/persons/${id}/`, {
      method: 'DELETE',
    });
  },

  // ============== SENA USERS ==============
  getSenaUsers: async (): Promise<ApiSenaUser[]> => {
    return apiRequest<ApiSenaUser[]>('/sena-users/');
  },

  getSenaUser: async (id: number): Promise<ApiSenaUser> => {
    return apiRequest<ApiSenaUser>(`/sena-users/${id}/`);
  },

  createSenaUser: async (data: {
    person_id: number;
    role_id: string;
    status: string;
    mfa?: string;
  }): Promise<ApiSenaUser> => {
    return apiRequest<ApiSenaUser>('/sena-users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSenaUser: async (id: number, data: Partial<ApiSenaUser>): Promise<ApiSenaUser> => {
    return apiRequest<ApiSenaUser>(`/sena-users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteSenaUser: async (id: number): Promise<void> => {
    await apiRequest<void>(`/sena-users/${id}/`, {
      method: 'DELETE',
    });
  },

  // ============== SUBJECTS ==============
  getSubjects: async (): Promise<ApiSubject[]> => {
    return apiRequest<ApiSubject[]>('/subjects/');
  },

  getSubject: async (id: string): Promise<ApiSubject> => {
    return apiRequest<ApiSubject>(`/subjects/${id}/`);
  },

  createSubject: async (data: ApiSubject): Promise<ApiSubject> => {
    return apiRequest<ApiSubject>('/subjects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSubject: async (id: string, data: Partial<ApiSubject>): Promise<ApiSubject> => {
    return apiRequest<ApiSubject>(`/subjects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteSubject: async (id: string): Promise<void> => {
    await apiRequest<void>(`/subjects/${id}/`, {
      method: 'DELETE',
    });
  },

  // ============== DICTIONARY ==============
  getDictionary: async (): Promise<ApiDictionaryEntry[]> => {
    return apiRequest<ApiDictionaryEntry[]>('/dictionary/');
  },

  getDictionaryEntry: async (wordId: string, subjectId: string): Promise<ApiDictionaryEntry> => {
    return apiRequest<ApiDictionaryEntry>(`/dictionary/${wordId}/?subject=${subjectId}`);
  },

  createDictionaryEntry: async (data: {
    word_id: string;
    subject_id: string;
    definition: string;
    synonyms: string;
    audio: string;
    video?: string;
    image: string;
  }): Promise<ApiDictionaryEntry> => {
    return apiRequest<ApiDictionaryEntry>('/dictionary/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDictionaryEntry: async (id: number, data: Partial<ApiDictionaryEntry>): Promise<ApiDictionaryEntry> => {
    return apiRequest<ApiDictionaryEntry>(`/dictionary/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteDictionaryEntry: async (id: number): Promise<void> => {
    await apiRequest<void>(`/dictionary/${id}/`, {
      method: 'DELETE',
    });
  },

  // ============== STATS ==============
  getStats: async (): Promise<ApiStats> => {
    return apiRequest<ApiStats>('/stats/');
  },

  // ============== UTILITY ==============
  getUserByEmail: async (email: string): Promise<{ person: ApiPerson; user: ApiSenaUser | null }> => {
    return apiRequest<{ person: ApiPerson; user: ApiSenaUser | null }>(`/user-by-email/?email=${encodeURIComponent(email)}`);
  },
};

export default api;
