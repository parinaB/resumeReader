const env = window.__ENV || window.process?.env || {};
const getEnvValue = (...keys) => keys.map((key) => env[key]).find(Boolean);

const aiAPIs = [
  {
    name: "OpenAI",
    key: getEnvValue("OPENAI_API_KEY", "openai_api_key", "openai_API_KEY"),
    endpoint: "OPENAI_ENDPOINT_HERE",
  },
  {
    name: "Claude",
    key: getEnvValue("CLAUDE_API_KEY", "claude_api_key", "claude_API_KEY"),
    endpoint: "CLAUDE_ENDPOINT_HERE",
  },
  {
    name: "Cohere",
    key: getEnvValue("COHERE_API_KEY", "cohere_API_key", "cohere_ai_key", "cohere_AI_KEY"),
    endpoint: "COHERE_ENDPOINT_HERE",
  },
  {
    name: "Custom",
    key: getEnvValue("ANOTHER_AI_KEY", "another_ai_key", "another_AI_KEY"),
    endpoint: "ANOTHER_ENDPOINT_HERE",
  },
];

const normalizeResponse = (data) => {
  if (typeof data === "string") {
    return JSON.parse(data);
  }
  return data;
};

const setPartialWarning = () => {
  const feedback = document.getElementById("analysis-feedback");
  if (!feedback) {
    return;
  }
  feedback.textContent = "Some AI services failed, partial analysis shown.";
  feedback.dataset.type = "info";
};

export const parseAIResponse = (data) => {
  const parsed = normalizeResponse(data);
  if (!parsed || typeof parsed.score !== "number") {
    throw new Error("AI response format is invalid.");
  }
  const requiredArrays = ["strengths", "weaknesses", "missingSections", "improvements"];
  requiredArrays.forEach((key) => {
    if (!Array.isArray(parsed[key])) {
      throw new Error("AI response format is invalid.");
    }
  });
  return parsed;
};

export const mergeAndDeduplicate = (resultsArray, key) => {
  const seen = new Map();
  resultsArray.forEach((result) => {
    result[key].forEach((item) => {
      const normalized = item.trim().toLowerCase();
      if (!seen.has(normalized)) {
        seen.set(normalized, item);
      }
    });
  });
  return Array.from(seen.values());
};

export const mergeResults = (resultsArray) => {
  const total = resultsArray.reduce((sum, result) => sum + result.score, 0);
  const score = Math.round(total / resultsArray.length);
  return {
    score,
    strengths: mergeAndDeduplicate(resultsArray, "strengths"),
    weaknesses: mergeAndDeduplicate(resultsArray, "weaknesses"),
    improvements: mergeAndDeduplicate(resultsArray, "improvements"),
    missingSections: mergeAndDeduplicate(resultsArray, "missingSections"),
  };
};

export const sendToAPI = async (apiConfig, resumeText) => {
  if (!apiConfig.key) {
    return { name: apiConfig.name, ok: false, error: "Missing API key." };
  }
  if (!apiConfig.endpoint || apiConfig.endpoint.includes("ENDPOINT_HERE")) {
    return { name: apiConfig.name, ok: false, error: "Missing API endpoint." };
  }
  try {
    const response = await fetch(apiConfig.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiConfig.key}`,
        ...apiConfig.headers,
      },
      body: JSON.stringify({ resumeText }),
    });
    if (!response.ok) {
      throw new Error(`AI API error (${response.status})`);
    }
    const data = await response.json();
    return { name: apiConfig.name, ok: true, data: parseAIResponse(data) };
  } catch (error) {
    console.warn(`AI ${apiConfig.name} failed`, error);
    return { name: apiConfig.name, ok: false, error: error.message };
  }
};

export const sendResumeToAllAIs = async (resumeText) => {
  const results = await Promise.all(aiAPIs.map((api) => sendToAPI(api, resumeText)));
  const successful = results.filter((result) => result.ok).map((result) => result.data);
  if (successful.length === 0) {
    throw new Error("AI services unavailable.");
  }
  if (results.some((result) => !result.ok)) {
    setTimeout(() => setPartialWarning(), 0);
  }
  return mergeResults(successful);
};

export const sendResumeToAI = async (resumeText) => {
  try {
    return await sendResumeToAllAIs(resumeText);
  } catch (error) {
    throw new Error("Unable to analyze resume right now.");
  }
};
