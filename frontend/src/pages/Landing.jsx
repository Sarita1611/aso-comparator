import { useState, useEffect } from 'react';
import { Plus, Loader2, Zap, BarChart3, Sparkles, RotateCcw, Download, Globe, ChevronDown } from 'lucide-react';
import AppInputCard from '../components/AppInputCard';
import ReportSection from '../components/ReportSection';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { exportReportToPDF } from '../components/PDFExport';
import { Link } from 'react-router-dom';

const MAX_APPS = 4;

export default function Landing() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([null, null]);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [fetchedApps, setFetchedApps] = useState([]);
  const [error, setError] = useState('');
  const [exportingPDF, setExportingPDF] = useState(false);

  // Country state
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({ name: 'United States', code: 'us' });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    api.getCountries().then(({ countries }) => setCountries(countries)).catch(() => {});
    const handleClick = () => setShowCountryDropdown(false);
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filledSlots = slots.filter(Boolean);
  const canAnalyze = filledSlots.length >= 1;

  const handleAppFetched = (index, appData) => {
    setSlots(prev => { const next = [...prev]; next[index] = appData; return next; });
    setReport(null);
  };

  const addSlot = () => {
    if (slots.length < MAX_APPS) setSlots(prev => [...prev, null]);
  };

  const removeSlot = (index) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
    setReport(null);
  };

  const handleAnalyze = async () => {
    const apps = slots.filter(Boolean);
    if (!apps.length) return;
    setAnalyzing(true);
    setError('');
    setReport(null);
    try {
      const result = await api.analyzeApps(apps, user?.id, selectedCountry.code);
      setReport(result.report);
      setFetchedApps(apps);
      setTimeout(() => {
        document.getElementById('aso-report')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setSlots([null, null]);
    setReport(null);
    setFetchedApps([]);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      await exportReportToPDF('aso-report', `aso-report-${selectedCountry.code}`);
    } catch {
      alert('PDF export failed. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      {!report && (
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-full text-xs font-medium text-brand-700 mb-4">
            <Sparkles size={12} /> AI-Powered ASO Analysis with RAG
          </div>
          <h1 className="font-display font-bold text-4xl text-slate-800 mb-3">
            Compare App Store <span className="text-gradient">Optimization</span>
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Enter up to 4 apps and get a detailed AI-powered ASO comparison — scores, keyword analysis, competitor gaps, and actionable roadmaps.
          </p>
          {!user && (
            <p className="text-xs text-slate-400 mt-3">
              <Link to="/register" className="text-brand-500 hover:underline font-medium">Sign up free</Link> to save reports and access history
            </p>
          )}
        </div>
      )}

      {!report && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Country Selector */}
          <div className="mb-5 flex justify-center">
            <div className="relative" onMouseDown={e => e.stopPropagation()}>
              <button
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-200 rounded-xl shadow-card hover:shadow-card-hover transition-all text-sm font-medium text-slate-700"
              >
                <Globe size={15} className="text-brand-500" />
                <span>🌍 {selectedCountry.name}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCountryDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-surface-200 rounded-xl shadow-elevated z-50 animate-fade-in">
                  <div className="p-2 border-b border-surface-100">
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                      placeholder="Search country..."
                      className="w-full px-3 py-2 text-xs bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto p-1">
                    {filteredCountries.map(c => (
                      <button
                        key={c.code}
                        onClick={() => { setSelectedCountry(c); setShowCountryDropdown(false); setCountrySearch(''); setSlots([null, null]); setReport(null); }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${selectedCountry.code === c.code ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-surface-50 text-slate-700'}`}
                      >
                        {c.name}
                        <span className="text-xs text-slate-400 ml-1.5 uppercase">{c.code}</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-surface-100 text-center text-xs text-slate-400">
                    Data fetched from {selectedCountry.name} app stores
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* App Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {slots.map((appData, i) => (
              <AppInputCard
                key={i}
                index={i}
                appData={appData}
                onAppFetched={handleAppFetched}
                onRemove={removeSlot}
                canRemove={slots.length > 2}
                country={selectedCountry.code}
              />
            ))}

            {slots.length < MAX_APPS && (
              <button
                onClick={addSlot}
                className="border-2 border-dashed border-surface-200 hover:border-brand-300 hover:bg-brand-50/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 transition-all duration-200 text-slate-400 hover:text-brand-500 group"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                  <Plus size={20} />
                </div>
                <span className="text-sm font-medium">Add another app</span>
                <span className="text-xs text-slate-300">{slots.length}/{MAX_APPS} apps</span>
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">{error}</div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button onClick={handleAnalyze} disabled={!canAnalyze || analyzing} className="btn-primary px-8 py-3.5 text-base">
              {analyzing
                ? <><Loader2 size={18} className="animate-spin" /> Analyzing with AI...</>
                : <><Zap size={18} /> Analyze {filledSlots.length > 0 ? `${filledSlots.length} App${filledSlots.length > 1 ? 's' : ''}` : 'Apps'} in {selectedCountry.name}</>
              }
            </button>
          </div>

          {analyzing && (
            <div className="mt-6 text-center animate-fade-in">
              <div className="inline-flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-surface-200 shadow-card">
                <div className="flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin text-brand-500" />
                  <span className="text-sm font-medium text-slate-700">Running AI analysis for {selectedCountry.name}...</span>
                </div>
                <div className="space-y-1 text-xs text-slate-400 text-center">
                  <p>📚 Retrieving ASO knowledge base</p>
                  <p>🌍 Applying {selectedCountry.name} market context</p>
                  <p>🔍 Generating keyword suggestions & competitor gaps</p>
                  <p>📊 Scoring 7 ASO pillars per app</p>
                  <p>🗺️ Building improvement roadmaps</p>
                </div>
                <p className="text-xs text-slate-400 italic">This takes 20-40 seconds</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report */}
      {report && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6 sticky top-20 z-10 bg-surface-50/90 backdrop-blur-sm py-3">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                <BarChart3 size={18} className="text-brand-500" />
                ASO Report — {selectedCountry.name} Market
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{fetchedApps.length} app{fetchedApps.length > 1 ? 's' : ''} analyzed</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleNewAnalysis} className="btn-secondary text-sm">
                <RotateCcw size={14} /> New Analysis
              </button>
              <button onClick={handleExportPDF} disabled={exportingPDF} className="btn-primary text-sm">
                {exportingPDF ? <><Loader2 size={14} className="animate-spin" /> Exporting...</> : <><Download size={14} /> Export PDF</>}
              </button>
            </div>
          </div>

          <ReportSection report={report} apps={fetchedApps} country={selectedCountry} />

          <div className="flex items-center justify-center gap-3 mt-10 pt-8 border-t border-surface-200">
            <button onClick={handleNewAnalysis} className="btn-secondary"><RotateCcw size={15} /> New Analysis</button>
            <button onClick={handleExportPDF} disabled={exportingPDF} className="btn-primary">
              {exportingPDF ? <><Loader2 size={15} className="animate-spin" /> Exporting...</> : <><Download size={15} /> Download PDF</>}
            </button>
          </div>

          {!user && (
            <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-2xl text-center">
              <p className="text-sm text-brand-800 font-medium mb-1">Want to save this report?</p>
              <p className="text-xs text-brand-600 mb-3">Create a free account to access your history anytime</p>
              <Link to="/register" className="btn-primary text-sm"><Zap size={14} /> Create Free Account</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
