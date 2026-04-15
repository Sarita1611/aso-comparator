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
    model: 'gpt-4.5-preview',   // current API model string for GPT-5 — update if OpenAI changes it
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

// Call Groq correctly using the client instance
async function callGroq(systemPrompt, userPrompt) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.15,
    max_tokens: 6000,
  });
  const text = completion.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');
  return text;
}

// Call Gemini as fallback - tries gemini-2.0-flash first, then gemini-2.0-flash-lite
async function callGemini(systemPrompt, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const prompt = `${systemPrompt}\n\n${userPrompt}`;
  const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

  // Try gemini-2.0-flash first
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

  // Fallback to gemini-2.0-flash-lite
  console.log('[Gemini] Trying gemini-2.0-flash-lite...');
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
Screenshots: ${app.screenshotCount || 0}
Last Updated: ${app.lastUpdated}
Developer: ${app.developer}
Price: ${app.price}
  `).join('\n---\n');

  return `You are a world-class ASO expert. Analyze these apps for the ${countryName} market and generate a DETAILED, COMPREHENSIVE report.

${appsSummary}

ASO KNOWLEDGE:
${knowledge || 'Use your expert ASO knowledge to analyze these apps.'}

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no markdown, no explanations, start with [
2. All scores must be 0-100 numbers
3. Be extremely specific - quote actual text, give exact character counts
4. Include detailed strategic analysis with actionable recommendations
5. Structure must match exactly what I specify below
6. Include competitive positioning and market opportunities
7. Provide specific keyword suggestions with difficulty levels
8. Give detailed scoring breakdowns for each dimension

Return a JSON ARRAY with one object per app. Each object must have this structure:

{
  "overview": {
    "influenceStrength": <0-100>,
    "summary": "<2-3 sentence executive summary>",
    "creativeStrategy": <0-100>,
    "designVisuals": <0-100>,
    "marketFit": <0-100>,
    "differentiation": <0-100>,
    "performance": <0-100>,
    "overallScore": <0-100>,
    "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "keyWeaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"]
  },
  "appText": {
    "overallTextScore": <0-10>,
    "uniqueness": <0-100>,
    "strategicAssessment": "<3-4 sentence analysis>",
    "title": {
      "score": <0-10>,
      "currentValue": "<actual title>",
      "length": "<X/30 characters>",
      "utilization": "<percentage>%",
      "primaryKeywords": ["<kw1>", "<kw2>"],
      "strengths": ["<strength>"],
      "weaknesses": ["<weakness>"],
      "suggestions": ["<suggestion>"]
    },
    "subtitle": {
      "score": <0-10>,
      "currentValue": "<subtitle or MISSING>",
      "length": "<X/30 characters>",
      "utilization": "<percentage>%",
      "strengths": ["<strength>"],
      "weaknesses": ["<weakness>"],
      "suggestions": ["<suggestion>"]
    },
    "description": {
      "score": <0-10>,
      "length": "<X/4000 characters>",
      "utilization": "<percentage>%",
      "openingLine": "<first sentence>",
      "keywordDensity": "<X% density>",
      "strengths": ["<strength>"],
      "weaknesses": ["<weakness>"],
      "suggestions": ["<suggestion>"]
    }
  },
  "creativeScoring": {
    "categoryRadar": {
      "strategy": <0-100>,
      "design": <0-100>,
      "differentiation": <0-100>,
      "marketFit": <0-100>,
      "performance": <0-100>
    },
    "dimensionComparison": {
      "strategy": <0-100>,
      "design": <0-100>,
      "marketFit": <0-100>,
      "differentiation": <0-100>,
      "performance": <0-100>
    },
    "hookTypeDistribution": {
      "benefitLed": <count>,
      "socialProof": <count>,
      "featureLed": <count>
    },
    "conversionFunnelCoverage": {
      "hook": true,
      "features": true,
      "socialProof": true,
      "cta": true
    },
    "analysis": "<creative approach analysis>"
  },
  "screenshots": {
    "count": <number>,
    "analysisNote": "<screenshot strategy overview>",
    "strengths": ["<strength>"],
    "weaknesses": ["<weakness>"],
    "screens": [
      {
        "number": 1,
        "purpose": "<purpose>",
        "clarity": <0-10>,
        "stopPower": <0-10>,
        "keyElements": ["<element>"],
        "feedback": "<feedback>"
      }
    ],
    "suggestions": ["<suggestion>"]
  },
  "competitors": {
    "analysed": [
      {
        "name": "<competitor name>",
        "platform": "<ios|android>",
        "overallScore": <0-100>,
        "positioning": "<positioning strategy>",
        "strengths": ["<strength>"],
        "weaknesses": ["<weakness>"],
        "dimensionScores": {
          "creativeStrategy": <0-100>,
          "designVisuals": <0-100>,
          "marketFit": <0-100>,
          "differentiation": <0-100>,
          "performance": <0-100>
        }
      }
    ],
    "competitiveLandscape": "<market analysis>"
  },
  "insights": {
    "topRecommendations": [
      {
        "priority": "CRITICAL",
        "category": "KEYWORDS",
        "title": "<title>",
        "description": "<description>",
        "actionItems": ["<action 1>", "<action 2>"],
        "expectedImpact": "<expected outcome>"
      }
    ],
    "whitespaceOpportunities": [
      {
        "title": "<opportunity>",
        "description": "<description>",
        "reasoning": "<why>"
      }
    ],
    "oversusedPatterns": [
      {
        "pattern": "<pattern>",
        "reason": "<why bad>",
        "alternative": "<alternative>"
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
  const { apps, userId, country = 'us' } = req.body;

  if (!apps || apps.length === 0) {
    return res.status(400).json({ error: 'At least one app required' });
  }

  try {
    // Get RAG knowledge - pass apps array directly
    let knowledge = null;
    try {
      knowledge = await getRelevantASOKnowledge(apps);
    } catch (ragErr) {
      console.warn('[Analyze] RAG failed, continuing without knowledge:', ragErr.message);
    }

    // Build prompt
    const systemPrompt = buildDetailedAnalysisPrompt(knowledge, country, apps);
    const userPrompt = `Analyze these ${apps.length} apps and return a JSON array with one detailed analysis object per app.`;

    // NEW — OpenAI primary, Groq fallback
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

    // Strip markdown fences and parse JSON
    const cleaned = analysisText.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response');
    }

    const analysisData = JSON.parse(jsonMatch[0]);
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

    // Save to history
    if (userId) {
      const winner = analysisArray.length > 1
        ? (analysisArray[0]?.overview?.overallScore >= (analysisArray[1]?.overview?.overallScore || 0)
          ? apps[0].name : apps[1].name)
        : apps[0].name;

      const { error: saveError } = await supabase
        .from('analysis_history')
        .insert({
          user_id: userId,
          apps_analyzed: apps.map(a => a.name).join(', '),
          report,
          app_count: apps.length,
          winner,
          country
        });

      if (saveError) console.error('[Analyze] Save history error:', saveError);
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
