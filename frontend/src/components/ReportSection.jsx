import { useState } from 'react';
import { BarChart3, FileText, Zap, Image, Users, Lightbulb, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import ScoreRing, { PillarScoreBar } from './ScoreCard';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'appText', label: 'App Text', icon: FileText },
  { id: 'creativeScoring', label: 'Creative Scoring', icon: Zap },
  { id: 'screenshots', label: 'Screenshots', icon: Image },
  { id: 'competitors', label: 'Competitors', icon: Users },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
];

const PRIORITY_COLORS = {
  CRITICAL: 'bg-red-500/10 border-red-500/30 text-red-400',
  HIGH: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  MEDIUM: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  LOW: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

const IMPACT_COLORS = {
  HIGH: 'bg-red-500/20 text-red-400',
  MED: 'bg-yellow-500/20 text-yellow-400',
  LOW: 'bg-green-500/20 text-green-400',
};

function ScorePill({ score, max = 100 }) {
  const pct = (score / max) * 100;
  const color = pct >= 75 ? 'text-emerald-400' : pct >= 55 ? 'text-amber-400' : 'text-red-400';
  return (
    <span className={`font-bold tabular-nums ${color}`}>
      {score}<span className="text-slate-500 font-normal text-xs">/{max}</span>
    </span>
  );
}

function DeltaBadge({ delta }) {
  if (delta === undefined || delta === null) return null;
  if (delta > 0) return <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">+{delta}</span>;
  if (delta < 0) return <span className="text-xs font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{delta}</span>;
  return <span className="text-xs font-bold text-slate-500 bg-slate-500/10 px-1.5 py-0.5 rounded">0</span>;
}

function MiniBar({ score, max = 100 }) {
  const pct = Math.min((score / max) * 100, 100);
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 55 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-slate-200 rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-slate-500 w-6 text-right">{score}</span>
    </div>
  );
}

function SectionCard({ children, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function AppHeader({ app }) {
  const overview = app.analysis?.overview || {};
  return (
    <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-200">
      {app.icon && (
        <img src={app.icon} alt={app.name} className="w-14 h-14 rounded-2xl shadow-lg flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-bold text-slate-800 truncate">{app.name}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase tracking-wide">
            {app.country?.toUpperCase() || 'US'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{app.developer} · {app.category}</p>
        <p className="text-xs text-slate-500 mt-0.5">⭐ {app.rating} · {(app.ratingCount || 0).toLocaleString()} reviews</p>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-2xl font-bold text-slate-800">{overview.influenceStrength || overview.overallScore || 0}</div>
        <p className="text-xs text-slate-500">/ 100</p>
        <p className="text-xs text-slate-500 mt-0.5">INFLUENCE STRENGTH</p>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────

function OverviewTab({ apps }) {
  return (
    <div className="space-y-4 pb-8">
      {apps.map((app, idx) => {
        const ov = app.analysis?.overview || {};
        const cs = app.analysis?.creativeScoring || {};
        const quickWins = ov.quickWins || [];
        const weakest = ov.screenshotWeakestLink || {};
        const perf = ov.performanceSignals || {};
        const funnel = ov.funnelCoverage || {};

        const dims = [
          { label: 'Creative Strategy', score: cs.creativeStrategy?.total ?? ov.creativeStrategy ?? 0 },
          { label: 'Design & Visuals', score: cs.designVisuals?.total ?? ov.designVisuals ?? 0 },
          { label: 'Market Fit', score: cs.marketFit?.total ?? ov.marketFit ?? 0 },
          { label: 'Differentiation', score: cs.differentiation?.total ?? ov.differentiation ?? 0 },
          { label: 'Performance', score: cs.performance?.total ?? ov.performance ?? 0 },
        ];

        return (
          <div key={idx} className="space-y-4">
            <SectionCard>
              <AppHeader app={app} />

              {/* Dimension scores */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                {dims.map((d, i) => (
                  <div key={i} className="text-center">
                    <ScoreRing score={d.score} size={64} strokeWidth={5} />
                    <p className="text-xs text-slate-500 mt-2 leading-tight">{d.label}</p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              {ov.summary && (
                <p className="text-sm text-slate-700 leading-relaxed mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {ov.summary}
                </p>
              )}

              {/* Strengths / Weaknesses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Key Strengths</h4>
                  <ul className="space-y-1.5">
                    {(ov.keyStrengths || []).map((s, i) => (
                      <li key={i} className="text-xs text-slate-700 flex gap-2">
                        <span className="text-emerald-500 mt-0.5">✓</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Key Weaknesses</h4>
                  <ul className="space-y-1.5">
                    {(ov.keyWeaknesses || []).map((w, i) => (
                      <li key={i} className="text-xs text-slate-700 flex gap-2">
                        <span className="text-red-500 mt-0.5">✗</span><span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SectionCard>

            {/* Quick Wins + Screenshot Weakest Link */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <SectionCard>
                  <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-brand-400">⚡</span> Quick Wins This Week
                    <span className="text-xs text-slate-500 font-normal ml-1">Ranked by impact ÷ effort</span>
                  </h4>
                  <div className="space-y-3">
                    {quickWins.slice(0, 3).map((win, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${IMPACT_COLORS[win.impact] || IMPACT_COLORS.MED}`}>
                              {win.impact} IMPACT
                            </span>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${IMPACT_COLORS[win.effort] || IMPACT_COLORS.MED}`}>
                              {win.effort} EFFORT
                            </span>
                            {win.category && (
                              <span className="text-xs text-slate-500 uppercase tracking-wide">/ {win.category}</span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-800">{win.title}</p>
                          {win.description && (
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{win.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {quickWins.length === 0 && (
                      <p className="text-xs text-slate-500 italic">No quick wins data available.</p>
                    )}
                  </div>
                </SectionCard>
              </div>

              <div className="space-y-4">
                {/* Screenshot weakest link */}
                {weakest.screenNumber && (
                  <SectionCard>
                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
                      ⚠ Screenshot Weakest Link
                    </h4>
                    <div className="text-center mb-3">
                      <div className="text-3xl font-bold text-slate-800">#{weakest.screenNumber}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">CLARITY</p>
                        <p className="text-sm font-bold text-slate-800">{weakest.clarity}/10</p>
                      </div>
                      <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">STOP POWER</p>
                        <p className="text-sm font-bold text-slate-800">{weakest.stopPower}/10</p>
                      </div>
                    </div>
                    {weakest.suggestion && (
                      <>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Brief: Replace with</p>
                        <p className="text-xs text-slate-700">{weakest.suggestion}</p>
                      </>
                    )}
                  </SectionCard>
                )}

                {/* Funnel coverage */}
                <SectionCard>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Funnel Coverage</h4>
                  <div className="space-y-2">
                    {['hook', 'features', 'socialProof', 'cta'].map((stage) => (
                      <div key={stage} className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 capitalize">{stage === 'socialProof' ? 'Social proof' : stage === 'cta' ? 'CTA screen' : stage.charAt(0).toUpperCase() + stage.slice(1) + ' screen'}</span>
                        <span className={`text-xs font-bold ${funnel[stage] ? 'text-emerald-400' : 'text-red-400'}`}>
                          {funnel[stage] ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Performance signals */}
                {(perf.firstImpression || perf.conversionStrength || perf.dropOffRisk) && (
                  <SectionCard>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Performance Signals</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'First Impression', val: perf.firstImpression },
                        { label: 'Conversion Strength', val: perf.conversionStrength },
                        { label: 'Drop-off Risk', val: perf.dropOffRisk },
                      ].map((p, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">{p.label}</span>
                            <span className="font-bold text-slate-800">{p.val}/10</span>
                          </div>
                          <MiniBar score={(p.val || 0) * 10} />
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}
              </div>
            </div>

            {/* Competitive landscape preview */}
            {apps.length > 1 && (
              <SectionCard>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Competitive Landscape</h4>
                <div className="space-y-3">
                  {apps.map((a, ai) => {
                    const aov = a.analysis?.overview || {};
                    const score = aov.influenceStrength || aov.overallScore || 0;
                    const isYou = ai === idx;
                    return (
                      <div key={ai} className={`flex items-center gap-3 p-3 rounded-xl ${isYou ? 'bg-brand-500/10 border border-brand-500/30' : 'bg-slate-50'}`}>
                        {a.icon && <img src={a.icon} alt={a.name} className="w-8 h-8 rounded-xl flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{a.name} {isYou && <span className="text-brand-400 text-xs">(YOU)</span>}</p>
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full mt-1.5">
                            <div className="h-full rounded-full bg-brand-500" style={{ width: `${score}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-slate-800 flex-shrink-0">{score}</span>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── APP TEXT TAB ─────────────────────────────────────────────────────────────

function AppTextTab({ apps }) {
  const [kwInput, setKwInput] = useState('');

  return (
    <div className="space-y-4 pb-8">
      {apps.map((app, idx) => {
        const at = app.analysis?.appText || {};
        const desc = at.description || {};

        return (
          <div key={idx} className="space-y-4">
            <SectionCard>
              <AppHeader app={app} />

              {/* Scores row */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">OVERALL TEXT SCORE</p>
                  <p className="text-2xl font-bold text-slate-800">{at.overallTextScore || 0}<span className="text-slate-500 text-sm font-normal"> / 10</span></p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">UNIQUENESS</p>
                  <p className="text-2xl font-bold text-slate-800">{at.uniqueness || 0}<span className="text-slate-500 text-sm font-normal"> / 10</span></p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">DESC UTILIZATION</p>
                  <p className="text-2xl font-bold text-slate-800">{desc.utilization || '0%'}</p>
                </div>
              </div>

              {/* Strategic Assessment */}
              {at.strategicAssessment && (
                <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>✦</span> Strategic Assessment
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{at.strategicAssessment}</p>
                  {(at.industryBenchmarks || []).map((b, i) => (
                    <p key={i} className={`text-xs mt-2 pl-3 border-l-2 ${i % 2 === 0 ? 'border-amber-500 text-amber-300' : 'border-blue-500 text-blue-300'}`}>
                      {b}
                    </p>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Title + Subtitle */}
            <div className="grid grid-cols-2 gap-4">
              {['title', 'subtitle'].map((section) => {
                const d = at[section] || {};
                return (
                  <SectionCard key={section}>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{section}</span>
                        <span className="text-xs text-slate-500 ml-2">{app.platform === 'ios' ? 'App Store' : 'Play Store'}</span>
                      </div>
                      <div className="text-lg font-bold text-slate-800">{d.score || 0}<span className="text-slate-500 text-xs font-normal"> / 10</span></div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl mb-3 border-l-2 border-brand-500">
                      <p className="text-sm font-medium text-slate-800">{d.currentValue || (section === 'subtitle' ? 'Not set' : 'N/A')}</p>
                      <p className="text-xs text-slate-500 mt-1">{d.length || '0/30 chars'}</p>
                    </div>

                    {/* Utilization bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Character utilization</span>
                        <span>{d.utilization || '0%'}</span>
                      </div>
                      <div className="h-1 bg-slate-200 rounded-full">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: d.utilization || '0%' }}
                        />
                      </div>
                    </div>

                    {d.primaryKeywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {d.primaryKeywords.map((kw, i) => (
                          <span key={i} className="text-xs bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full">{kw}</span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3">
                      {d.strengths?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Strengths</p>
                          {d.strengths.map((s, i) => <p key={i} className="text-xs text-slate-700">✓ {s}</p>)}
                        </div>
                      )}
                      {d.weaknesses?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Weaknesses</p>
                          {d.weaknesses.map((w, i) => <p key={i} className="text-xs text-slate-700">✗ {w}</p>)}
                        </div>
                      )}
                      {d.suggestions?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Improvements</p>
                          {d.suggestions.map((s, i) => <p key={i} className="text-xs text-slate-700">› {s}</p>)}
                        </div>
                      )}
                    </div>
                  </SectionCard>
                );
              })}
            </div>

            {/* Description */}
            <SectionCard>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">App Description</span>
                  <span className="text-xs text-slate-500 ml-2">{app.platform === 'ios' ? 'App Store' : 'Play Store'}</span>
                </div>
                <div className="text-lg font-bold text-slate-800">{desc.score || 0}<span className="text-slate-500 text-xs font-normal"> / 10</span></div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: desc.utilization || '0%' }} />
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">{desc.length || '0/4000 chars'} · Density: {desc.keywordDensity || '0%'}</span>
              </div>

              {/* Flag indicators */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: 'Keyword in first fold', val: desc.hasKeywordInFirstFold },
                  { label: 'Structured formatting', val: desc.hasStructuredFormatting },
                  { label: 'Social proof', val: desc.hasSocialProof },
                  { label: 'CTA present', val: desc.hasCTA },
                ].map((flag, i) => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${flag.val ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {flag.val ? '✓' : '✗'} {flag.label}
                  </span>
                ))}
              </div>

              {desc.keywordsFound?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-xs text-slate-500">Keywords found:</span>
                  {desc.keywordsFound.map((kw, i) => (
                    <span key={i} className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{kw}</span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-emerald-400 uppercase tracking-wider mb-2">Strengths</p>
                  {(desc.strengths || []).map((s, i) => <p key={i} className="text-slate-700 mb-1">✓ {s}</p>)}
                </div>
                <div>
                  <p className="font-semibold text-red-400 uppercase tracking-wider mb-2">Weaknesses</p>
                  {(desc.weaknesses || []).map((w, i) => <p key={i} className="text-slate-700 mb-1">✗ {w}</p>)}
                </div>
                <div>
                  <p className="font-semibold text-amber-400 uppercase tracking-wider mb-2">Improvements</p>
                  {(desc.suggestions || []).map((s, i) => <p key={i} className="text-slate-700 mb-1">› {s}</p>)}
                </div>
              </div>
            </SectionCard>

            {/* Competitor Text Score Comparison */}
            {apps.length > 1 && (
              <SectionCard>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Competitor Text Score Comparison</h4>
                <p className="text-xs text-slate-500 mb-4">Title and subtitle scores across all analyzed apps</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 uppercase tracking-wider">
                        <th className="text-left pb-2 font-medium">App</th>
                        <th className="text-left pb-2 font-medium">Title</th>
                        <th className="text-center pb-2 font-medium">Score</th>
                        <th className="text-center pb-2 font-medium">Util.</th>
                        <th className="text-left pb-2 font-medium">Subtitle</th>
                        <th className="text-center pb-2 font-medium">Score</th>
                        <th className="text-center pb-2 font-medium">Overall</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {apps.map((a, ai) => {
                        const aat = a.analysis?.appText || {};
                        const isYou = ai === idx;
                        return (
                          <tr key={ai} className={isYou ? 'text-slate-800' : 'text-slate-500'}>
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                {a.icon && <img src={a.icon} alt="" className="w-6 h-6 rounded-lg" />}
                                <span className="truncate max-w-[100px]">{a.name}</span>
                                {isYou && <span className="text-brand-400 text-xs">(YOU)</span>}
                              </div>
                            </td>
                            <td className="py-2.5 max-w-[100px] truncate">{aat.title?.currentValue || '—'}</td>
                            <td className="py-2.5 text-center font-bold"><ScorePill score={aat.title?.score || 0} max={10} /></td>
                            <td className="py-2.5 text-center">{aat.title?.utilization || '—'}</td>
                            <td className="py-2.5 text-slate-500 italic">{aat.subtitle?.currentValue || '—'}</td>
                            <td className="py-2.5 text-center font-bold"><ScorePill score={aat.subtitle?.score || 0} max={10} /></td>
                            <td className="py-2.5 text-center font-bold"><ScorePill score={aat.overallTextScore || 0} max={10} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            )}

            {/* iOS Keyword Field Analyzer */}
            {app.platform === 'ios' && (
              <SectionCard>
                <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                  🔍 iOS Keyword Field Analyzer
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Paste your private keyword field (100 chars, comma-separated). This field is invisible to users but heavily weighted by the App Store algorithm.
                </p>
                <textarea
                  value={kwInput || at.keywordFieldSuggestion || ''}
                  onChange={e => setKwInput(e.target.value)}
                  placeholder="productivity,task,manager,planner,todo,reminder..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  rows={2}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-500">{(kwInput || at.keywordFieldSuggestion || '').length}/100</span>
                  {at.keywordFieldSuggestion && (
                    <p className="text-xs text-brand-400">↑ AI-suggested keywords pre-filled</p>
                  )}
                </div>
              </SectionCard>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── CREATIVE SCORING TAB ────────────────────────────────────────────────────

function CreativeScoringTab({ apps }) {
  return (
    <div className="space-y-4 pb-8">
      {/* Overall Score Ranking */}
      {apps.length > 1 && (
        <SectionCard>
          <h4 className="text-sm font-bold text-slate-800 mb-1">Overall Score Ranking</h4>
          <p className="text-xs text-slate-500 mb-4">Composite creative score per app, highest first</p>
          {[...apps].sort((a, b) => {
            const sa = a.analysis?.overview?.overallScore || 0;
            const sb = b.analysis?.overview?.overallScore || 0;
            return sb - sa;
          }).map((app, i) => {
            const score = app.analysis?.overview?.overallScore || app.analysis?.overview?.influenceStrength || 0;
            return (
              <div key={i} className="flex items-center gap-3 mb-3">
                {app.icon && <img src={app.icon} alt="" className="w-7 h-7 rounded-xl flex-shrink-0" />}
                <span className="text-xs text-slate-700 w-32 truncate flex-shrink-0">{app.name.split(':')[0]}</span>
                <div className="flex-1 h-2.5 bg-slate-200 rounded-full">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${score}%` }} />
                </div>
                <span className="text-sm font-bold text-slate-800 w-8 text-right flex-shrink-0">{score}</span>
              </div>
            );
          })}
        </SectionCard>
      )}

      {apps.map((app, idx) => {
        const cs = app.analysis?.creativeScoring || {};

        const sections = [
          {
            key: 'creativeStrategy', label: 'Creative Strategy',
            desc: 'Storytelling, hook strength, clarity, value prop, CTA',
            data: cs.creativeStrategy || {},
            subKeys: ['hookStrength', 'messageClarity', 'ctaEffectiveness', 'storytellingQuality', 'valuePropositionClarity'],
          },
          {
            key: 'designVisuals', label: 'Design & Visuals',
            desc: 'Consistency, color, human presence, UI balance, thumbnail',
            data: cs.designVisuals || {},
            subKeys: ['humanRelatability', 'visualConsistency', 'uiLifestyleBalance', 'thumbnailRecognition', 'colorStrategyEffectiveness'],
          },
          {
            key: 'marketFit', label: 'Market Fit',
            desc: 'Brand alignment, audience match, localisation, cultural fit',
            data: cs.marketFit || {},
            subKeys: ['audienceMatch', 'brandAlignment', 'culturalRelevance', 'localizationQuality'],
          },
          {
            key: 'differentiation', label: 'Differentiation',
            desc: 'Uniqueness, pattern repetition, positioning clarity',
            data: cs.differentiation || {},
            subKeys: ['patternRepetition', 'uniquenessVsCompetitors', 'distinctPositioning'],
          },
          {
            key: 'performance', label: 'Performance Heuristics',
            desc: 'Conversion likelihood, first impression, drop-off risk',
            data: cs.performance || {},
            subKeys: ['firstImpressionScore', 'screenshotDropOff', 'likelyConversionRate'],
          },
        ];

        const formatSubKey = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

        return (
          <div key={idx} className="space-y-4">
            <SectionCard>
              <AppHeader app={app} />
              {cs.creativeNarrative && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Creative Narrative</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{cs.creativeNarrative}</p>
                  {cs.dominantTone && (
                    <p className="text-xs text-slate-500 mt-2">Tone: <span className="text-slate-700">{cs.dominantTone}</span></p>
                  )}
                </div>
              )}

              {/* Dimension grid */}
              <div className="grid grid-cols-2 gap-4">
                {sections.map(({ key, label, desc, data, subKeys }) => (
                  <div key={key} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </div>
                      <div className="text-xl font-bold text-slate-800 flex-shrink-0 ml-2">{data.total || 0}<span className="text-slate-500 text-xs font-normal"> /100</span></div>
                    </div>
                    <div className="space-y-2">
                      {subKeys.map((sk) => (
                        data[sk] !== undefined && (
                          <PillarScoreBar key={sk} label={formatSubKey(sk)} score={data[sk]} maxScore={10} />
                        )
                      ))}
                    </div>
                  </div>
                ))}

                {/* Hook type distribution */}
                {cs.hookTypeDistribution && (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm font-bold text-slate-800 mb-3">Hook Type Distribution</p>
                    <p className="text-xs text-slate-500 mb-3">Screenshots per hook strategy</p>
                    {[
                      { label: 'Benefit-led', val: cs.hookTypeDistribution.benefitLed, color: 'bg-brand-500' },
                      { label: 'Social Proof', val: cs.hookTypeDistribution.socialProof, color: 'bg-amber-500' },
                      { label: 'Feature-led', val: cs.hookTypeDistribution.featureLed, color: 'bg-slate-500' },
                    ].map((h, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${h.color}`} />
                        <span className="text-xs text-slate-500 w-20">{h.label}</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full">
                          <div className={`h-full rounded-full ${h.color}`} style={{ width: `${Math.min((h.val || 0) * 10, 100)}%` }} />
                        </div>
                        <span className="text-xs text-slate-700 w-4 text-right">{h.val || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Dimension comparison across apps */}
            {apps.length > 1 && (
              <SectionCard>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Dimension-by-Dimension Comparison</h4>
                <p className="text-xs text-slate-500 mb-4">Score per creative category grouped by app (0–100)</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500">
                        <th className="text-left pb-3 font-medium">Dimension</th>
                        {apps.map((a, ai) => (
                          <th key={ai} className="text-center pb-3 font-medium">
                            <div className="flex items-center justify-center gap-1">
                              {a.icon && <img src={a.icon} alt="" className="w-4 h-4 rounded" />}
                              <span className="truncate max-w-[80px]">{a.name.split(':')[0]}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sections.map(({ key, label }) => (
                        <tr key={key}>
                          <td className="py-2.5 text-slate-500">{label}</td>
                          {apps.map((a, ai) => {
                            const aCs = a.analysis?.creativeScoring || {};
                            const score = aCs[key]?.total ?? 0;
                            return (
                              <td key={ai} className="py-2.5 text-center">
                                <ScorePill score={score} />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SCREENSHOTS TAB ──────────────────────────────────────────────────────────

function ScreenshotsTab({ apps }) {
  const HOOK_COLORS = {
    'benefit-led': 'bg-brand-500/20 text-brand-300 border border-brand-500/30',
    'social-proof': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    'feature-led': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  };

  return (
    <div className="space-y-4 pb-8">
      {apps.map((app, idx) => {
        const ss = app.analysis?.screenshots || {};
        const screens = ss.screens || [];
        // Use actual screenshot URLs from app data
        const screenshotUrls = app.screenshots || [];

        return (
          <div key={idx} className="space-y-4">
            <SectionCard>
              <AppHeader app={app} />
              <p className="text-sm text-slate-500 mb-4">{ss.analysisNote}</p>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Strengths</h4>
                  {(ss.strengths || []).map((s, i) => <p key={i} className="text-xs text-slate-700 mb-1">✓ {s}</p>)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Weaknesses</h4>
                  {(ss.weaknesses || []).map((w, i) => <p key={i} className="text-xs text-slate-700 mb-1">✗ {w}</p>)}
                </div>
              </div>
            </SectionCard>

            {/* Per-screen analysis */}
            <div className="space-y-4">
              {screens.map((screen, si) => {
                const imgUrl = screen.url || screenshotUrls[si] || screenshotUrls[screen.number - 1];
                const hookClass = HOOK_COLORS[screen.hookType?.toLowerCase()] || HOOK_COLORS['feature-led'];

                return (
                  <SectionCard key={si}>
                    <div className="flex gap-4">
                      {/* Screenshot image */}
                      {imgUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={imgUrl}
                            alt={`Screen ${screen.number}`}
                            className="w-28 rounded-xl border border-slate-200 object-cover"
                            style={{ maxHeight: 220 }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-500 uppercase">Screen {screen.number}</span>
                            {screen.hookType && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${hookClass}`}>
                                {screen.hookType}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3 text-xs flex-shrink-0">
                            <span className="text-slate-500">Clarity <strong className="text-slate-800">{screen.clarity}/10</strong></span>
                            <span className="text-slate-500">Stop Power <strong className="text-slate-800">{screen.stopPower}/10</strong></span>
                          </div>
                        </div>

                        <p className="text-sm font-semibold text-slate-800 mb-1 leading-snug">{screen.purpose}</p>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3">{screen.feedback}</p>

                        {screen.targetAudience && (
                          <p className="text-xs text-slate-500 italic mb-2">🎯 {screen.targetAudience}</p>
                        )}

                        {(screen.keyElements || []).length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {screen.keyElements.map((el, j) => (
                              <span key={j} className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{el}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </SectionCard>
                );
              })}
            </div>

            {/* Suggestions */}
            {(ss.suggestions || []).length > 0 && (
              <SectionCard>
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Suggestions</h4>
                {ss.suggestions.map((s, i) => (
                  <p key={i} className="text-xs text-slate-700 mb-2">› {s}</p>
                ))}
              </SectionCard>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── COMPETITORS TAB ─────────────────────────────────────────────────────────

function CompetitorsTab({ apps }) {
  return (
    <div className="space-y-4 pb-8">
      {apps.map((app, idx) => {
        const comp = app.analysis?.competitors || {};
        const analysed = comp.analysed || [];
        const fieldAvg = comp.fieldAverages || {};
        const dims = ['creativeStrategy', 'designVisuals', 'marketFit', 'differentiation', 'performance'];
        const dimLabels = { creativeStrategy: 'Creative Strategy', designVisuals: 'Design & Visuals', marketFit: 'Market Fit', differentiation: 'Differentiation', performance: 'Performance' };

        return (
          <div key={idx} className="space-y-4">
            {/* Competitor cards */}
            {analysed.map((c, ci) => (
              <SectionCard key={ci}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800">{c.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{c.platform === 'ios' ? '🍎 App Store' : '🤖 Google Play'}</p>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {c.positioningTag && <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{c.positioningTag}</span>}
                      {c.targetAudience && <span className="text-xs text-slate-500 italic">{c.targetAudience}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-slate-800">{c.overallScore}</div>
                    <div className="text-xs text-slate-500">/ 100</div>
                    {c.deltaVsYou?.overall !== undefined && (
                      <div className="mt-1">
                        <DeltaBadge delta={c.deltaVsYou.overall} />
                        <p className="text-xs text-slate-600 mt-0.5">vs you</p>
                      </div>
                    )}
                  </div>
                </div>

                {c.positioning && (
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{c.positioning}</p>
                )}

                {/* Dimension score matrix */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Dimension Score Matrix</p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 uppercase tracking-wider">
                        <th className="text-left pb-2 font-medium">Dimension</th>
                        <th className="text-center pb-2 font-medium">
                          <div className="flex items-center justify-center gap-1">
                            {app.icon && <img src={app.icon} alt="" className="w-4 h-4 rounded" />}
                            You
                          </div>
                        </th>
                        <th className="text-center pb-2 font-medium">{c.name.split(':')[0]}</th>
                        <th className="text-center pb-2 font-medium">Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {dims.map((dim) => {
                        const yourScore = app.analysis?.creativeScoring?.[dim]?.total ?? app.analysis?.overview?.[dim] ?? 0;
                        const theirScore = c.dimensionScores?.[dim] ?? 0;
                        const delta = c.deltaVsYou?.[dim];
                        return (
                          <tr key={dim}>
                            <td className="py-2 text-slate-500">{dimLabels[dim]}</td>
                            <td className="py-2 text-center font-bold text-slate-800">{yourScore}</td>
                            <td className="py-2 text-center font-bold text-slate-700">{theirScore}</td>
                            <td className="py-2 text-center"><DeltaBadge delta={delta} /></td>
                          </tr>
                        );
                      })}
                      <tr className="border-t border-slate-600">
                        <td className="py-2 font-bold text-slate-800 uppercase text-xs tracking-wide">Overall</td>
                        <td className="py-2 text-center font-bold text-brand-400">
                          {app.analysis?.overview?.influenceStrength || app.analysis?.overview?.overallScore || 0}
                        </td>
                        <td className="py-2 text-center font-bold text-slate-700">{c.overallScore}</td>
                        <td className="py-2 text-center"><DeltaBadge delta={c.deltaVsYou?.overall} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  {c.strengths?.length > 0 && (
                    <div>
                      <p className="font-semibold text-emerald-400 uppercase tracking-wider mb-2">Strengths</p>
                      {c.strengths.map((s, i) => <p key={i} className="text-slate-700 mb-1">✓ {s}</p>)}
                    </div>
                  )}
                  {c.weaknesses?.length > 0 && (
                    <div>
                      <p className="font-semibold text-red-400 uppercase tracking-wider mb-2">Weaknesses</p>
                      {c.weaknesses.map((w, i) => <p key={i} className="text-slate-700 mb-1">✗ {w}</p>)}
                    </div>
                  )}
                </div>
              </SectionCard>
            ))}

            {/* Your strengths/weaknesses vs field */}
            <div className="grid grid-cols-2 gap-4">
              {comp.yourStrengthsVsField?.length > 0 && (
                <SectionCard>
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Your Strengths vs Field</h4>
                  {comp.yourStrengthsVsField.map((s, i) => (
                    <p key={i} className="text-xs text-slate-700 mb-2 flex gap-2"><span className="text-emerald-500">●</span><span>{s}</span></p>
                  ))}
                </SectionCard>
              )}
              {comp.yourWeaknessesVsField?.length > 0 && (
                <SectionCard>
                  <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Areas to Improve vs Field</h4>
                  {comp.yourWeaknessesVsField.map((w, i) => (
                    <p key={i} className="text-xs text-slate-700 mb-2 flex gap-2"><span className="text-red-500">●</span><span>{w}</span></p>
                  ))}
                </SectionCard>
              )}
            </div>

            {comp.competitiveLandscape && (
              <SectionCard>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Competitive Landscape</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{comp.competitiveLandscape}</p>
              </SectionCard>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── INSIGHTS TAB ─────────────────────────────────────────────────────────────

function InsightsTab({ apps }) {
  return (
    <div className="space-y-4 pb-8">
      {apps.map((app, idx) => {
        const ins = app.analysis?.insights || {};
        const icp = ins.icp || {};

        return (
          <div key={idx} className="space-y-4">
            {/* Top Recommendations */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-brand-400">🎯</span> Top Recommendations
              </h4>
              <div className="space-y-3">
                {(ins.topRecommendations || []).map((rec, i) => {
                  const pillClass = PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS.MEDIUM;
                  return (
                    <SectionCard key={i} className="border-l-4 border-l-slate-600">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${pillClass}`}>{rec.priority}</span>
                            {rec.category && <span className="text-xs text-slate-500 uppercase tracking-wide">{rec.category}</span>}
                          </div>
                          <h5 className="font-bold text-slate-800 mb-1.5">{rec.title}</h5>
                          <p className="text-sm text-slate-500 leading-relaxed mb-3">{rec.description}</p>
                          <div className="space-y-1 mb-3">
                            {(rec.actionItems || []).map((a, j) => (
                              <p key={j} className="text-xs text-slate-700 flex gap-2">
                                <span className="text-brand-400">›</span><span>{a}</span>
                              </p>
                            ))}
                          </div>
                          {rec.expectedImpact && (
                            <p className="text-xs text-brand-400 border border-brand-500/20 bg-brand-500/5 rounded-lg px-3 py-2">
                              ↑ {rec.expectedImpact}
                            </p>
                          )}
                        </div>
                      </div>
                    </SectionCard>
                  );
                })}
              </div>
            </div>

            {/* ICP Section */}
            {(icp.primarySegments?.length > 0 || icp.untappedSegments?.length > 0) && (
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span>👥</span> ICP & Whitespace Opportunities
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <SectionCard>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Target Customer Profiles</h5>
                    <div className="space-y-3">
                      {(icp.primarySegments || []).map((seg, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs font-bold text-slate-800 mb-1">{seg.name}</p>
                          <p className="text-xs text-slate-500 leading-relaxed mb-1.5">{seg.description}</p>
                          {seg.appsTheyUse?.length > 0 && (
                            <p className="text-xs text-slate-500">Apps: {seg.appsTheyUse.join(', ')}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    {icp.untappedSegments?.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Untapped Segments</h5>
                        {icp.untappedSegments.map((seg, i) => (
                          <p key={i} className="text-xs text-slate-700 mb-1.5 flex gap-2">
                            <span className="text-amber-500">·</span><span>{seg}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </SectionCard>

                  <div className="space-y-4">
                    {icp.opportunities?.length > 0 && (
                      <SectionCard>
                        <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Whitespace Opportunities</h5>
                        {icp.opportunities.map((opp, i) => (
                          <p key={i} className="text-xs text-slate-700 mb-2 flex gap-2">
                            <span className="text-emerald-500 mt-0.5 flex-shrink-0">●</span><span>{opp}</span>
                          </p>
                        ))}
                      </SectionCard>
                    )}
                    {icp.threats?.length > 0 && (
                      <SectionCard>
                        <h5 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Threats</h5>
                        {icp.threats.map((t, i) => (
                          <p key={i} className="text-xs text-slate-700 mb-2 flex gap-2">
                            <span className="text-red-500 mt-0.5 flex-shrink-0">●</span><span>{t}</span>
                          </p>
                        ))}
                      </SectionCard>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Whitespace + Overused Patterns (from old structure) */}
            {(ins.whitespaceOpportunities?.length > 0 || ins.overusedPatterns?.length > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {ins.whitespaceOpportunities?.length > 0 && (
                  <SectionCard>
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">🌱 Whitespace Opportunities</h4>
                    {(ins.whitespaceOpportunities || []).map((opp, i) => (
                      <p key={i} className="text-xs text-slate-700 mb-2 flex gap-2">
                        <span className="text-emerald-500">●</span>
                        <span>{typeof opp === 'string' ? opp : opp.title}</span>
                      </p>
                    ))}
                  </SectionCard>
                )}
                {ins.overusedPatterns?.length > 0 && (
                  <SectionCard>
                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">⚠ Overused Patterns to Avoid</h4>
                    {(ins.overusedPatterns || []).map((p, i) => (
                      <div key={i} className="mb-3">
                        <p className="text-xs font-semibold text-slate-800">{p.pattern}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{p.reason}</p>
                        {p.alternative && <p className="text-xs text-amber-400 mt-0.5">Instead: {p.alternative}</p>}
                      </div>
                    ))}
                  </SectionCard>
                )}
              </div>
            )}

            {/* Keyword Analysis */}
            <SectionCard>
              <h4 className="text-sm font-bold text-slate-800 mb-4">📊 Keyword Analysis</h4>
              <div className="space-y-4">
                {[
                  { key: 'current', label: 'Current Keywords', color: 'bg-slate-200 text-slate-700' },
                  { key: 'missed', label: 'Missed Opportunities', color: 'bg-red-500/20 text-red-300' },
                ].map(({ key, label, color }) => (
                  <div key={key}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(ins.keywordAnalysis?.[key] || []).map((kw, j) => (
                        <span key={j} className={`text-xs px-2.5 py-1 rounded-full ${color}`}>{kw}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {ins.keywordAnalysis?.suggested?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Suggested Keywords</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-slate-500 uppercase tracking-wider">
                            <th className="text-left pb-2 font-medium">Keyword</th>
                            <th className="text-left pb-2 font-medium">Difficulty</th>
                            <th className="text-left pb-2 font-medium">Place In</th>
                            <th className="text-left pb-2 font-medium">Reasoning</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {ins.keywordAnalysis.suggested.map((kw, i) => (
                            <tr key={i}>
                              <td className="py-2 font-medium text-slate-800">{kw.keyword}</td>
                              <td className="py-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${kw.difficulty === 'Low' ? 'bg-emerald-500/20 text-emerald-400' : kw.difficulty === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                  {kw.difficulty}
                                </span>
                              </td>
                              <td className="py-2 text-slate-500 capitalize">{kw.whereToPlace}</td>
                              <td className="py-2 text-slate-500">{kw.reasoning}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Action Roadmap */}
            {ins.roadmapActions && (
              <SectionCard>
                <h4 className="text-sm font-bold text-slate-800 mb-4">📅 Action Roadmap</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'week1', label: 'Week 1', color: 'border-red-500/40' },
                    { key: 'month1', label: 'Month 1', color: 'border-amber-500/40' },
                    { key: 'quarter1', label: 'Quarter 1', color: 'border-emerald-500/40' },
                  ].map(({ key, label, color }) => (
                    <div key={key} className={`p-4 bg-slate-50 rounded-xl border-t-2 ${color}`}>
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">{label}</h5>
                      <ul className="space-y-2">
                        {(ins.roadmapActions?.[key] || []).map((item, i) => (
                          <li key={i} className="text-xs text-slate-700">
                            <p className="font-medium mb-0.5">• {item.action}</p>
                            {item.expectedOutcome && <p className="text-slate-500 pl-3">{item.expectedOutcome}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ReportSection({ report }) {
  const [activeTab, setActiveTab] = useState('overview');
  const apps = report?.apps || [];

  if (!report) return null;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab apps={apps} />;
      case 'appText': return <AppTextTab apps={apps} />;
      case 'creativeScoring': return <CreativeScoringTab apps={apps} />;
      case 'screenshots': return <ScreenshotsTab apps={apps} />;
      case 'competitors': return <CompetitorsTab apps={apps} />;
      case 'insights': return <InsightsTab apps={apps} />;
      default: return <OverviewTab apps={apps} />;
    }
  };

  return (
    <div id="aso-report" className="w-full">
      {/* Tab Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg mb-6">
        <div className="flex gap-1 overflow-x-auto px-3 pt-2 scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} data-tab-id={tab.id}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-sm ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div data-tab-content>{renderTab()}</div>
    </div>
  );
}
