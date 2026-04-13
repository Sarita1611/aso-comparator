import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, History, LogOut, User, Zap } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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

            {user && (
              <Link
                to="/history"
                className={`btn-ghost text-sm ${isActive('/history') ? 'bg-surface-100 text-slate-800' : ''}`}
              >
                <History size={15} />
                History
              </Link>
            )}
          </nav>

          {/* Auth section */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-50 rounded-xl border border-surface-200">
                  <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center">
                    <User size={12} className="text-brand-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 max-w-[140px] truncate">
                    {user.email}
                  </span>
                </div>
                <button onClick={handleSignOut} className="btn-ghost text-sm text-red-500 hover:text-red-600 hover:bg-red-50">
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Get started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
