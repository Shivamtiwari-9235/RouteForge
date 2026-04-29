import { createContext, useContext, useEffect, useState } from 'react';
import create from 'zustand';
import { api } from '../utils/api.js';
import en from '../i18n/en.js';
import hi from '../i18n/hi.js';

const AppContext = createContext(null);

export const useAppStore = create((set) => ({
  config: null,
  configError: null,
  language: localStorage.getItem('language') || import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',
  notifications: [],
  unreadCount: 0,
  setAppConfig: (config) => set({ config }),
  setConfigError: (configError) => set({ configError }),
  setLanguage: (language) => set({ language }),
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (unreadCount) => set({ unreadCount })
}));

const translations = { en, hi };

export const AppProvider = ({ children }) => {
  const { config, configError, language, setAppConfig, setConfigError, setLanguage, setNotifications, setUnreadCount } = useAppStore();
  const [loaded, setLoaded] = useState(false);

  const loadConfig = async () => {
    try {
      const response = await api.get('/config');
      if (response.data.success) {
        setAppConfig(response.data.data);
      } else {
        setConfigError(response.data.error?.message || 'Unable to load configuration');
      }
    } catch (error) {
      setConfigError(error.response?.data?.error?.message || error.message || 'Configuration load failed');
    }
  };

  useEffect(() => {
    loadConfig().finally(() => setLoaded(true));
  }, []);

  const translate = (key) => {
    return translations[language]?.[key] || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <AppContext.Provider value={{ config, configError, translate, language, changeLanguage, loaded, setNotifications, setUnreadCount }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
