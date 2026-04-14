import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Download, Trash2, Loader2, Trophy, Smartphone, ChevronRight, BarChart2, Plus } from 'lucide-react';
import { exportReportToPDF } from '../components/PDFExport';
import ReportSection from '../components/ReportSection';

// Helper: apps_analyzed is stored as a string in DB e.g. "Instagram, Zomato"
// This converts it to a consistent array format
function parseAppsAnalyzed(apps_analyzed) {
  if (!apps_analyzed) return [];
  if (Array.isArray(apps_analyzed)) return apps_analyzed;
  if (typeof apps_analyzed === 'string') {
    return apps_analyzed.split(', ').map(name => ({ name, icon: null, platform: null, country: null }));
  }
  return [];
}

function getAppsLabel(apps_analyzed) {
  const apps = parseAppsAnalyzed(apps_analyzed);
  return apps.map(a => a.name).join(' vs ');
}

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchHistory();
  }, [user, page]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getHistory(user.id, page);
      setHistory(data.history || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load history. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this analysis? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.deleteHistoryEntry(id, user.id);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (selectedEntry?.id === id) setSelectedEntry(null);
    } catch (err) {
      alert('Failed to delete. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async (entry, e) => {
    e.stopPropagation();
    setExportingId(entry.id);
    if (selectedEntry?.id !== entry.id) setSelectedEntry(entry);
    setTimeout(async () => {
      try {
        await exportReportToPDF('aso-report', `aso-report-${entry.id.substring(0, 8)}`);
      } catch {
        alert('Export failed. Please try again.');
      } finally {
        setExportingId(null);
      }
    }, 600);
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Analysis History</h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? 'Loading...' : `${history.length} report${history.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>
        <Link to="/" className="btn-primary text-sm">
          <Plus size={14} /> New Analysis
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={22} className="animate-spin text-brand-500" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart2 size={24} className="text-slate-300" />
          </div>
          <h3 className="font-display font-semibold text-slate-700 mb-2">No analyses yet</h3>
          <p className="text-sm text-slate-400 mb-6">Run your first ASO comparison to see results here</p>
          <Link to="/" className="btn-primary">Start analyzing</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* History list */}
          <div className="lg:col-span-1 space-y-2">
            {history.map((entry) => {
              const appsList = parseAppsAnalyzed(entry.apps_analyzed);
              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                  className={`card-hover p-4 cursor-pointer transition-all ${selectedEntry?.id === entry.id ? 'border-brand-300 bg-brand-50/30' : ''}`}
                >
                  {/* App icons */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    {appsList.map((app, i) => (
                      app.icon ? (
                        <img key={i} src={app.icon} alt={app.name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div key={i} className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
                          <Smartphone size={13} className="text-slate-400" />
                        </div>
                      )
                    ))}
                    <span className="text-xs text-slate-400 ml-0.5">{entry.app_count} app{entry.app_count !== 1 ? 's' : ''}</span>
                    {entry.country && (
                      <span className="text-xs text-slate-400 ml-auto">{entry.country.toUpperCase()}</span>
                    )}
                  </div>

                  {/* App names */}
                  <p className="text-xs font-semibold text-slate-700 mb-1 truncate">
                    {getAppsLabel(entry.apps_analyzed)}
                  </p>

                  {/* Winner */}
                  {entry.winner && (
                    <p className="text-xs text-amber-700 mb-2 flex items-center gap-1">
                      <Trophy size={10} className="flex-shrink-0" />
                      {entry.winner} ranked first
                    </p>
                  )}

                  {/* Date + actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{formatDate(entry.created_at)}</span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={(e) => handleExport(entry, e)}
                        disabled={exportingId === entry.id}
                        title="Download PDF"
                        className="p-1.5 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors text-slate-400"
                      >
                        {exportingId === entry.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Download size={13} />
                        }
                      </button>
                      <button
                        onClick={(e) => handleDelete(entry.id, e)}
                        disabled={deletingId === entry.id}
                        title="Delete"
                        className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-slate-400"
                      >
                        {deletingId === entry.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Trash2 size={13} />
                        }
                      </button>
                      <ChevronRight size={13} className={`text-slate-300 transition-transform ${selectedEntry?.id === entry.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs px-3 py-1.5">
                  Previous
                </button>
                <span className="text-xs text-slate-500">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-xs px-3 py-1.5">
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Report preview */}
          <div className="lg:col-span-2">
            {selectedEntry ? (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {getAppsLabel(selectedEntry.apps_analyzed)}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(selectedEntry.created_at)}</p>
                  </div>
                  <button
                    onClick={(e) => handleExport(selectedEntry, e)}
                    disabled={exportingId === selectedEntry.id}
                    className="btn-primary text-sm"
                  >
                    {exportingId === selectedEntry.id
                      ? <><Loader2 size={13} className="animate-spin" /> Exporting...</>
                      : <><Download size={13} /> Download PDF</>
                    }
                  </button>
                </div>
                <ReportSection report={selectedEntry.report} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-surface-200 rounded-2xl">
                <div className="text-center text-slate-400">
                  <ChevronRight size={28} className="mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">Select a report to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
