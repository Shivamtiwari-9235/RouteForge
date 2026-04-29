import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DynamicPage from './pages/DynamicPage.jsx';
import ConfigError from './pages/ConfigError.jsx';
import Layout from './components/Layout.jsx';
import { PrivateRoute } from './components/PrivateRoute.jsx';

const AnimatedRoutes = () => {
  const location = useLocation();
  const { configError } = useApp();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}> 
          <Route index element={<Dashboard />} />
          <Route path=":pageId" element={<DynamicPage />} />
        </Route>
        <Route path="/config-error" element={<ConfigError message={configError} />} />
        <Route path="*" element={<Navigate to={configError ? '/config-error' : '/'} replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          {loaded && <AnimatedRoutes />}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
