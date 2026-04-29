import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { useApp } from '../context/AppContext.jsx';
import NotificationsPanel from '../pages/NotificationsPanel.jsx';

const containerAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Layout() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const { config } = useApp();
  const page = config?.pages?.find((item) => item.id === location.pathname.slice(1));

  return (
    <div className="flex min-h-screen bg-bg text-white">
      <Sidebar />
      <div className="flex-1">
        <Navbar title={page?.title || config?.app?.name} onToggleNotifications={() => setNotificationsOpen((value) => !value)} />
        <main className="p-6">
          <motion.div initial="hidden" animate="visible" variants={containerAnimation} transition={{ duration: 0.3 }} className="background-panel p-6 shadow-card">
            <Outlet />
          </motion.div>
        </main>
        <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      </div>
    </div>
  );
}
