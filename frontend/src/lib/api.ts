const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('API 오류 상세:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        error: error
      });
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    // 응답이 비어있으면 빈 객체 반환
    const text = await response.text();
    if (!text) {
      return { success: true, data: {} } as ApiResponse<T>;
    }
    
    return JSON.parse(text);
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  
  // 사용자
  USERS: {
    LIST: '/users',
    MANAGEABLE: '/users/manageable',
    STAFF: '/users/staff',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    CHANGE_ROLE: (id: string) => `/users/${id}/role`,
    UPDATE_MEMO: (id: string) => `/users/${id}/memo`,
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/password',
  },
  
  // 프로그램
  PROGRAMS: {
    LIST: '/programs',
    CREATE: '/programs',
    DETAIL: (id: string) => `/programs/${id}`,
    UPDATE: (id: string) => `/programs/${id}`,
    DELETE: (id: string) => `/programs/${id}`,
    STATS: (id: string) => `/programs/${id}/stats`,
  },
  
  // 신청서
  APPLICATIONS: {
    LIST: '/applications',
    CREATE: '/applications',
    DETAIL: (id: string) => `/applications/${id}`,
    UPDATE: (id: string) => `/applications/${id}`,
    WITHDRAW: (id: string) => `/applications/${id}/withdraw`,
    REVIEW: (id: string) => `/applications/${id}/review`,
    PAYMENT: (id: string) => `/applications/${id}/payment`,
    BY_PROGRAM: (programId: string) => `/applications/programs/${programId}`,
    STATS: (programId: string) => `/applications/programs/${programId}/stats`,
  },
  
  // 선정
  SELECTIONS: {
    LIST: '/selections',
    CREATE: '/selections',
    DETAIL: (id: string) => `/selections/${id}`,
    UPDATE: (id: string) => `/selections/${id}`,
    BY_PROGRAM: (programId: string) => `/selections/programs/${programId}`,
    STATS: (programId: string) => `/selections/programs/${programId}/stats`,
  },
  
  // 방문
  VISITS: {
    LIST: '/visits',
    CREATE: '/visits',
    DETAIL: (id: string) => `/visits/${id}`,
    UPDATE: (id: string) => `/visits/${id}`,
    COMPLETE: (id: string) => `/visits/${id}/complete`,
    CANCEL: (id: string) => `/visits/${id}/cancel`,
    BY_PROGRAM: (programId: string) => `/visits/programs/${programId}`,
    STATS: (programId: string) => `/visits/programs/${programId}/stats`,
  },
  
        // 조직
        ORGANIZATIONS: {
          LIST: '/organizations',
          CREATE: '/organizations',
          GET: (id: string) => `/organizations/${id}`,
          DETAIL: (id: string) => `/organizations/${id}`,
          UPDATE: (id: string) => `/organizations/${id}`,
          DELETE: (id: string) => `/organizations/${id}`,
          STATS: (id: string) => `/organizations/${id}/stats`,
          TYPES: '/organizations/types',
        },

        // 대시보드
        DASHBOARD: {
          STATS: '/dashboard/stats',
          HEALTH: '/dashboard/health',
          EXPORT: '/dashboard/export',
        },

        // 회원 신고
        USER_REPORTS: {
          LIST: '/user-reports',
          CREATE: '/user-reports',
          DETAIL: (id: string) => `/user-reports/${id}`,
          UPDATE: (id: string) => `/user-reports/${id}`,
          DELETE: (id: string) => `/user-reports/${id}`,
        },

        // 할 일
        TODOS: {
          LIST: '/todos',
          CREATE: '/todos',
          DETAIL: (id: string) => `/todos/${id}`,
          UPDATE: (id: string) => `/todos/${id}`,
          DELETE: (id: string) => `/todos/${id}`,
          TOGGLE: (id: string) => `/todos/${id}/toggle`,
        },
} as const;
