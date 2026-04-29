import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const Navbar = ({ title, onToggleNotifications }) => {
  const { language, changeLanguage, config, unreadCount } = useApp();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-4 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button onClick={() => setOpen(!open)} className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface2 text-primary md:hidden">
          ☰
        </button>
        <div>
          <p className="text-lg font-semibold text-white">{title || config?.app?.name}</p>
          <p className="text-sm text-muted">{config?.auth?.methods.includes('email_password') ? 'Secure workspace' : 'Config driven experience'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')} className="rounded-button border border-primary px-4 py-2 text-sm text-primary transition hover:bg-white/5">
          {language.toUpperCase()}
        </button>
        <button onClick={onToggleNotifications} className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface2 text-white">
          🔔
          {unreadCount > 0 && <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold">{unreadCount}</span>}
        </button>
        <button onClick={() => { logout(); navigate('/login'); }} className="rounded-button bg-gradient-to-r from-primary to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition active:scale-95">
          Logout
        </button>
      </div>
    </header>
  );
};
