import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function ConfigError({ message }) {
  const { translate } = useApp();
  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4 text-center text-white">
      <div className="max-w-lg rounded-card border border-border bg-surface p-10 shadow-card">
        <h1 className="text-2xl font-semibold">{translate('configError')}</h1>
        <p className="mt-4 text-muted">{message || 'Unable to load application configuration.'}</p>
        <Link to="/login" className="mt-6 inline-flex rounded-button bg-primary px-5 py-3 text-white">{translate('tryAgain')}</Link>
      </div>
    </div>
  );
}
