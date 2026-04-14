import express from 'express';
import groq from '../lib/groq.js';
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

// Call Gemini as fallback
async function callGemini(systemPrompt, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const prompt = `${systemPrompt}\n\n${userPrompt}`;

  // Try gemini-2.0-flash first
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.15, maxOutputTokens: 8000 }
        })
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Gemini 2.0 error');
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini 2.0');
    return text;
  } catch (err) {
    console.warn('[Gemini] gemini-2.0-flash failed, trying gemini-1.0-pro:', err.message);
  }

  // Fallback to gemini-1.0-pro
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.15, maxOutputTokens: 8000 }
      })
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gemini 1.0 error');
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
${knowledge}

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no markdown, no explanations, start with {
2. All scores must be 0-100 numbers
3. Be extremely specific - quote actual text, give exact character counts
4. Include detailed strategic analysis with actionable recommendations
5. Structure must match exactly what I specify below
6. Include competitive positioning and market opportunities
7. Provide specific keyword suggestions with difficulty levels
8. Give detailed scoring breakdowns for each dimension

Generate JSON with this EXACT structure for each app:

{
  "overview": {
    "influenceStrength": <0-100 influence score>,
    "summary": "<detailed 2-3 sentence executive summary>",
    "creativeStrategy": <0-100>,
    "designVisuals": <0-100>,
    "marketFit": <0-100>,
    "differentiation": <0-100>,
    "performance": <0-100>,
    "overallScore": <0-100>,
    "keyStrengths": ["<specific strength with metric>", "<specific strength with metric>", "<specific strength with metric>"],
    "keyWeaknesses": ["<specific weakness with metric>", "<specific weakness with metric>", "<specific weakness with metric>"]
  },
  
  "appText": {
    "overallTextScore": <0-10>,
    "uniqueness": <0-100>,
    "strategicAssessment": "<detailed 3-4 sentence analysis of the text strategy>",
    "title": {
      "score": <0-10>,
      "currentValue": "<actual title from app>",
      "length": "<X/30 characters>",
      "utilization": "<percentage>%",
      "primaryKeywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
      "strengths": ["<specific strength>", "<specific strength>"],
      "weaknesses": ["<specific weakness if any>"],
      "suggestions": ["<specific suggested improvement with example>"]
    },
    "subtitle": {
      "score": <0-10>,
      "currentValue": "<actual subtitle or MISSING>",
      "length": "<X/30 characters>",
      "utilization": "<percentage>%",
      "strengths": ["<specific strength>"],
      "weaknesses": ["<specific weakness>"],
      "suggestions": ["<specific suggested improvement with example>"]
    },
    "description": {
      "score": <0-10>,
      "length": "<X/4000 characters>",
      "utilization": "<percentage>%",
      "openingLine": "<first sentence quoted>",
      "keywordDensity": "<X appearances in Y chars = Z%>",
      "strengths": ["<specific strength>", "<specific strength>"],
      "weaknesses": ["<specific weakness>", "<specific weakness>"],
      "suggestions": ["<specific improvement with quote>", "<specific improvement with quote>"]
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
      "hook": <true/false>,
      "features": <true/false>,
      "socialProof": <true/false>,
      "cta": <true/false>
    },
    "analysis": "<detailed analysis of creative approach>"
  },
  
  "screenshots": {
    "count": <number>,
    "analysisNote": "<strategic overview of screenshot strategy>",
    "strengths": ["<specific strength with count>", "<specific strength>"],
    "weaknesses": ["<specific weakness>"],
    "screens": [
      {
        "number": 1,
        "purpose": "<screen purpose/hook type>",
        "clarity": <0-10>,
        "stopPower": <0-10>,
        "keyElements": ["<element1>", "<element2>"],
        "feedback": "<specific feedback>"
      }
    ],
    "suggestions": ["<specific improvement>", "<specific improvement>"]
  },
  
  "competitors": {
    "analysed": [
      {
        "name": "<competitor app name>",
        "platform": "<ios|android>",
        "overallScore": <0-100>,
        "positioning": "<competitor positioning strategy>",
        "strengths": ["<specific strength>", "<specific strength>"],
        "weaknesses": ["<specific weakness if applicable>"],
        "dimensionScores": {
          "creativeStrategy": <0-100>,
          "designVisuals": <0-100>,
          "marketFit": <0-100>,
          "differentiation": <0-100>,
          "performance": <0-100>
        }
      }
    ],
    "competitiveLandscape": "<2-3 sentence market analysis>"
  },
  
  "insights": {
    "topRecommendations": [
      {
        "priority": "<CRITICAL|HIGH|MEDIUM>",
        "category": "<HOOK|POSITIONING|MESSAGING|CREATIVE|KEYWORDS>",
        "title": "<action title>",
        "description": "<detailed description of what to do>",
        "actionItems": ["<specific action step 1>", "<specific action step 2>"],
        "expectedImpact": "<specific expected outcome with potential metrics>"
      }
    ],
    "whitespaceOpportunities": [
      {
        "title": "<opportunity title>",
        "description": "<detailed opportunity description>",
        "reasoning": "<why this is an opportunity>"
      }
    ],
    "oversusedPatterns": [
      {
        "pattern": "<pattern to avoid>",
        "reason": "<why it's overused/ineffective>",
        "alternative": "<what to do instead>"
      }
    ],
    "keywordAnalysis": {
      "current": ["<keyword1>", "<keyword2>"],
      "missed": ["<missed keyword1>", "<missed keyword2>"],
      "suggested": [
        {
          "keyword": "<keyword>",
          "difficulty": "<Low|Medium|High>",
          "intent": "<user search intent>",
          "whereToPlace": "<title|subtitle|description>",
          "reasoning": "<why relevant for this app>"
        }
      ]
    },
    "roadmapActions": {
      "week1": [
        {
          "action": "<specific action>",
          "expectedOutcome": "<expected result>"
        }
      ],
      "month1": [
        {
          "action": "<strategic action>",
          "expectedOutcome": "<expected result>"
        }
      ],
      "quarter1": [
        {
          "action": "<long-term strategic action>",
          "expectedOutcome": "<expected result>"
        }
      ]
    }
  }
}

Return this structure as a JSON object for EACH app being analyzed. If multiple apps, return as array.`;
}

// Main comparison analysis endpoint
router.post('/compare', async (req, res) => {
  const { apps, userId, country = 'us' } = req.body;

  if (!apps || apps.length === 0) {
    return res.status(400).json({ error: 'At least one app required' });
  }

  try {
    // Get RAG knowledge
    const knowledge = await getRelevantASOKnowledge(
      apps.map(a => `${a.name} ${a.description}`).join(' '),
      5
    );

    // Build detailed prompt
    const systemPrompt = buildDetailedAnalysisPrompt(knowledge, country, apps);
    const userPrompt = `Analyze these ${apps.length} apps and provide detailed ASO insights.`;

    let analysisText = '';
    try {
      // Try Groq first
      console.log('[Analyze] Calling Groq for detailed analysis...');
      analysisText = await groq(systemPrompt, userPrompt);
    } catch (groqError) {
      console.warn('[Analyze] Groq failed, falling back to Gemini:', groqError.message);
      analysisText = await callGemini(systemPrompt, userPrompt);
    }

    // Parse JSON response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    // Normalize to array if single object
    const analysisArray = Array.isArray(analysisData) ? analysisData : [analysisData];

    // Ensure each app has analysis
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

    // Save to history if userId provided
    if (userId) {
      const { error: saveError } = await supabase
        .from('analysis_history')
        .insert({
          user_id: userId,
          apps_analyzed: apps.map(a => a.name).join(', '),
          report: report,
          app_count: apps.length,
          winner: analysisArray[0]?.overview?.overallScore > (analysisArray[1]?.overview?.overallScore || 0) ? apps[0].name : apps[1]?.name,
          country
        });

      if (saveError) {
        console.error('[Analyze] Save history error:', saveError);
      }
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
