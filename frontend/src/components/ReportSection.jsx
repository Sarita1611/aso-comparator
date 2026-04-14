import { useState } from 'react';
import { BarChart3, FileText, Zap, Image, Users, Lightbulb, Download } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'appText', label: 'App Text', icon: FileText },
  { id: 'creativeScoring', label: 'Creative Scoring', icon: Zap },
  { id: 'screenshots', label: 'Screenshots', icon: Image },
  { id: 'competitors', label: 'Competitors', icon: Users },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
];

export default function ReportSection({ report, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const apps = report?.apps || [];

  if (!report) return null;

  // Helper function to render score badges
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

  // OVERVIEW TAB
  const OverviewTab = () => (
    <div className="space-y-6 pb-8">
      {apps.map((app, idx) => {
        const analysis = app.analysis || {};
        const overview = analysis.overview || {};

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
                <div className="text-3xl font-bold text-brand-600">{overview.influenceStrength || 74}</div>
                <p className="text-xs text-slate-500">/100 Influence</p>
              </div>
            </div>

            {/* Dimension Scores */}
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

            {/* Summary & Key Points */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-700">{overview.summary}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-green-700 mb-3">✓ Key Strengths</h4>
                <ul className="space-y-2">
                  {(overview.keyStrengths || []).map((strength, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-700 mb-3">✗ Key Weaknesses</h4>
                <ul className="space-y-2">
                  {(overview.keyWeaknesses || []).map((weakness, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // APP TEXT TAB
  const AppTextTab = () => (
    <div className="space-y-6 pb-8">
      {apps.map((app, idx) => {
        const appText = app.analysis?.appText || {};
        return (
          <div key={idx} className="card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{app.name}</h3>
            
            {/* Overall Assessment */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-slate-800">Overall Text Score</h4>
                <ScoreBadge score={appText.overallTextScore || 0} maxScore={10} />
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{appText.strategicAssessment}</p>
            </div>

            {/* Title, Subtitle, Description */}
            {['title', 'subtitle', 'description'].map((section) => {
              const data = appText[section] || {};
              const maxChars = section === 'title' ? 30 : section === 'subtitle' ? 30 : 4000;
              
              return (
                <div key={section} className="mb-6 border border-surface-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-slate-800 capitalize">{section}</h4>
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={data.score || 0} maxScore={10} size="sm" />
                      <span className="text-xs text-slate-500">{data.length} chars</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded mb-3 border-l-4 border-brand-400">
                    <p className="text-sm font-mono text-slate-700">"{data.currentValue || 'N/A'}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-slate-700 mb-2">Strengths</p>
                      <ul className="space-y-1">
                        {(data.strengths || []).map((s, i) => (
                          <li key={i} className="text-slate-600">✓ {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 mb-2">Suggestions</p>
                      <ul className="space-y-1">
                        {(data.suggestions || []).map((s, i) => (
                          <li key={i} className="text-slate-600">→ {s}</li>
                        ))}
                      </ul>
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

  // CREATIVE SCORING TAB
  const CreativeScoringTab = () => (
    <div className="space-y-6 pb-8">
      {apps.map((app, idx) => {
        const creative = app.analysis?.creativeScoring || {};
        const radar = creative.categoryRadar || {};

        return (
          <div key={idx} className="card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">{app.name}</h3>

            {/* Radar Chart (text representation for now) */}
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
                      <div 
                        className="bg-brand-600 h-2 rounded-full" 
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h4 className="font-semibold text-slate-800 mb-4">Conversion Funnel Coverage</h4>
              <div className="grid grid-cols-4 gap-3">
                {['hook', 'features', 'socialProof', 'cta'].map((stage) => {
                  const hasCoverage = creative.conversionFunnelCoverage?.[stage] || false;
                  return (
                    <div 
                      key={stage}
                      className={`p-4 rounded-lg text-center text-sm font-semibold capitalize ${
                        hasCoverage 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {hasCoverage ? '✓' : '✗'} {stage}
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

  // SCREENSHOTS TAB
  const ScreenshotsTab = () => (
    <div className="space-y-6 pb-8">
      {apps.map((app, idx) => {
        const screenshots = app.analysis?.screenshots || {};
        
        return (
          <div key={idx} className="card p-6">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-surface-200">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{app.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{screenshots.count || 0} screenshots uploaded</p>
              </div>
            </div>

            <p className="text-sm text-slate-700 mb-6">{screenshots.analysisNote}</p>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-bold text-green-700 mb-3">✓ Strengths</h4>
                <ul className="space-y-2">
                  {(screenshots.strengths || []).map((s, i) => (
                    <li key={i} className="text-xs text-slate-600">• {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-700 mb-3">✗ Weaknesses</h4>
                <ul className="space-y-2">
                  {(screenshots.weaknesses || []).map((w, i) => (
                    <li key={i} className="text-xs text-slate-600">• {w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Screen Analysis */}
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
                      <span key={j} className="inline-block bg-slate-100 px-2 py-1 rounded mr-2 mb-2">
                        {elem}
                      </span>
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

  // COMPETITORS TAB
  const CompetitorsTab = () => (
    <div className="space-y-6 pb-8">
      {apps.map((app, idx) => {
        const competitors = app.analysis?.competitors || {};
        
        return (
          <div key={idx} className="card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{app.name}</h3>
            <p className="text-sm text-slate-600 mb-6">{competitors.competitiveLandscape}</p>

            {/* Competitor Cards */}
            <div className="space-y-4">
              {(competitors.analysed || []).map((comp, i) => (
                <div key={i} className="border border-surface-200 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-800">{comp.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {comp.platform === 'ios' ? '🍎 App Store' : '🤖 Google Play'}
                      </p>
                    </div>
                    <ScoreBadge score={comp.overallScore || 0} />
                  </div>

                  <p className="text-sm text-slate-700 mb-4">{comp.positioning}</p>

                  {/* Dimension Scores */}
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {Object.entries(comp.dimensionScores || {}).map(([dimension, score]) => (
                      <div key={dimension} className="text-center">
                        <div className="text-lg font-bold text-brand-600">{score}</div>
                        <p className="text-xs text-slate-600 capitalize">{dimension.replace(/([A-Z])/g, ' $1')}</p>
                      </div>
                    ))}
                  </div>

                  {/* Strengths */}
                  <div className="text-xs text-slate-600">
                    <strong>Strengths:</strong> {(comp.strengths || []).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // INSIGHTS TAB
  const InsightsTab = () => (
    <div className="space-y-6 pb-8">
      {apps.map((app, idx) => {
        const insights = app.analysis?.insights || {};
        
        return (
          <div key={idx} className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">{app.name}</h3>

            {/* Top Recommendations */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-4">🎯 Top Recommendations</h4>
              <div className="space-y-3">
                {(insights.topRecommendations || []).map((rec, i) => {
                  const priorityColor = 
                    rec.priority === 'CRITICAL' ? 'border-red-300 bg-red-50' :
                    rec.priority === 'HIGH' ? 'border-orange-300 bg-orange-50' :
                    'border-yellow-300 bg-yellow-50';

                  return (
                    <div key={i} className={`card border-l-4 ${priorityColor} p-4`}>
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-1 text-xs font-bold rounded bg-slate-200 text-slate-700">
                          {rec.priority}
                        </span>
                        <div className="flex-1">
                          <h5 className="font-semibold text-slate-800">{rec.title}</h5>
                          <p className="text-sm text-slate-700 mt-2">{rec.description}</p>
                          <div className="mt-3 space-y-1">
                            {(rec.actionItems || []).map((action, j) => (
                              <p key={j} className="text-xs text-slate-600">• {action}</p>
                            ))}
                          </div>
                          <p className="text-xs text-slate-600 mt-2 italic">
                            <strong>Impact:</strong> {rec.expectedImpact}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Keyword Analysis */}
            <div className="card p-4">
              <h4 className="text-sm font-bold text-slate-800 mb-4">📊 Keyword Analysis</h4>
              <div className="space-y-4">
                {['current', 'missed', 'suggested'].map((section) => (
                  <div key={section}>
                    <p className="text-xs font-semibold text-slate-700 mb-2 capitalize">
                      {section === 'current' ? 'Current Keywords' : section === 'missed' ? 'Missed Opportunities' : 'Suggested Keywords'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(insights.keywordAnalysis?.[section] || []).map((keyword, j) => (
                        <span 
                          key={j}
                          className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs"
                        >
                          {typeof keyword === 'string' ? keyword : keyword.keyword}
                          {keyword.difficulty && <span className="ml-1 text-slate-500">({keyword.difficulty})</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            {insights.roadmapActions && (
              <div className="card p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-4">📅 Action Roadmap</h4>
                <div className="grid grid-cols-3 gap-4">
                  {['week1', 'month1', 'quarter1'].map((period) => {
                    const label = period === 'week1' ? 'Week 1' : period === 'month1' ? 'Month 1' : 'Quarter 1';
                    return (
                      <div key={period} className="bg-slate-50 rounded-lg p-3">
                        <h5 className="text-xs font-bold text-slate-800 mb-2">{label}</h5>
                        <ul className="space-y-2">
                          {(insights.roadmapActions?.[period] || []).map((item, i) => (
                            <li key={i} className="text-xs text-slate-700">
                              • {item.action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Opportunities & Threats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4 border-l-4 border-green-400">
                <h4 className="text-sm font-bold text-green-700 mb-3">✓ Opportunities</h4>
                <ul className="space-y-2">
                  {(insights.whitespaceOpportunities || []).map((opp, i) => (
                    <li key={i} className="text-xs text-slate-700">
                      <strong>{opp.title}</strong>
                      <p className="text-slate-600 mt-1">{opp.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-4 border-l-4 border-red-400">
                <h4 className="text-sm font-bold text-red-700 mb-3">⚠ Patterns to Avoid</h4>
                <ul className="space-y-2">
                  {(insights.oversusedPatterns || []).map((pattern, i) => (
                    <li key={i} className="text-xs text-slate-700">
                      <strong>{pattern.pattern}</strong>
                      <p className="text-slate-600 mt-1">{pattern.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render active tab
  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'appText':
        return <AppTextTab />;
      case 'creativeScoring':
        return <CreativeScoringTab />;
      case 'screenshots':
        return <ScreenshotsTab />;
      case 'competitors':
        return <CompetitorsTab />;
      case 'insights':
        return <InsightsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen w-full bg-surface-50">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-surface-200 shadow-sm z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-800">ASO Comparison Report</h2>
              <button 
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b border-surface-200 overflow-x-auto">
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
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
