/**
 * API Service for communicating with Django backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface TokenResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    full_name: string;
    permissions: UserPermissions;
  };
}

interface UserPermissions {
  canManageUsers: boolean;
  canManageDocuments: boolean;
  canViewStatistics: boolean;
  canGiveFeedback: boolean;
  canTakeQuiz: boolean;
  canViewResults: boolean;
  canManageSubjects: boolean;
  canConfigureLevels: boolean;
}

interface ApiUser {
  id: number;
  username: string;
  email: string;
  role: string;
  full_name: string;
  is_active: boolean;
  date_joined: string;
  permissions?: UserPermissions;
  person?: {
    person_id: number;
    email: string;
    doc_type: string;
    doc_num: string;
    first_name: string;
    last_name: string;
    phone_num: number | null;
    status: string;
  };
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
  doc_type?: string;
  doc_num: string;
  phone_num?: number;
  program?: string;
}

interface Subject {
  subject_id: string;
  description: string;
}

interface DictionaryEntry {
  word_id: string;
  subject: string;
  subject_name: string;
  definition: string;
  synonyms: string;
  audio: string;
  video: string | null;
  image: string;
}

interface TestResult {
  result_id: number;
  user: number;
  user_name: string;
  user_email: string;
  score: number;
  level: string;
  correct_answers: number;
  total_questions: number;
  answers: Array<{
    questionId: number;
    question: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    category: string;
  }>;
  feedback: string | null;
  duration: string | null;
  completed_at: string;
}

interface Statistics {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_admins: number;
  active_users: number;
  total_subjects: number;
  total_dictionary_entries: number;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        // Clear auth data and redirect to login
        this.logout();
        throw new Error('Session expired. Please login again.');
      }
      throw new Error('Token refreshed. Please retry the request.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ==================== AUTH ====================

  async login(email: string, password: string): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });

    const data = await this.handleResponse<TokenResponse>(response);
    
    // Store tokens
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  async register(data: RegisterData): Promise<{ message: string; user: ApiUser }> {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      return true;
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userPermissions');
  }

  async getProfile(): Promise<ApiUser> {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateProfile(data: Partial<ApiUser>): Promise<ApiUser> {
    const response = await fetch(`${API_BASE_URL}/auth/profile/update/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  // ==================== USERS (Admin) ====================

  async listUsers(role?: string): Promise<ApiUser[]> {
    const url = role 
      ? `${API_BASE_URL}/users/?role=${role}`
      : `${API_BASE_URL}/users/`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getUser(userId: number): Promise<ApiUser> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateUser(userId: number, data: Partial<ApiUser>): Promise<ApiUser> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/update/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/delete/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    await this.handleResponse(response);
  }

  // ==================== SUBJECTS ====================

  async listSubjects(): Promise<Subject[]> {
    const response = await fetch(`${API_BASE_URL}/subjects/`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async createSubject(data: Subject): Promise<Subject> {
    const response = await fetch(`${API_BASE_URL}/subjects/create/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async updateSubject(subjectId: string, data: Partial<Subject>): Promise<Subject> {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}/update/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async deleteSubject(subjectId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}/delete/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    await this.handleResponse(response);
  }

  // ==================== DICTIONARY ====================

  async listDictionary(subjectId?: string): Promise<DictionaryEntry[]> {
    const url = subjectId 
      ? `${API_BASE_URL}/dictionary/?subject=${subjectId}`
      : `${API_BASE_URL}/dictionary/`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async createDictionaryEntry(data: Omit<DictionaryEntry, 'subject_name'>): Promise<DictionaryEntry> {
    const response = await fetch(`${API_BASE_URL}/dictionary/create/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async updateDictionaryEntry(
    wordId: string, 
    subjectId: string, 
    data: Partial<DictionaryEntry>
  ): Promise<DictionaryEntry> {
    const response = await fetch(`${API_BASE_URL}/dictionary/${wordId}/${subjectId}/update/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async deleteDictionaryEntry(wordId: string, subjectId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/dictionary/${wordId}/${subjectId}/delete/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    await this.handleResponse(response);
  }

  // ==================== TEST RESULTS ====================

  async listTestResults(userId?: number): Promise<TestResult[]> {
    const url = userId 
      ? `${API_BASE_URL}/results/?user_id=${userId}`
      : `${API_BASE_URL}/results/`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getTestResult(resultId: number): Promise<TestResult> {
    const response = await fetch(`${API_BASE_URL}/results/${resultId}/`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async submitTestResult(data: Omit<TestResult, 'result_id' | 'user' | 'user_name' | 'user_email' | 'completed_at' | 'feedback'>): Promise<TestResult> {
    const response = await fetch(`${API_BASE_URL}/results/submit/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async addFeedback(resultId: number, feedback: string): Promise<TestResult> {
    const response = await fetch(`${API_BASE_URL}/results/${resultId}/feedback/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ feedback }),
    });

    return this.handleResponse(response);
  }

  // ==================== STATISTICS ====================

  async getStatistics(): Promise<Statistics> {
    const response = await fetch(`${API_BASE_URL}/statistics/`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // ==================== HELPERS ====================

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getCurrentUser(): ApiUser | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

export const api = new ApiService();
export type { 
  TokenResponse, 
  UserPermissions, 
  ApiUser, 
  RegisterData, 
  Subject, 
  DictionaryEntry, 
  TestResult, 
  Statistics 
};
