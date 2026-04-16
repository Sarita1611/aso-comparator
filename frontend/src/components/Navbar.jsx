import { Link, useLocation } from 'react-router-dom';
import { BarChart3, History, Zap } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-700 text-lg text-slate-800">
              ASO<span className="text-brand-600">vision</span>
            </span>
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
        </div>
      </div>
    </header>
  );
}
