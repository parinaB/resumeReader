// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // or use native fetch if Node >=18

const app = express();
app.use(cors({ origin: '*' })); // Adjust to your frontend origin in production, e.g. 'http://localhost:5500'
app.use(express.json());

// Provider configs (keys from .env — never hardcode!)
const providers = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini', // or 'gpt-4o', 'gpt-4.1-mini' etc. — cheap & good for resume analysis
    endpoint: 'https://api.openai.com/v1/chat/completions',
    headers: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
  },
  cohere: {
    apiKey: process.env.COHERE_API_KEY,
    model: 'command-a-03-2025', // or 'command-r-plus' — check https://docs.cohere.com
    endpoint: 'https://api.cohere.com/v2/chat',
    headers: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
  },
  ai21: {
    apiKey: process.env.AI21_API_KEY,
    model: 'jamba-1.6-large', // or 'jamba-large', 'jamba-1.5-large' — check https://docs.ai21.com
    endpoint: 'https://api.ai21.com/studio/v1/chat/completions', // Standard chat completions style
    headers: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }),
  },
};

const SYSTEM_PROMPT = `You are a professional resume analyzer. Analyze resumes and provide constructive feedback.

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "score": <number between 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["specific improvement1", "specific improvement2", "specific improvement3"],
  "missingSections": ["section1", "section2"]
}

Be specific and actionable in your feedback.`;

app.post('/analyze', async (req, res) => {
  const { resumeText, provider = 'openai' } = req.body; // Frontend can specify provider

  if (!resumeText) {
    return res.status(400).json({ error: 'No resume text provided' });
  }

  const prov = providers[provider.toLowerCase()];
  if (!prov) {
    return res.status(400).json({ error: `Unknown provider: ${provider}. Use 'openai', 'cohere', or 'ai21'` });
  }

  if (!prov.apiKey) {
    return res.status(500).json({ error: `API key for ${provider} not set in .env` });
  }

  try {
    let body;
    if (provider === 'cohere') {
      // Cohere v2 chat format is a bit different
      body = {
        model: prov.model,
        message: `Analyze this resume:\n\n${resumeText}`,
        preamble: SYSTEM_PROMPT, // system prompt goes here
        max_tokens: 1500,
      };
    } else {
      // OpenAI & AI21 use standard chat/completions style
      body = {
        model: prov.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Analyze this resume:\n\n${resumeText}` },
        ],
        max_tokens: 1500,
        temperature: 0.7, // optional: adjust for creativity
      };
    }

    const response = await fetch(prov.endpoint, {
      method: 'POST',
      headers: prov.headers(prov.apiKey),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errData;
      try {
        errData = await response.json();
      } catch {}
      const msg = errData?.error?.message || errData?.message || `HTTP ${response.status}`;
      return res.status(response.status).json({
        error: `[${provider.toUpperCase()}] ${msg} — check credits/balance on their dashboard`,
      });
    }

    const data = await response.json();

    // Extract text content (provider-specific)
    let text = '';
    if (provider === 'openai') {
      text = data.choices?.[0]?.message?.content || '';
    } else if (provider === 'cohere') {
      text = data.text || data.message || '';
    } else if (provider === 'ai21') {
      text = data.choices?.[0]?.message?.content || data.outputs?.[0]?.text || '';
    }

    if (!text) {
      return res.status(500).json({ error: 'No content returned from AI' });
    }

    // Clean and parse JSON
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (parseErr) {
      console.error('JSON parse failed:', text);
      return res.status(500).json({ error: 'AI returned invalid JSON format' });
    }

    // Basic validation
    if (typeof analysis.score !== 'number' || !Array.isArray(analysis.strengths)) {
      return res.status(500).json({ error: 'Invalid analysis structure from AI' });
    }

    analysis.score = Math.max(0, Math.min(100, analysis.score));

    res.json(analysis);

  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Server error during analysis' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));