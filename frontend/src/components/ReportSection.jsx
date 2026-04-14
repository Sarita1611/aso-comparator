import { useState } from 'react';
import { BarChart3, FileText, Zap, Image, Users, Lightbulb } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'appText', label: 'App Text', icon: FileText },
  { id: 'creativeScoring', label: 'Creative Scoring', icon: Zap },
  { id: 'screenshots', label: 'Screenshots', icon: Image },
  { id: 'competitors', label: 'Competitors', icon: Users },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
];

export default function ReportSection({ report }) {
  const [activeTab, setActiveTab] = useState('overview');
  const apps = report?.apps || [];

  if (!report) return null;

  const ScoreBadge = ({ score, maxScore = 100, size = 'md' }) => {
    const percentage = (score / maxScore) * 100;
    const colorClass =
      percentage >= 80 ? 'bg-green-100 text-green-700' :
      percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
      percentage >= 40 ? 'bg-orange-100 text-orange-700' :
      'bg-red-100 text-red-700';
    const textSize = size === 'lg' ? 'text-xl font-bold' : size === 'sm' ? 'text-xs' : 'text-sm font-semibold';
    const padding = size === 'lg' ? 'px-3 py-2' : size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-1';
    return (
      <div className={`${colorClass} ${padding} rounded-lg ${textSize}`}>
        {score}/{maxScore}
      </div>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6 pb-8">
      {apps.map((app, idx) => {
        const overview = app.analysis?.overview || {};
        return (
          <div key={idx} className="card p-6">
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-surface-200">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{app.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {app.developer} • {app.platform === 'ios' ? '🍎 App Store' : '🤖 Google Play'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-brand-600">{overview.influenceStrength || 0}</div>
                <p className="text-xs text-slate-500">/100 Influence</p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3 mb-8">
              {[
                { label: 'Creative Strategy', score: overview.creativeStrategy },
                { label: 'Design & Visuals', score: overview.designVisuals },
                { label: 'Market Fit', score: overview.marketFit },
                { label: 'Differentiation', score: overview.differentiation },
                { label: 'Performance', score: overview.performance },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <ScoreBadge score={item.score || 0} size="lg" />
                  <p className="text-xs text-slate-600 mt-2 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-700">{overview.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-green-700 mb-3">✓ Key Strengths</h4>
                <ul className="space-y-2">
                  {(overview.keyStrengths || []).map((s, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-2"><span className="text-green-600 font-bold">•</span><span>{s}</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-700 mb-3">✗ Key Weaknesses</h4>
                <ul className="space-y-2">
                  {(overview.keyWeaknesses || []).map((w, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-2"><span className="text-red-600 font-bold">•</span><span>{w}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const AppTextTab = () => (
    <div className="space-y-6 pb-8">
      {apps.map((app, idx) => {
        const appText = app.analysis?.appText || {};
        return (
          <div key={idx} className="card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{app.name}</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-slate-800">Overall Text Score</h4>
                <ScoreBadge score={appText.overallTextScore || 0} maxScore={10} />
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{appText.strategicAssessment}</p>
            </div>
            {['title', 'subtitle', 'description'].map((section) => {
              const data = appText[section] || {};
              return (
                <div key={section} className="mb-6 border border-surface-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-slate-800 capitalize">{section}</h4>
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={data.score || 0} maxScore={10} size="sm" />
                      <span className="text-xs text-slate-500">{data.length}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded mb-3 border-l-4 border-brand-400">
                    <p className="text-sm font-mono text-slate-700">"{data.currentValue || 'N/A'}"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-slate-700 mb-2">Strengths</p>
                      <ul className="space-y-1">{(data.strengths || []).map((s, i) => <li key={i} className="text-slate-600">✓ {s}</li>)}</ul>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 mb-2">Suggestions</p>
                      <ul className="space-y-1">{(data.suggestions || []).map((s, i) => <li key={i} className="text-slate-600">→ {s}</li>)}</ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  const CreativeScoringTab = () => (
    <div className="space-y-6 pb-8">
      {apps.map((app, idx) => {
        const creative = app.analysis?.creativeScoring || {};
        const radar = creative.categoryRadar || {};
        return (
          <div key={idx} className="card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">{app.name}</h3>
            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-slate-800 mb-4">Category Radar</h4>
              <div className="space-y-3">
                {Object.entries(radar).map(([key, score]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700 capitalize">{key}</span>
                      <span className="text-sm font-bold text-slate-800">{score}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-6">
              <h4 className="font-semibold text-slate-800 mb-4">Conversion Funnel Coverage</h4>
              <div className="grid grid-cols-4 gap-3">
                {['hook', 'features', 'socialProof', 'cta'].map((stage) => {
                  const has = creative.conversionFunnelCoverage?.[stage] || false;
                  return (
                    <div key={stage} className={`p-4 rounded-lg text-center text-sm font-semibold capitalize ${has ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {has ? '✓' : '✗'} {stage}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const ScreenshotsTab = () => (
    <div className="space-y-6 pb-8">
      {apps.map((app, idx) => {
        const screenshots = app.analysis?.screenshots || {};
        return (
          <div key={idx} className="card p-6">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-surface-200">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{app.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{screenshots.count || 0} screenshots</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 mb-6">{screenshots.analysisNote}</p>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-bold text-green-700 mb-3">✓ Strengths</h4>
                <ul className="space-y-2">{(screenshots.strengths || []).map((s, i) => <li key={i} className="text-xs text-slate-600">• {s}</li>)}</ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-700 mb-3">✗ Weaknesses</h4>
                <ul className="space-y-2">{(screenshots.weaknesses || []).map((w, i) => <li key={i} className="text-xs text-slate-600">• {w}</li>)}</ul>
              </div>
            </div>
            <div className="space-y-4">
              {(screenshots.screens || []).map((screen, i) => (
                <div key={i} className="border border-surface-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-slate-800">Screen {screen.number}</h5>
                    <div className="flex gap-4 text-xs">
                      <span className="text-slate-600">Clarity: <strong>{screen.clarity}/10</strong></span>
                      <span className="text-slate-600">Stop Power: <strong>{screen.stopPower}/10</strong></span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{screen.purpose}</p>
                  <div className="text-xs text-slate-600">
                    {(screen.keyElements || []).map((elem, j) => (
                      <span key={j} className="inline-block bg-slate-100 px-2 py-1 rounded mr-2 mb-2">{elem}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const CompetitorsTab = () => (
    <div className="space-y-6 pb-8">
      {apps.map((app, idx) => {
        const competitors = app.analysis?.competitors || {};
        return (
          <div key={idx} className="card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{app.name}</h3>
            <p className="text-sm text-slate-600 mb-6">{competitors.competitiveLandscape}</p>
            <div className="space-y-4">
              {(competitors.analysed || []).map((comp, i) => (
                <div key={i} className="border border-surface-200 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-800">{comp.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{comp.platform === 'ios' ? '🍎 App Store' : '🤖 Google Play'}</p>
                    </div>
                    <ScoreBadge score={comp.overallScore || 0} />
                  </div>
                  <p className="text-sm text-slate-700 mb-4">{comp.positioning}</p>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {Object.entries(comp.dimensionScores || {}).map(([dim, score]) => (
                      <div key={dim} className="text-center">
                        <div className="text-lg font-bold text-brand-600">{score}</div>
                        <p className="text-xs text-slate-600 capitalize">{dim.replace(/([A-Z])/g, ' $1')}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-600"><strong>Strengths:</strong> {(comp.strengths || []).join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const InsightsTab = () => (
    <div className="space-y-6 pb-8">
      {apps.map((app, idx) => {
        const insights = app.analysis?.insights || {};
        return (
          <div key={idx} className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">{app.name}</h3>
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-4">🎯 Top Recommendations</h4>
              <div className="space-y-3">
                {(insights.topRecommendations || []).map((rec, i) => {
                  const color = rec.priority === 'CRITICAL' ? 'border-red-300 bg-red-50' : rec.priority === 'HIGH' ? 'border-orange-300 bg-orange-50' : 'border-yellow-300 bg-yellow-50';
                  return (
                    <div key={i} className={`card border-l-4 ${color} p-4`}>
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-1 text-xs font-bold rounded bg-slate-200 text-slate-700">{rec.priority}</span>
                        <div className="flex-1">
                          <h5 className="font-semibold text-slate-800">{rec.title}</h5>
                          <p className="text-sm text-slate-700 mt-2">{rec.description}</p>
                          <div className="mt-3 space-y-1">{(rec.actionItems || []).map((a, j) => <p key={j} className="text-xs text-slate-600">• {a}</p>)}</div>
                          <p className="text-xs text-slate-600 mt-2 italic"><strong>Impact:</strong> {rec.expectedImpact}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card p-4">
              <h4 className="text-sm font-bold text-slate-800 mb-4">📊 Keyword Analysis</h4>
              <div className="space-y-4">
                {['current', 'missed', 'suggested'].map((section) => (
                  <div key={section}>
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      {section === 'current' ? 'Current Keywords' : section === 'missed' ? 'Missed Opportunities' : 'Suggested Keywords'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(insights.keywordAnalysis?.[section] || []).map((kw, j) => (
                        <span key={j} className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                          {typeof kw === 'string' ? kw : kw.keyword}
                          {kw.difficulty && <span className="ml-1 text-slate-500">({kw.difficulty})</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {insights.roadmapActions && (
              <div className="card p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-4">📅 Action Roadmap</h4>
                <div className="grid grid-cols-3 gap-4">
                  {['week1', 'month1', 'quarter1'].map((period) => (
                    <div key={period} className="bg-slate-50 rounded-lg p-3">
                      <h5 className="text-xs font-bold text-slate-800 mb-2">{period === 'week1' ? 'Week 1' : period === 'month1' ? 'Month 1' : 'Quarter 1'}</h5>
                      <ul className="space-y-2">
                        {(insights.roadmapActions?.[period] || []).map((item, i) => <li key={i} className="text-xs text-slate-700">• {item.action}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4 border-l-4 border-green-400">
                <h4 className="text-sm font-bold text-green-700 mb-3">✓ Opportunities</h4>
                <ul className="space-y-2">
                  {(insights.whitespaceOpportunities || []).map((opp, i) => (
                    <li key={i} className="text-xs text-slate-700"><strong>{opp.title}</strong><p className="text-slate-600 mt-1">{opp.description}</p></li>
                  ))}
                </ul>
              </div>
              <div className="card p-4 border-l-4 border-red-400">
                <h4 className="text-sm font-bold text-red-700 mb-3">⚠ Patterns to Avoid</h4>
                <ul className="space-y-2">
                  {(insights.oversusedPatterns || []).map((p, i) => (
                    <li key={i} className="text-xs text-slate-700"><strong>{p.pattern}</strong><p className="text-slate-600 mt-1">{p.reason}</p></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'appText': return <AppTextTab />;
      case 'creativeScoring': return <CreativeScoringTab />;
      case 'screenshots': return <ScreenshotsTab />;
      case 'competitors': return <CompetitorsTab />;
      case 'insights': return <InsightsTab />;
      default: return <OverviewTab />;
    }
  };

  // ✅ FIXED: Removed fixed inset-0 modal wrapper - now renders inline
  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="bg-white border border-surface-200 rounded-xl shadow-card mb-6">
        <div className="flex gap-1 overflow-x-auto px-4 pt-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-brand-600 text-brand-600 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {renderTab()}
      </div>
    </div>
  );
}
