export const CONFIG = {
  // Pick one provider to use by default (change this to switch)
  DEFAULT_PROVIDER: 'openai', // or 'ai21' or 'cohere'

  providers: {
    openai: {
      apiKey: "Paste your OpenAI API key here (get from platform.openai.com)",           // ← paste your OpenAI key
      model: "gpt-4o-mini",                         // cheap & good, or gpt-4o, gpt-5-mini etc.
      endpoint: "https://api.openai.com/v1/chat/completions",
      dangerousHeader: false,                       // OpenAI allows browser calls
    },
    ai21: {
      apiKey: "Paste your AI21 API key here (studio.ai21.com)",              // ← from https://studio.ai21.com/account/api-keys
      model: "jamba-1.6-large",                     // or jamba-instruct, check latest at ai21.com
      endpoint: "https://api.ai21.com/studio/v1/jamba/chat",  // AI21 chat endpoint (adjust if changed)
      dangerousHeader: false,                       // AI21 generally allows
    },
    cohere: {
      apiKey: "Paste your Cohere API key here (dashboard.cohere.com)",               // ← from dashboard.cohere.com/api-keys
      model: "command-a-03-2025",                   // or command-r-plus, check docs.cohere.com
      endpoint: "https://api.cohere.com/v2/chat",
      dangerousHeader: false,
    },
    // If you want to keep Anthropic as fallback later:
    // anthropic: { ... same as before with 'anthropic-dangerous-direct-browser-access': 'true' }
  },

  MAX_TOKENS: 1500,
};

// Optional: cycle through providers if one fails (e.g. rate limit / low credits)
export const getProviderConfig = (preferred = CONFIG.DEFAULT_PROVIDER) => {
  return CONFIG.providers[preferred] || CONFIG.providers.openai; // fallback
};

// Simple check (expand if needed)
export const isConfigured = (providerName = CONFIG.DEFAULT_PROVIDER) => {
  const prov = CONFIG.providers[providerName];
  if (!prov) return false;
  const key = (prov.apiKey || '').trim();
  return key.length > 20 && !key.includes('Your') && key.length > 30;
};