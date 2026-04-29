import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const navItemClass = ({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${isActive ? 'border-l-4 border-primary bg-surface2 text-white' : 'text-muted hover:bg-surface2'}`;

export const Sidebar = ({ collapsed }) => {
  const { config } = useApp();
  const pages = config?.pages || [];

  return (
    <aside className={`bg-surface2 min-h-screen ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 border-r border-border`}> 
      <div className="px-5 py-6 flex items-center gap-3">
        <img src={config?.auth?.ui?.logo || '/logo.svg'} alt="Logo" className="h-10 w-10 rounded-2xl bg-primary p-2" />
        {!collapsed && <div>
          <p className="font-semibold text-white">{config?.app?.name || 'RouteForge'}</p>
          <p className="text-xs text-muted">Config-driven workspace</p>
        </div>}
      </div>
      <nav className="space-y-1 px-2">
        {pages.map((page) => (
          <NavLink key={page.id} to={page.id === 'dashboard' ? '/' : `/${page.id}`} className={navItemClass}>
            <span className="h-3 w-3 rounded-full bg-primary" />
            {!collapsed && <span>{page.title}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-4 py-6 text-sm text-muted">Designed for configuration-first operations.</div>
    </aside>
  );
};
