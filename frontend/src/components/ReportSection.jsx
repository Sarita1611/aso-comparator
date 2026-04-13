import { useState } from 'react';
import {
  Trophy, TrendingUp, ChevronDown, ChevronUp,
  BarChart2, Key, Map, Smartphone, AlertCircle,
  CheckCircle, XCircle, Lightbulb, ArrowRight, Globe
} from 'lucide-react';
import ScoreRing, { PillarScoreBar } from './ScoreCard';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const PILLAR_LABELS = {
  title: 'Title',
  subtitle: 'Subtitle / Short Description',
  description: 'Description',
  visuals: 'Visual Assets',
  ratings: 'Ratings & Reviews',
  updates: 'Update Frequency',
  category: 'Category',
};

const PILLAR_WEIGHTS = {
  title: 20, subtitle: 15, description: 20,
  visuals: 15, ratings: 15, updates: 10, category: 10,
};

function PlatformBadge({ platform }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
      platform === 'ios'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-green-50 text-green-700 border-green-200'
    }`}>
      <Smartphone size={11} />
      {platform === 'ios' ? 'App Store' : 'Google Play'}
    </span>
  );
}

function ScorePill({ score, max = 10 }) {
  const pct = (score / max) * 100;
  const color = pct >= 70 ? 'bg-green-100 text-green-800 border-green-200'
    : pct >= 50 ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-red-100 text-red-800 border-red-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border font-display font-bold text-sm ${color}`}>
      {score}/{max}
    </span>
  );
}

function CharBar({ count, max, label }) {
  const pct = Math.min((count / max) * 100, 100);
  const isGood = pct >= 70 && pct <= 100;
  const isWarn = pct > 0 && pct < 70;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className={`font-mono font-semibold ${isGood ? 'text-green-700' : isWarn ? 'text-amber-700' : count === 0 ? 'text-red-600' : 'text-slate-600'}`}>
          {count}/{max}
        </span>
      </div>
      <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isGood ? 'bg-green-500' : isWarn ? 'bg-amber-500' : count === 0 ? 'bg-red-400' : 'bg-brand-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PillarCard({ pillarKey, pillar }) {
  const score = pillar?.score ?? 0;
  const pct = (score / 10) * 100;
  const borderColor = pct >= 70 ? 'border-green-200 bg-green-50'
    : pct >= 50 ? 'border-amber-200 bg-amber-50'
    : 'border-red-200 bg-red-50';

  return (
    <div className={`p-4 rounded-xl border ${borderColor} space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{PILLAR_LABELS[pillarKey]}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">weight: {PILLAR_WEIGHTS[pillarKey]}%</span>
          <ScorePill score={score} />
        </div>
      </div>

      {/* Contextual data for title/subtitle */}
      {(pillarKey === 'title' || pillarKey === 'subtitle') && pillar?.currentValue && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-surface-200">
            <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">Current:</span>
            <span className="text-xs font-mono text-slate-700 break-all">
              {pillar.currentValue === 'MISSING' || !pillar.currentValue ? (
                <span className="text-red-500 italic">Not set</span>
              ) : `"${pillar.currentValue}"`}
            </span>
          </div>
          {pillar.charCount !== undefined && (
            <CharBar
              count={pillar.charCount}
              max={pillar.maxChars || (pillarKey === 'title' ? 30 : 30)}
              label="Character usage"
            />
          )}
        </div>
      )}

      {/* Description specific data */}
      {pillarKey === 'description' && (
        <div className="space-y-2">
          {pillar?.charCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Length:</span>
              <span className="text-xs font-mono font-semibold text-slate-700">{pillar.charCount.toLocaleString()} chars</span>
              <span className={`text-xs ${pillar.charCount >= 2000 ? 'text-green-600' : pillar.charCount >= 1000 ? 'text-amber-600' : 'text-red-600'}`}>
                {pillar.charCount >= 2000 ? 'Good length' : pillar.charCount >= 1000 ? 'Could be longer' : 'Too short'}
              </span>
            </div>
          )}
          {pillar?.openingLine && (
            <div className="p-2.5 bg-white rounded-lg border border-surface-200">
              <p className="text-xs text-slate-400 mb-1">Opening line:</p>
              <p className="text-xs text-slate-700 italic">"{pillar.openingLine}"</p>
            </div>
          )}
          {pillar?.keywordDensity && (
            <p className="text-xs text-slate-500 font-mono">{pillar.keywordDensity}</p>
          )}
        </div>
      )}

      {/* Visuals specific data */}
      {pillarKey === 'visuals' && (
        <div className="space-y-1.5">
          <CharBar
            count={pillar?.screenshotCount || 0}
            max={pillar?.maxScreenshots || 10}
            label="Screenshots uploaded"
          />
          {pillar?.hasVideo !== undefined && (
            <p className="text-xs text-slate-500">
              Preview video: <span className={pillar.hasVideo ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>{pillar.hasVideo ? 'Yes' : 'No'}</span>
            </p>
          )}
        </div>
      )}

      {/* Ratings specific data */}
      {pillarKey === 'ratings' && (
        <div className="flex items-center gap-4">
          {pillar?.currentRating && (
            <div className="text-center">
              <p className="font-display font-bold text-2xl text-slate-800">{pillar.currentRating}</p>
              <p className="text-xs text-slate-400">rating</p>
            </div>
          )}
          {pillar?.totalReviews && (
            <div className="text-center">
              <p className="font-display font-bold text-lg text-slate-800">{pillar.totalReviews.toLocaleString()}</p>
              <p className="text-xs text-slate-400">reviews</p>
            </div>
          )}
        </div>
      )}

      {/* Updates specific data */}
      {pillarKey === 'updates' && pillar?.daysSinceUpdate !== undefined && (
        <div className="flex items-center gap-2">
          <span className={`font-display font-bold text-lg ${pillar.daysSinceUpdate <= 30 ? 'text-green-700' : pillar.daysSinceUpdate <= 60 ? 'text-amber-700' : 'text-red-700'}`}>
            {pillar.daysSinceUpdate} days
          </span>
          <span className="text-xs text-slate-500">since last update ({pillar.lastUpdated})</span>
        </div>
      )}

      {/* Analysis */}
      <p className="text-xs text-slate-600 leading-relaxed">{pillar?.analysis}</p>

      {/* Recommendation */}
      {pillar?.recommendation && (
        <div className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-surface-200">
          <ArrowRight size={12} className="text-brand-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-brand-700 font-medium leading-relaxed">{pillar.recommendation}</p>
        </div>
      )}
    </div>
  );
}

function AppDetailCard({ appReport, appInfo, rank }) {
  const [expanded, setExpanded] = useState(rank === 1);
  const [activeTab, setActiveTab] = useState('analysis');

  const radarData = Object.entries(appReport.pillars || {}).map(([key, val]) => ({
    pillar: PILLAR_LABELS[key]?.split('/')[0].trim() || key,
    score: (val?.score || 0) * 10,
    fullMark: 100,
  }));

  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: BarChart2 },
    { id: 'keywords', label: 'Keywords', icon: Key },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
  ];

  const rankLabels = ['1st', '2nd', '3rd', '4th'];

  return (
    <div className={`card overflow-hidden ${rank === 1 ? 'ring-2 ring-brand-500 ring-offset-1' : ''}`}>
      <div className="p-6 border-b border-surface-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {appInfo?.icon ? (
              <img src={appInfo.icon} alt={appReport.name} className="w-14 h-14 rounded-2xl shadow-sm flex-shrink-0 object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                <Smartphone size={22} className="text-slate-400" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400 bg-surface-100 border border-surface-200 rounded-md px-1.5 py-0.5">
                  {rankLabels[rank - 1] || `${rank}th`}
                </span>
                <h3 className="font-display font-bold text-lg text-slate-800">{appReport.name}</h3>
                {rank === 1 && (
                  <span className="text-xs font-semibold text-brand-700 bg-brand-100 border border-brand-200 rounded-md px-2 py-0.5">
                    Top Ranked
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <PlatformBadge platform={appReport.platform} />
                {appInfo?.category && (
                  <span className="text-xs text-slate-500 bg-surface-100 border border-surface-200 rounded-md px-2 py-0.5">
                    {appInfo.category}
                  </span>
                )}
                {appInfo?.country && (
                  <span className="text-xs text-slate-400 bg-surface-50 border border-surface-200 rounded-md px-2 py-0.5">
                    {appInfo.country.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ScoreRing score={appReport.overallScore} size={76} grade={appReport.grade} />
        </div>

        {/* Pillar summary row */}
        <div className="mt-5 grid grid-cols-7 gap-1.5">
          {Object.entries(appReport.pillars || {}).map(([key, val]) => {
            const s = val?.score || 0;
            const color = s >= 7 ? 'text-green-700 bg-green-50 border-green-200'
              : s >= 5 ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-red-700 bg-red-50 border-red-200';
            return (
              <div key={key} className={`text-center p-1.5 rounded-lg border ${color}`}>
                <p className="font-display font-bold text-sm">{s}</p>
                <p className="text-[9px] leading-tight mt-0.5 opacity-70">{PILLAR_LABELS[key]?.split('/')[0]}</p>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-3 flex items-center justify-between text-sm font-medium text-slate-500 hover:bg-surface-50 transition-colors"
      >
        <span>{expanded ? 'Collapse' : 'View full analysis'}</span>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {expanded && (
        <div className="border-t border-surface-100 animate-fade-in">
          <div className="flex border-b border-surface-100 bg-surface-50">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ANALYSIS TAB */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                {/* Radar + bar scores */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Score Breakdown</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 9, fill: '#64748b' }} />
                        <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                        <Tooltip formatter={(v) => [`${v / 10}/10`, 'Score']} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Weighted Scores</p>
                    <div className="space-y-3">
                      {Object.entries(appReport.pillars || {}).map(([key, val]) => (
                        <PillarScoreBar key={key} label={`${PILLAR_LABELS[key]} (${PILLAR_WEIGHTS[key]}%)`} score={val?.score || 0} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Per-pillar deep dive */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Pillar Detail</p>
                  <div className="space-y-3">
                    {Object.entries(appReport.pillars || {}).map(([key, val]) => (
                      <PillarCard key={key} pillarKey={key} pillar={val} />
                    ))}
                  </div>
                </div>

                {/* Strengths & weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-1.5">
                      <CheckCircle size={14} /> What's working
                    </p>
                    <ul className="space-y-2">
                      {(appReport.strengths || []).map((s, i) => (
                        <li key={i} className="text-xs text-green-700 leading-relaxed flex items-start gap-2">
                          <span className="flex-shrink-0 mt-0.5 font-bold">{i + 1}.</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-1.5">
                      <XCircle size={14} /> What needs fixing
                    </p>
                    <ul className="space-y-2">
                      {(appReport.weaknesses || []).map((w, i) => (
                        <li key={i} className="text-xs text-red-700 leading-relaxed flex items-start gap-2">
                          <span className="flex-shrink-0 mt-0.5 font-bold">{i + 1}.</span>{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Quick wins + long term */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
                    <p className="text-sm font-semibold text-brand-800 mb-3 flex items-center gap-1.5">
                      <Lightbulb size={14} /> Do this week
                    </p>
                    <ul className="space-y-2">
                      {(appReport.quickWins || []).map((w, i) => (
                        <li key={i} className="text-xs text-brand-700 leading-relaxed flex items-start gap-2">
                          <span className="flex-shrink-0 mt-0.5 font-bold">{i + 1}.</span>{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                      <TrendingUp size={14} /> Strategic fixes
                    </p>
                    <ul className="space-y-2">
                      {(appReport.longTermFixes || []).map((f, i) => (
                        <li key={i} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                          <span className="flex-shrink-0 mt-0.5 font-bold">{i + 1}.</span>{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {appReport.estimatedImpact && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-1.5">
                      <TrendingUp size={14} /> Estimated impact if fixes are applied
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed">{appReport.estimatedImpact}</p>
                  </div>
                )}
              </div>
            )}

            {/* KEYWORDS TAB */}
            {activeTab === 'keywords' && appReport.keywordAnalysis && (
              <div className="space-y-6">
                {appReport.keywordAnalysis.currentKeywords?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Currently targeting</p>
                    <div className="flex flex-wrap gap-2">
                      {appReport.keywordAnalysis.currentKeywords.map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-medium font-mono">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {appReport.keywordAnalysis.missedOpportunities?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-1.5">
                      <AlertCircle size={13} /> Missing from title/subtitle
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {appReport.keywordAnalysis.missedOpportunities.map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium font-mono">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {appReport.keywordAnalysis.suggestedKeywords?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Suggested keywords to add</p>
                    <div className="space-y-2">
                      {appReport.keywordAnalysis.suggestedKeywords.map((kw, i) => (
                        <div key={i} className="p-3 bg-surface-50 rounded-xl border border-surface-100">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-mono font-semibold text-sm text-slate-800">{kw.keyword}</span>
                            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                              kw.difficulty === 'Low' ? 'bg-green-100 text-green-700 border-green-200' :
                              kw.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                              'bg-red-100 text-red-700 border-red-200'
                            }`}>{kw.difficulty} difficulty</span>
                            {kw.whereToPut && (
                              <span className="text-xs px-2 py-0.5 rounded border bg-brand-50 text-brand-700 border-brand-200 font-medium">
                                Add to: {kw.whereToPut}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{kw.reason}</p>
                          {kw.intent && <p className="text-xs text-slate-400 mt-0.5">User intent: {kw.intent}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {appReport.keywordAnalysis.keywordDensityIssues && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-sm font-semibold text-amber-800 mb-1">Keyword density assessment</p>
                    <p className="text-xs text-amber-700 leading-relaxed font-mono">{appReport.keywordAnalysis.keywordDensityIssues}</p>
                  </div>
                )}
              </div>
            )}

            {/* ROADMAP TAB */}
            {activeTab === 'roadmap' && appReport.improvementRoadmap && (
              <div className="space-y-4">
                {[
                  { key: 'week1', label: 'Week 1', sub: 'Highest-impact, fastest changes', color: 'brand' },
                  { key: 'month1', label: 'Month 1', sub: 'Requires more time or resources', color: 'amber' },
                  { key: 'quarter1', label: 'Quarter 1', sub: 'Strategic changes with long-term payoff', color: 'green' },
                ].map(phase => (
                  <div key={phase.key} className={`p-4 rounded-xl border ${
                    phase.color === 'brand' ? 'bg-brand-50 border-brand-100' :
                    phase.color === 'amber' ? 'bg-amber-50 border-amber-100' :
                    'bg-green-50 border-green-100'
                  }`}>
                    <div className="mb-3">
                      <p className={`text-sm font-bold ${
                        phase.color === 'brand' ? 'text-brand-800' :
                        phase.color === 'amber' ? 'text-amber-800' : 'text-green-800'
                      }`}>{phase.label}</p>
                      <p className={`text-xs ${
                        phase.color === 'brand' ? 'text-brand-600' :
                        phase.color === 'amber' ? 'text-amber-600' : 'text-green-600'
                      }`}>{phase.sub}</p>
                    </div>
                    <ul className="space-y-2">
                      {(appReport.improvementRoadmap[phase.key] || []).map((action, i) => (
                        <li key={i} className={`flex items-start gap-2 text-xs leading-relaxed ${
                          phase.color === 'brand' ? 'text-brand-700' :
                          phase.color === 'amber' ? 'text-amber-700' : 'text-green-700'
                        }`}>
                          <span className="font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportSection({ report, apps, country }) {
  if (!report) return null;
  const { apps: appReports, leaderboard, winner, winnerReason, competitiveInsights,
    marketOpportunities, executiveSummary, competitorGapAnalysis, market } = report;

  return (
    <div id="aso-report" className="space-y-8">
      {/* Executive Summary */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-display font-bold text-xl text-slate-800">Summary</h2>
          {market && (
            <span className="text-xs text-slate-500 bg-surface-100 border border-surface-200 rounded-md px-2 py-0.5 flex items-center gap-1">
              <Globe size={11} /> {market}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{executiveSummary}</p>
      </div>

      {/* Leaderboard */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-xl text-slate-800 mb-5 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" /> Leaderboard
        </h2>
        <div className="space-y-3">
          {(leaderboard || []).map((entry, i) => {
            const appInfo = apps?.find(a => a.name === entry.name || a.title === entry.name);
            const rankNum = ['1st', '2nd', '3rd', '4th'];
            return (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${i === 0 ? 'bg-brand-50 border-brand-200' : 'bg-surface-50 border-surface-100'}`}>
                <span className={`text-sm font-bold w-8 text-center flex-shrink-0 ${i === 0 ? 'text-brand-700' : 'text-slate-500'}`}>
                  {rankNum[i]}
                </span>
                {appInfo?.icon && (
                  <img src={appInfo.icon} alt={entry.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-display font-semibold text-slate-800 text-sm">{entry.name}</p>
                    {appInfo?.platform && <PlatformBadge platform={appInfo.platform} />}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{entry.reason}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-display font-bold text-xl ${i === 0 ? 'text-brand-600' : 'text-slate-700'}`}>{entry.score}</p>
                  <p className="text-[10px] text-slate-400">/100</p>
                </div>
              </div>
            );
          })}
        </div>
        {winner && winnerReason && (
          <div className="mt-4 p-4 bg-brand-50 rounded-xl border border-brand-200">
            <p className="text-sm font-semibold text-brand-800 mb-1">Why {winner} ranks first</p>
            <p className="text-xs text-brand-700 leading-relaxed">{winnerReason}</p>
          </div>
        )}
      </div>

      {/* Individual app reports */}
      <div>
        <h2 className="font-display font-bold text-xl text-slate-800 mb-4">App-by-App Analysis</h2>
        <div className="space-y-4 animate-stagger">
          {(appReports || [])
            .sort((a, b) => b.overallScore - a.overallScore)
            .map((appReport, i) => {
              const appInfo = apps?.find(a => a.name === appReport.name || a.title === appReport.name);
              return <AppDetailCard key={i} appReport={appReport} appInfo={appInfo} rank={i + 1} />;
            })}
        </div>
      </div>

      {/* Competitor gap analysis */}
      {competitorGapAnalysis && apps?.length > 1 && (
        <div className="card p-6">
          <h2 className="font-display font-bold text-xl text-slate-800 mb-5">Keyword Gap Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {competitorGapAnalysis.sharedKeywords?.length > 0 && (
              <div className="p-4 bg-surface-50 rounded-xl border border-surface-100">
                <p className="text-sm font-semibold text-slate-700 mb-3">Keywords all apps target</p>
                <div className="flex flex-wrap gap-1.5">
                  {competitorGapAnalysis.sharedKeywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-surface-200 rounded-md text-xs text-slate-600 font-mono">{kw}</span>
                  ))}
                </div>
              </div>
            )}
            {competitorGapAnalysis.uniqueKeywords?.length > 0 && (
              <div className="p-4 bg-surface-50 rounded-xl border border-surface-100">
                <p className="text-sm font-semibold text-slate-700 mb-3">Unique advantages by app</p>
                <div className="space-y-3">
                  {competitorGapAnalysis.uniqueKeywords.map((item, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold text-slate-600 mb-1.5">{item.app}</p>
                      <div className="flex flex-wrap gap-1">
                        {(item.exclusiveKeywords || []).map((kw, j) => (
                          <span key={j} className="px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-md text-xs font-mono">{kw}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {competitorGapAnalysis.gapOpportunities?.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">Untapped opportunities</p>
              <div className="space-y-2">
                {competitorGapAnalysis.gapOpportunities.map((gap, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono font-bold text-sm text-green-800">{gap.keyword}</span>
                        <span className={`text-xs font-medium ${
                          gap.estimatedVolume === 'High' ? 'text-green-700' :
                          gap.estimatedVolume === 'Medium' ? 'text-amber-700' : 'text-slate-500'
                        }`}>{gap.estimatedVolume} volume</span>
                      </div>
                      <p className="text-xs text-green-700 leading-relaxed">{gap.opportunity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(competitorGapAnalysis.visualStrategyGaps || competitorGapAnalysis.descriptionGaps) && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitorGapAnalysis.visualStrategyGaps && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs font-semibold text-amber-800 mb-1">Visual strategy gaps</p>
                  <p className="text-xs text-amber-700 leading-relaxed">{competitorGapAnalysis.visualStrategyGaps}</p>
                </div>
              )}
              {competitorGapAnalysis.descriptionGaps && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Description gaps</p>
                  <p className="text-xs text-blue-700 leading-relaxed">{competitorGapAnalysis.descriptionGaps}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Market insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitiveInsights && (
          <div className="card p-5">
            <p className="text-sm font-semibold text-slate-800 mb-2">Competitive patterns</p>
            <p className="text-xs text-slate-600 leading-relaxed">{competitiveInsights}</p>
          </div>
        )}
        {marketOpportunities && (
          <div className="card p-5">
            <p className="text-sm font-semibold text-slate-800 mb-2">
              {market ? `${market} market opportunities` : 'Market opportunities'}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">{marketOpportunities}</p>
          </div>
        )}
      </div>
    </div>
  );
}
