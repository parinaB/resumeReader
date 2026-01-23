// ai.js
import { CONFIG, getProviderConfig, isConfigured } from './config.js';

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

export const sendResumeToAI = async (resumeText, preferredProvider = null) => {
  const providerName = preferredProvider || CONFIG.DEFAULT_PROVIDER;
  const prov = getProviderConfig(providerName);

  if (!prov) {
    throw new Error(`Provider '${providerName}' not found in config`);
  }

  if (!isConfigured(providerName)) {
    throw new Error(
      `API key for ${providerName.toUpperCase()} not configured properly. ` +
      `Check config.js → providers.${providerName}.apiKey (must be valid string, no placeholders)`
    );
  }

  try {
    // Standard OpenAI-compatible format (works for OpenAI + AI21)
    // Cohere v2 also supports messages array now
    const body = {
      model: prov.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze this resume:\n\n${resumeText}` },
      ],
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: 0.3,          // Low for structured JSON output
      top_p: 0.9,                // Optional: helps consistency
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${prov.apiKey}`,
    };

    // Provider-specific overrides (if any)
    if (providerName === 'cohere') {
      // Cohere v2 fully supports messages + system role (2025+)
      // No need for preamble/message split anymore
      // If older version needed: add 'preamble': SYSTEM_PROMPT and flatten messages
      // But current docs recommend messages array
    }
    // AI21 uses OpenAI-compatible format → no change needed

    const response = await fetch(prov.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errData = {};
      try {
        errData = await response.json();
      } catch {}
      const msg =
        errData.error?.message ||
        errData.message ||
        `HTTP ${response.status} ${response.statusText}`;
      
      let fullError = `[${providerName.toUpperCase()}] ${msg}`;
      if (response.status === 429) fullError += " (rate limit exceeded)";
      if (response.status === 402 || (response.status === 400 && /credit|balance/i.test(msg))) {
        fullError += " — low credits/balance; top up on provider dashboard";
      }
      throw new Error(fullError);
    }

    const data = await response.json();

    // Unified response parsing (OpenAI-compatible + Cohere v2 adjustments)
    let text = '';

    if (providerName === 'openai' || providerName === 'ai21') {
      // Standard: choices[0].message.content
      text = data.choices?.[0]?.message?.content || '';
    } else if (providerName === 'cohere') {
      // Cohere v2 chat: message.content is array → join text blocks
      const contentBlocks = data.message?.content || [];
      text = contentBlocks
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');
      // Fallback if older format
      if (!text && data.text) text = data.text;
    }

    if (!text.trim()) {
      throw new Error('No valid text content in AI response');
    }

    // Clean markdown/JSON fences
    text = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (parseErr) {
      console.error(`JSON parse failed for ${providerName}:`, text.substring(0, 200) + '...');
      throw new Error(`AI returned invalid JSON format from ${providerName}`);
    }

    // Validate required structure
    if (typeof analysis.score !== 'number') {
      throw new Error('Invalid response: missing or invalid "score"');
    }

    const requiredArrays = ['strengths', 'weaknesses', 'improvements', 'missingSections'];
    for (const key of requiredArrays) {
      if (!Array.isArray(analysis[key])) {
        throw new Error(`Invalid response: "${key}" must be an array`);
      }
    }

    // Clamp score
    analysis.score = Math.max(0, Math.min(100, Math.round(analysis.score)));

    return {
      ...analysis,
      provider: providerName, // helpful for UI/debug
    };

  } catch (error) {
    console.error(`Analysis failed [${providerName}]:`, error);
    throw error; // Let main.js display user-friendly message
  }
};