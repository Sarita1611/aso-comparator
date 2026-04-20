import express from 'express';
import groq from '../lib/groq.js';
import openai from '../lib/openai.js';
import { getRelevantASOKnowledge } from '../lib/rag.js';
import supabase from '../lib/supabase.js';
import fetch from 'node-fetch';

const router = express.Router();

const COUNTRY_NAMES = {
  'us': 'United States', 'gb': 'United Kingdom', 'in': 'India', 'ca': 'Canada',
  'au': 'Australia', 'de': 'Germany', 'fr': 'France', 'jp': 'Japan',
  'br': 'Brazil', 'ae': 'UAE', 'kr': 'South Korea', 'mx': 'Mexico',
  'es': 'Spain', 'it': 'Italy', 'nl': 'Netherlands', 'ru': 'Russia',
  'cn': 'China', 'sg': 'Singapore', 'se': 'Sweden', 'no': 'Norway',
  'dk': 'Denmark', 'fi': 'Finland', 'ch': 'Switzerland', 'at': 'Austria',
  'be': 'Belgium', 'pl': 'Poland', 'pt': 'Portugal', 'tr': 'Turkey',
  'sa': 'Saudi Arabia', 'il': 'Israel', 'za': 'South Africa', 'ng': 'Nigeria',
  'eg': 'Egypt', 'ar': 'Argentina', 'cl': 'Chile', 'co': 'Colombia',
  'pe': 'Peru', 'id': 'Indonesia', 'my': 'Malaysia', 'th': 'Thailand',
  'ph': 'Philippines', 'vn': 'Vietnam', 'pk': 'Pakistan', 'bd': 'Bangladesh',
  'nz': 'New Zealand', 'ie': 'Ireland', 'cz': 'Czech Republic', 'hu': 'Hungary',
  'ro': 'Romania', 'ua': 'Ukraine', 'gr': 'Greece', 'tw': 'Taiwan',
  'hk': 'Hong Kong', 'kz': 'Kazakhstan', 'ma': 'Morocco', 'ke': 'Kenya'
};

async function callOpenAI(systemPrompt, userPrompt) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.15,
    max_tokens: 16000,
  });
  const text = completion.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenAI');
  return text;
}

async function callGroq(systemPrompt, userPrompt) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.15,
    max_tokens: 8000,
  });
  const text = completion.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');
  return text;
}

async function callGemini(systemPrompt, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const prompt = `${systemPrompt}\n\n${userPrompt}`;
  const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

  try {
    console.log('[Gemini] Trying gemini-2.0-flash...');
    const res = await fetch(`${BASE}/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.15, maxOutputTokens: 8000 }
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Gemini 2.0-flash error');
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from gemini-2.0-flash');
    console.log('[Gemini] gemini-2.0-flash succeeded');
    return text;
  } catch (err) {
    console.warn('[Gemini] gemini-2.0-flash failed, trying gemini-2.0-flash-lite:', err.message);
  }

  const res = await fetch(`${BASE}/gemini-2.0-flash-lite:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.15, maxOutputTokens: 8000 }
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gemini flash-lite error');
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from gemini-2.0-flash-lite');
  console.log('[Gemini] gemini-2.0-flash-lite succeeded');
  return text;
}

// Robust JSON extractor — finds the first [ or { and matches its closing bracket
function extractJSON(text) {
  // Remove markdown fences first
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Find the first [ or {
  const arrayStart = cleaned.indexOf('[');
  const objectStart = cleaned.indexOf('{');

  let startIdx = -1;
  let openChar, closeChar;

  if (arrayStart === -1 && objectStart === -1) return null;

  if (arrayStart === -1) {
    startIdx = objectStart;
    openChar = '{'; closeChar = '}';
  } else if (objectStart === -1) {
    startIdx = arrayStart;
    openChar = '['; closeChar = ']';
  } else if (arrayStart < objectStart) {
    startIdx = arrayStart;
    openChar = '['; closeChar = ']';
  } else {
    startIdx = objectStart;
    openChar = '{'; closeChar = '}';
  }

  // Walk the string counting brackets to find the matching close
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startIdx; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) {
        return cleaned.slice(startIdx, i + 1);
      }
    }
  }

  // If bracket matching failed, return everything from startIdx as last resort
  return cleaned.slice(startIdx);
}

function buildDetailedAnalysisPrompt(knowledge, country, appsData) {
  const countryName = COUNTRY_NAMES[country] || country.toUpperCase();

  const appsSummary = appsData.map(app => `
App: ${app.name}
Platform: ${app.platform}
Category: ${app.category}
Rating: ${app.rating} (${app.ratingCount} reviews)
Title: "${app.title}"
Subtitle: "${app.subtitle}"
Description length: ${app.description?.length || 0} chars
Description (first 500 chars): "${app.description?.slice(0, 500) || ''}"
Screenshots: ${app.screenshotCount || 0}
Screenshot URLs: ${JSON.stringify(app.screenshots || [])}
Last Updated: ${app.lastUpdated}
Developer: ${app.developer}
Price: ${app.price}
Installs: ${app.installs || 'N/A'}
  `).join('\n---\n');

  return `You are a world-class ASO creative intelligence expert. Analyze these apps for the ${countryName} market and generate a deeply detailed report.

${appsSummary}

ASO KNOWLEDGE:
${knowledge || 'Use your expert ASO knowledge.'}

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON array — no markdown, no explanation, start with [
2. All scores must be numbers (0-100 for overview scores, 0-10 for sub-scores)
3. Be extremely specific — quote actual text, give character counts
4. Infer ICP segments from app name, category, description, and market context
5. Quick wins must be ranked by impact/effort ratio (highest ROI first)
6. Delta scores = this app's score minus field average across all analyzed apps
7. Suggest 10 realistic iOS keyword field keywords (comma-separated, under 100 chars total)
8. Analyze ALL screenshots individually — never truncate the screens array
9. For competitors, provide REAL competitor names from the same category, not placeholders
10. topRecommendations must have minimum 6 items
11. quickWins must have minimum 3 items  
12. primarySegments in ICP must have minimum 3 segments
13. keywordAnalysis.suggested must have minimum 8 keywords
14. Every text field must be fully written out — never truncate with "..."
15. topASOKeywords must have exactly 15 items — these are the words doing the MOST ASO work for this specific app, drawn from its actual title, subtitle, and description text. Score each by its real algorithmic value: title placement = highest weight, subtitle = medium, description = lower. A keyword that appears in the title but is generic scores lower than a niche keyword perfectly placed in the title.

Return a JSON array, one object per app, with EXACTLY this structure:

{
  "overview": {
    "influenceStrength": <0-100>,
    "summary": "<2-3 sentence executive summary>",
    "overallScore": <0-100>,
    "keyStrengths": ["<str1>", "<str2>", "<str3>"],
    "keyWeaknesses": ["<weak1>", "<weak2>", "<weak3>"],
    "quickWins": [
      {
        "rank": 1,
        "impact": "HIGH",
        "effort": "LOW",
        "category": "APP STORE TEXT",
        "title": "<actionable title>",
        "description": "<why this matters and what to do>"
      }
    ],
    "funnelCoverage": {
      "hook": <true|false>,
      "features": <true|false>,
      "socialProof": <true|false>,
      "cta": <true|false>
    },
    "performanceSignals": {
      "firstImpression": <0-10>,
      "conversionStrength": <0-10>,
      "dropOffRisk": <0-10>
    },
    "screenshotWeakestLink": {
      "screenNumber": <number>,
      "clarity": <0-10>,
      "stopPower": <0-10>,
      "suggestion": "<what to replace it with>"
    }
  },
  "creativeScoring": {
    "creativeStrategy": {
      "total": <0-100>,
      "hookStrength": <0-10>,
      "messageClarity": <0-10>,
      "ctaEffectiveness": <0-10>,
      "storytellingQuality": <0-10>,
      "valuePropositionClarity": <0-10>
    },
    "designVisuals": {
      "total": <0-100>,
      "humanRelatability": <0-10>,
      "visualConsistency": <0-10>,
      "uiLifestyleBalance": <0-10>,
      "thumbnailRecognition": <0-10>,
      "colorStrategyEffectiveness": <0-10>
    },
    "marketFit": {
      "total": <0-100>,
      "audienceMatch": <0-10>,
      "brandAlignment": <0-10>,
      "culturalRelevance": <0-10>,
      "localizationQuality": <0-10>
    },
    "differentiation": {
      "total": <0-100>,
      "patternRepetition": <0-10>,
      "uniquenessVsCompetitors": <0-10>,
      "distinctPositioning": <0-10>
    },
    "performance": {
      "total": <0-100>,
      "firstImpressionScore": <0-10>,
      "screenshotDropOff": <0-10>,
      "likelyConversionRate": <0-10>
    },
    "hookTypeDistribution": {
      "benefitLed": <count>,
      "socialProof": <count>,
      "featureLed": <count>
    },
    "creativeNarrative": "<2-3 sentence analysis of overall creative approach>",
    "dominantTone": "<e.g. Utility · Social Proof Hook>",
    "positioningTag": "<e.g. feature-led · utility>"
  },
  "appText": {
    "overallTextScore": <0-10>,
    "uniqueness": <0-100>,
    "strategicAssessment": "<3-4 sentence analysis>",
    "industryBenchmarks": ["<insight 1 with % or stat>", "<insight 2>"],
    "title": {
      "score": <0-10>,
      "currentValue": "<actual title>",
      "length": "<X/30 characters>",
      "utilization": "<percentage>%",
      "primaryKeywords": ["<kw1>", "<kw2>"],
      "strengths": ["<str>"],
      "weaknesses": ["<weak>"],
      "suggestions": ["<suggestion>"]
    },
    "subtitle": {
      "score": <0-10>,
      "currentValue": "<subtitle or Not set>",
      "length": "<X/30 characters>",
      "utilization": "<percentage>%",
      "strengths": ["<str>"],
      "weaknesses": ["<weak>"],
      "suggestions": ["<suggestion>"]
    },
    "description": {
      "score": <0-10>,
      "length": "<X/4000 characters>",
      "utilization": "<percentage>%",
      "keywordDensity": "<X.X%>",
      "openingLine": "<first sentence of description>",
      "hasKeywordInFirstFold": <true|false>,
      "hasStructuredFormatting": <true|false>,
      "hasSocialProof": <true|false>,
      "hasCTA": <true|false>,
      "keywordsFound": ["<kw1>", "<kw2>", "<kw3>"],
      "strengths": ["<str>"],
      "weaknesses": ["<weak>"],
      "suggestions": ["<suggestion>"]
    },
    "keywordFieldSuggestion": "<10 comma-separated keywords under 100 chars total, no spaces after commas>"
  },
  "screenshots": {
    "count": <number>,
    "analysisNote": "<overview of screenshot strategy>",
    "strengths": ["<str>"],
    "weaknesses": ["<weak>"],
    "screens": [
      {
        "number": 1,
        "url": "<screenshot url if available>",
        "hookType": "<benefit-led|social-proof|feature-led>",
        "purpose": "<what this screen is trying to achieve>",
        "clarity": <0-10>,
        "stopPower": <0-10>,
        "keyElements": ["<element>"],
        "targetAudience": "<who this screen speaks to>",
        "feedback": "<specific critique and what works/doesn't>"
      }
    ],
    "suggestions": ["<suggestion>"]
  },
  "competitors": {
    "fieldAverages": {
      "creativeStrategy": <0-100>,
      "designVisuals": <0-100>,
      "marketFit": <0-100>,
      "differentiation": <0-100>,
      "performance": <0-100>,
      "overall": <0-100>,
      "textScore": <0-10>
    },
    "analysed": [
      {
        "name": "<competitor name>",
        "platform": "<ios|android>",
        "overallScore": <0-100>,
        "positioning": "<positioning strategy>",
        "positioningTag": "<e.g. feature-led · utility>",
        "targetAudience": "<who they target>",
        "strengths": ["<str>"],
        "weaknesses": ["<weak>"],
        "dimensionScores": {
          "creativeStrategy": <0-100>,
          "designVisuals": <0-100>,
          "marketFit": <0-100>,
          "differentiation": <0-100>,
          "performance": <0-100>
        },
        "deltaVsYou": {
          "creativeStrategy": <signed number, e.g. -16>,
          "designVisuals": <signed number>,
          "marketFit": <signed number>,
          "differentiation": <signed number>,
          "performance": <signed number>,
          "overall": <signed number>
        }
      }
    ],
    "yourStrengthsVsField": ["<point 1>", "<point 2>"],
    "yourWeaknessesVsField": ["<point 1>"],
    "competitiveLandscape": "<2-3 sentence market analysis>"
  },
  "topASOKeywords": [
    {
      "keyword": "<the keyword or 2-3 word phrase>",
      "asoScore": "<0-100, overall ASO value>",
      "placement": "<title|subtitle|description|missing>",
      "placementWeight": "<high|medium|low>",
      "searchVolume": "<high|medium|low>",
      "competition": "<high|medium|low>",
      "intent": "<e.g. navigational, transactional, informational>",
      "isWasted": "<true if high-value keyword buried in description when it should be in title/subtitle>",
      "wastedReason": "<why it is wasted, or null if not wasted>",
      "recommendation": "<one specific action: move to title, add to subtitle, keep as-is, remove, etc.>"
    }
  ],
  "insights": {
    "icp": {
      "primarySegments": [
        {
          "name": "<segment name e.g. Metro convenience maximizers>",
          "description": "<who they are and what they want>",
          "appsTheyUse": ["<this app>", "<competitor if relevant>"]
        }
      ],
      "untappedSegments": ["<segment 1>", "<segment 2>", "<segment 3>"],
      "opportunities": ["<opp 1>", "<opp 2>", "<opp 3>", "<opp 4>", "<opp 5>"],
      "threats": ["<threat 1>", "<threat 2>"]
    },
    "topRecommendations": [
      {
        "priority": "CRITICAL",
        "category": "HOOK",
        "title": "<title>",
        "description": "<why this matters>",
        "actionItems": ["<action 1>", "<action 2>"],
        "expectedImpact": "<outcome>"
      }
    ],
    "whitespaceOpportunities": ["<opp 1>", "<opp 2>", "<opp 3>"],
    "overusedPatterns": [
      {
        "pattern": "<pattern>",
        "reason": "<why it hurts>",
        "alternative": "<what to do instead>"
      }
    ],
    "keywordAnalysis": {
      "current": ["<kw1>", "<kw2>"],
      "missed": ["<kw1>", "<kw2>"],
      "suggested": [
        {
          "keyword": "<keyword>",
          "difficulty": "Low",
          "intent": "<intent>",
          "whereToPlace": "title",
          "reasoning": "<why>"
        }
      ]
    },
    "roadmapActions": {
      "week1": [{ "action": "<action>", "expectedOutcome": "<outcome>" }],
      "month1": [{ "action": "<action>", "expectedOutcome": "<outcome>" }],
      "quarter1": [{ "action": "<action>", "expectedOutcome": "<outcome>" }]
    }
  }
}`;
}

// Main comparison analysis endpoint
router.post('/compare', async (req, res) => {
  const { apps, country = 'us' } = req.body;

  if (!apps || apps.length === 0) {
    return res.status(400).json({ error: 'At least one app required' });
  }

  try {
    // Get RAG knowledge
    let knowledge = null;
    try {
      knowledge = await getRelevantASOKnowledge(apps);
    } catch (ragErr) {
      console.warn('[Analyze] RAG failed, continuing without knowledge:', ragErr.message);
    }

    // Build prompt
    const systemPrompt = buildDetailedAnalysisPrompt(knowledge, country, apps);
    const userPrompt = `Analyze these ${apps.length} apps and return a JSON array with one detailed analysis object per app.`;

    // OpenAI primary, Groq fallback
    let analysisText = '';
    try {
      console.log('[Analyze] Calling OpenAI for detailed analysis...');
      analysisText = await callOpenAI(systemPrompt, userPrompt);
      console.log('[Analyze] OpenAI succeeded');
    } catch (openaiError) {
      console.warn('[Analyze] OpenAI failed, falling back to Groq:', openaiError.message);
      try {
        analysisText = await callGroq(systemPrompt, userPrompt);
        console.log('[Analyze] Groq fallback succeeded');
      } catch (groqError) {
        throw new Error(`Both OpenAI and Groq failed. Last error: ${groqError.message}`);
      }
    }

    // Robust JSON extraction
    const jsonStr = extractJSON(analysisText);
    if (!jsonStr) {
      console.error('[Analyze] Raw response:', analysisText.slice(0, 500));
      throw new Error('Could not extract JSON from AI response');
    }

    let analysisData;
    try {
      analysisData = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('[Analyze] JSON parse error:', parseErr.message);
      console.error('[Analyze] Problematic JSON (first 500 chars):', jsonStr.slice(0, 500));
      throw new Error(`JSON parse failed: ${parseErr.message}`);
    }

    const analysisArray = Array.isArray(analysisData) ? analysisData : [analysisData];

    // Build final report
    const report = {
      apps: apps.map((app, idx) => ({
        ...app,
        analysis: analysisArray[idx] || analysisArray[0]
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        country,
        appCount: apps.length
      }
    };

    // Save to history (shared, no user required)
    try {
      const winner = analysisArray.length > 1
        ? (analysisArray[0]?.overview?.overallScore >= (analysisArray[1]?.overview?.overallScore || 0)
          ? apps[0].name : apps[1].name)
        : apps[0].name;

      const { error: saveError } = await supabase
        .from('analysis_history')
        .insert({
          apps_analyzed: apps.map(a => a.name).join(', '),
          report,
          app_count: apps.length,
          winner,
          country
        });

      if (saveError) console.error('[Analyze] Save history error:', saveError);
    } catch (saveErr) {
      console.error('[Analyze] History save failed (non-fatal):', saveErr.message);
    }

    res.json({ success: true, report });
  } catch (err) {
    console.error('[Analyze] Error:', err);
    res.status(500).json({ 
      error: err.message || 'Analysis failed',
      details: err.toString()
    });
  }
});

export default router;
