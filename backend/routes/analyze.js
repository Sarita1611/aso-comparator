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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }],
        generationConfig: { temperature: 0.15, maxOutputTokens: 7000 }
      })
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gemini API error');
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function buildSystemPrompt(knowledge, country) {
  const countryName = COUNTRY_NAMES[country] || country.toUpperCase();
  return `You are a senior ASO consultant. Write reports like a sharp human expert — direct, specific, data-driven. Never generic.

MARKET: ${countryName}

KEY RULES:
1. Always quote actual title/subtitle text in quotation marks
2. Always give exact character counts (e.g. "title is 18/30 chars")
3. Name specific missing keywords — never say "add more keywords" without naming them
4. Never use: leverage, utilize, robust, comprehensive, seamlessly, streamline, game-changer
5. Screenshot analysis must state exact count vs maximum (e.g. "4 of 10 slots used")
6. Quote the first line of description and assess the fold (first 167 chars)
7. Recommendations must be copy-paste ready — show the actual suggested text
8. Keyword density = state exact count (e.g. "appears 3 times in 2800 chars = 0.1%")
9. Ratings: state exact number and compare to category benchmark
10. Roadmap actions must be specific tasks, not vague goals

ASO KNOWLEDGE:
${knowledge}

RETURN ONLY VALID JSON. Start directly with {. No markdown, no explanation.

JSON STRUCTURE:
{
  "market": "${countryName}",
  "apps": [{
    "name": "string",
    "platform": "ios|android",
    "overallScore": number,
    "grade": "A|B|C|D|F",
    "pillars": {
      "title": { "score": number, "currentValue": "actual title", "charCount": number, "maxChars": 30, "analysis": "quote title, char count, keyword position", "recommendation": "exact suggested title with char count" },
      "subtitle": { "score": number, "currentValue": "actual subtitle or MISSING", "charCount": number, "maxChars": 30, "analysis": "quote subtitle, keywords present/absent", "recommendation": "exact suggested subtitle" },
      "description": { "score": number, "charCount": number, "openingLine": "first sentence quoted", "foldText": "first 167 chars quoted", "keywordDensity": "keyword appears X times in Y chars", "analysis": "specific assessment with quotes and counts", "recommendation": "example rewrite of opening paragraph" },
      "visuals": { "score": number, "screenshotCount": number, "maxScreenshots": number, "hasVideo": boolean, "analysis": "exact count vs max, what screenshots show", "recommendation": "specific screenshot content suggestions" },
      "ratings": { "score": number, "currentRating": number, "totalReviews": number, "analysis": "exact rating + count + category benchmark comparison", "recommendation": "specific prompt timing strategy" },
      "updates": { "score": number, "lastUpdated": "date", "daysSinceUpdate": number, "analysis": "exact days and algorithm signal", "recommendation": "specific update frequency" },
      "category": { "score": number, "currentCategory": "name", "analysis": "category fit and competitive density", "recommendation": "specific suggestion if applicable" }
    },
    "strengths": ["specific with data", "specific with data", "specific with data"],
    "weaknesses": ["specific with data", "specific with data", "specific with data"],
    "quickWins": ["copy-paste ready action", "copy-paste ready action", "copy-paste ready action"],
    "longTermFixes": ["strategic action", "strategic action", "strategic action"],
    "estimatedImpact": "realistic % estimate with reasoning based on identified gaps",
    "keywordAnalysis": {
      "currentKeywords": ["keywords from title+subtitle+description"],
      "suggestedKeywords": [{ "keyword": "string", "reason": "why for this specific app+market", "difficulty": "Low|Medium|High", "intent": "user need", "whereToPut": "title|subtitle|description" }],
      "missedOpportunities": ["high-value keywords absent from listing"],
      "keywordDensityIssues": "exact assessment with numbers"
    },
    "improvementRoadmap": {
      "week1": ["specific task 1", "specific task 2", "specific task 3"],
      "month1": ["specific task 1", "specific task 2", "specific task 3"],
      "quarter1": ["specific task 1", "specific task 2", "specific task 3"]
    }
  }],
  "competitorGapAnalysis": {
    "sharedKeywords": ["string"],
    "uniqueKeywords": [{ "app": "string", "exclusiveKeywords": ["string"] }],
    "gapOpportunities": [{ "keyword": "string", "opportunity": "which app + where to add it", "estimatedVolume": "Low|Medium|High" }],
    "visualStrategyGaps": "specific observation",
    "descriptionGaps": "specific content missing across all apps"
  },
  "leaderboard": [{ "rank": 1, "name": "string", "score": number, "reason": "one sentence with specific data" }],
  "winner": "string",
  "winnerReason": "2-3 sentences citing specific metrics",
  "competitiveInsights": "2-3 sentences with specific patterns",
  "marketOpportunities": "2-3 sentences about ${countryName}-specific gaps",
  "executiveSummary": "3-4 sentences, specific and data-driven"
}`;
}

function buildUserPrompt(apps, country) {
  const countryName = COUNTRY_NAMES[country] || country.toUpperCase();
  // Trim description to reduce token count but keep enough for analysis
  const appsText = apps.map((app, i) => {
    const desc = app.description || '';
    const trimmedDesc = desc.length > 1200 ? desc.substring(0, 1200) + `... [${desc.length} total chars]` : desc;
    return `APP ${i + 1} — ${app.platform === 'ios' ? 'iOS App Store' : 'Android Google Play'}:
Title: "${app.title || app.name}" (${(app.title || app.name || '').length} chars)
Subtitle/Short Desc: "${app.subtitle || ''}" (${(app.subtitle || '').length} chars)
Developer: ${app.developer}
Category: ${app.category}
Rating: ${app.rating}/5.0 from ${(app.ratingCount || 0).toLocaleString()} reviews
Screenshots: ${app.screenshotCount} uploaded (max: ${app.platform === 'ios' ? 10 : 8})
Has video: ${app.hasVideo ? 'Yes' : 'No'}
Price: ${app.price}
Last updated: ${app.lastUpdated} (${app.daysSinceUpdate} days ago)
Installs: ${app.installs || 'Not shown (iOS)'}
Market: ${countryName}
Description (${desc.length} chars total):
"""
${trimmedDesc}
"""`;
  }).join('\n\n---\n\n');

  return `Audit these ${apps.length} app(s) for the ${countryName} market. Reference actual content — quote titles, count characters, name specific keywords. Return ONLY valid JSON.\n\n${appsText}`;
}

function calculateGrade(score) {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

function parseJSON(raw) {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in response');
  return JSON.parse(cleaned.substring(start, end + 1));
}

router.post('/compare', async (req, res) => {
  const { apps, userId, country = 'us' } = req.body;

  if (!apps || apps.length < 1 || apps.length > 4) {
    return res.status(400).json({ error: 'Please provide 1-4 apps to analyze' });
  }

  try {
    const countryName = COUNTRY_NAMES[country] || country.toUpperCase();
    console.log(`Analyzing ${apps.length} app(s) for ${countryName}...`);

    const knowledge = await getRelevantASOKnowledge(apps);
    const fallback = `Evaluate ASO: title (30 char limit, keyword placement), subtitle (30/80 chars), description (length, density, fold), visuals (screenshot count vs max), ratings (score + volume), update frequency, category fit.`;

    const systemPrompt = buildSystemPrompt(knowledge || fallback, country);
    const userPrompt = buildUserPrompt(apps, country);

    let rawResponse = null;
    let modelUsed = 'groq';

    // Try Groq first
    try {
      console.log('Trying Groq (llama-3.3-70b)...');
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.15,
        max_tokens: 6000,
      });
      rawResponse = completion.choices[0]?.message?.content;
      console.log('Groq succeeded');
    } catch (groqErr) {
      console.warn('Groq failed:', groqErr.message);

      // Fallback to Gemini
      if (process.env.GEMINI_API_KEY) {
        try {
          console.log('Falling back to Gemini...');
          rawResponse = await callGemini(systemPrompt, userPrompt);
          modelUsed = 'gemini';
          console.log('Gemini succeeded');
        } catch (geminiErr) {
          console.error('Gemini also failed:', geminiErr.message);
          throw new Error('Both AI providers are currently rate limited. Please wait 60 seconds and try again.');
        }
      } else {
        // Try smaller Groq model
        try {
          console.log('Trying Groq fallback model (llama-3.1-8b)...');
          const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.15,
            max_tokens: 5000,
          });
          rawResponse = completion.choices[0]?.message?.content;
          modelUsed = 'groq-8b';
          console.log('Groq 8b fallback succeeded');
        } catch (fallbackErr) {
          throw new Error('AI rate limit reached. Please wait 60 seconds and try again, or add a GEMINI_API_KEY to your .env for a second provider.');
        }
      }
    }

    if (!rawResponse) throw new Error('No response from AI. Please try again.');

    let report;
    try {
      report = parseJSON(rawResponse);
    } catch (parseErr) {
      console.error('JSON parse error. Raw snippet:', rawResponse?.substring(0, 300));
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Ensure grades + platform labels
    if (report.apps) {
      report.apps = report.apps.map(app => ({
        ...app,
        grade: app.grade || calculateGrade(app.overallScore),
        platformLabel: app.platform === 'ios' ? 'App Store' : 'Google Play',
      }));
    }

    report._modelUsed = modelUsed;

    // Save to history
    if (userId) {
      console.log(`Saving to history for user: ${userId}`);
      const { data: savedData, error: historyError } = await supabase
        .from('analysis_history')
        .insert({
          user_id: userId,
          apps_analyzed: apps.map(a => ({
            name: a.name || a.title,
            platform: a.platform,
            icon: a.icon || '',
            country,
          })),
          report,
          app_count: apps.length,
          winner: report.winner || '',
          country,
          created_at: new Date().toISOString()
        })
        .select();

      if (historyError) {
        console.error('HISTORY SAVE FAILED:', JSON.stringify(historyError));
      } else {
        console.log('History saved, id:', savedData?.[0]?.id);
      }
    } else {
      console.log('No userId — not saving history (user not logged in)');
    }

    res.json({ success: true, report, apps, modelUsed });

  } catch (err) {
    console.error('Analysis error:', err.message);
    res.status(500).json({ error: err.message || 'Analysis failed. Please try again.' });
  }
});

export default router;
