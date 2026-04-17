import { Link, useLocation } from 'react-router-dom';
import { BarChart3, History } from 'lucide-react';
import logo from '../PiiX_logo.png';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
              <img src={logo} alt="Logo" className="h-10" />
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`btn-ghost text-sm ${isActive('/') ? 'bg-surface-100 text-slate-800' : ''}`}
            >
              <BarChart3 size={15} />
              Analyze
            </Link>
            <Link
              to="/history"
              className={`btn-ghost text-sm ${isActive('/history') ? 'bg-surface-100 text-slate-800' : ''}`}
            >
              <History size={15} />
              History
            </Link>
          </nav>
          <a href="https://piix.ai" target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
            ← Back to PiiX.ai
          </a>
        </div>
      </div>
    </header>
  );
}
