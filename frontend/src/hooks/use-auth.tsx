'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'operator' | 'reviewer' | 'applicant';
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    type: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    organizationId?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      console.log('=== fetchUserProfile 시작 ===');
      const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
      console.log('API 응답:', response);
      const data = response.data || response;
      console.log('설정할 사용자 데이터:', data);
      setUser(data);
      console.log('=== fetchUserProfile 완료 ===');
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      // 토큰이 유효하지 않으면 로그아웃
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      apiClient.setToken(token);
      // 토큰이 있으면 사용자 정보를 가져옴
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiClient.post<{ accessToken: string; user: User }>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      const data = response.data || response;
      
      apiClient.setToken(data.accessToken);
      setUser(data.user);
      
      // 사용자 정보를 localStorage에 저장 (리다이렉트용)
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    organizationId?: string;
  }) => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUserProfile, loading }}>
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