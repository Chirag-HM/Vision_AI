/**
 * src/context/AuthContext.tsx
 * Provides global authentication state, token management, and role info.
 * Access token is stored in memory (NOT localStorage) for security.
 * Refresh token lives in a secure httpOnly cookie managed by the backend.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'BLIND_USER' | 'VOLUNTEER' | 'CAREGIVER' | 'ADMIN';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<string>;
  verifyOtp: (email: string, otp: string) => Promise<string>;
  resendOtp: (email: string) => Promise<string>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // required to send/receive httpOnly cookies
});

// ─── Context & Provider ───────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ref to avoid stale closure in interceptor
  const accessTokenRef = useRef<string | null>(null);
  accessTokenRef.current = accessToken;

  // ── Axios Request Interceptor: Attach access token ──────────────────────────
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use((config) => {
      if (accessTokenRef.current) {
        config.headers.Authorization = `Bearer ${accessTokenRef.current}`;
      }
      return config;
    });

    // ── Axios Response Interceptor: Auto-refresh on 401 ───────────────────────
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        // Skip refresh retry for auth endpoints — their 401s mean bad credentials, not expired tokens
        const url = originalRequest?.url || '';
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh') || url.includes('/auth/verify-otp') || url.includes('/auth/resend-otp');
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true;
          try {
            const { data } = await axios.post(
              `${API_URL}/auth/refresh`,
              {},
              { withCredentials: true }
            );
            const newToken = data.access_token;
            setAccessToken(newToken);
            accessTokenRef.current = newToken;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch {
            // Refresh failed — log user out
            setUser(null);
            setAccessToken(null);
            accessTokenRef.current = null;
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // ── Restore session on page reload via refresh token cookie ─────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setAccessToken(data.access_token);
        setUser({ id: data.user_id, role: data.role, email: '' });

        // Fetch full profile
        const meRes = await apiClient.get('/auth/me', {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        setUser(meRes.data);
      } catch {
        // No valid cookie — user is not logged in
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const { data } = await apiClient.post('/auth/login', formData);
    setAccessToken(data.access_token);

    const meRes = await apiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    setUser(meRes.data);
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (email: string, password: string, role: UserRole): Promise<string> => {
    const { data } = await apiClient.post('/auth/register', { email, password, role });
    return data.message;
  }, []);

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const verifyOtp = useCallback(async (email: string, otp: string): Promise<string> => {
    const { data } = await apiClient.post('/auth/verify-otp', { email, otp });
    return data.message;
  }, []);

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const resendOtp = useCallback(async (email: string): Promise<string> => {
    const { data } = await apiClient.post('/auth/resend-otp', { email });
    return data.message;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setUser(null);
      setAccessToken(null);
      accessTokenRef.current = null;
    }
  }, []);

  // ── Role Checker ─────────────────────────────────────────────────────────
  const hasRole = useCallback(
    (...roles: UserRole[]) => !!user && roles.includes(user.role),
    [user]
  );

  const value: AuthContextValue = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

