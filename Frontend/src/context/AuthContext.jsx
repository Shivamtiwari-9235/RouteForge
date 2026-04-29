import { createContext, useContext, useEffect, useState } from 'react';
import create from 'zustand';
import { api } from '../utils/api.js';
import { useAppStore } from './AppContext.jsx';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  accessToken: null,
  loading: true,
  configError: null
};

export const useAuthStore = create((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setLoading: (loading) => set({ loading }),
  setConfigError: (configError) => set({ configError })
}));

export const AuthProvider = ({ children }) => {
  const { setAppConfig } = useAppStore();
  const { setUser, setAccessToken, setLoading, setConfigError } = useAuthStore();

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return null;
      }
      setAccessToken(token);
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const refresh = await api.post('/auth/refresh');
          if (refresh.data.success) {
            setAccessToken(refresh.data.data.accessToken);
            localStorage.setItem('accessToken', refresh.data.data.accessToken);
            const retry = await api.get('/auth/me');
            setUser(retry.data.data.user);
            return retry.data;
          }
        } catch {
          // Clear invalid state
          setUser(null);
          setAccessToken(null);
          localStorage.removeItem('accessToken');
        }
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchMe();
      setLoading(false);
    };
    init();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        setUser(response.data.data.user);
        setAccessToken(response.data.data.accessToken);
        localStorage.setItem('accessToken', response.data.data.accessToken);
        setConfigError(null); // Clear any config errors
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error?.response?.data || error.message || error);
      throw error;
    }
  };

  const register = async (payload) => {
    try {
      const response = await api.post('/auth/register', payload);
      if (response.data.success) {
        setUser(response.data.data.user);
        setAccessToken(response.data.data.accessToken);
        localStorage.setItem('accessToken', response.data.data.accessToken);
        setConfigError(null); // Clear any config errors
      }
      return response.data;
    } catch (error) {
      console.error('Register error:', error?.response?.data || error.message || error);
      throw error;
    }
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    setAppConfig(null);
  };

  return (
    <AuthContext.Provider value={{ fetchMe, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
