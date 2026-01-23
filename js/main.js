import { handleLogin, handleSignup, checkAuth, logoutUser } from "./auth.js";
import { handleFileUpload, validateResumeText } from "./resume.js";
import { sendResumeToAI } from "./ai.js";
import {
  setFeedback,
  clearFeedback,
  setLoadingState,
  renderAnalysis,
  setAnalysisEmptyState,
  renderCurrentUser,
} from "./ui.js";

const appState = {
  user: null,
  resumeText: "",
  analysis: null,
  loading: false,
  error: null,
};

const setLoading = (value) => {
  appState.loading = value;
  setLoadingState(value);
};

const setError = (id, message) => {
  appState.error = message;
  if (message) {
    setFeedback(id, message, "error");
  } else {
    clearFeedback(id);
  }
};

const redirectTo = (path) => {
  window.location.href = path;
};

const initAuthPages = () => {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setError("login-feedback", "");
      const username = document.getElementById("login-username").value;
      const password = document.getElementById("login-password").value;
      try {
        setFeedback("login-feedback", "Signing in...", "info");
        appState.user = await handleLogin(username, password);
        redirectTo("./dashboard.html");
      } catch (error) {
        setError("login-feedback", error.message);
      }
    });
  }
  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setError("signup-feedback", "");
      const username = document.getElementById("signup-username").value;
      const password = document.getElementById("signup-password").value;
      try {
        setFeedback("signup-feedback", "Creating account...", "info");
        appState.user = await handleSignup(username, password);
        redirectTo("./dashboard.html");
      } catch (error) {
        setError("signup-feedback", error.message);
      }
    });
  }
};

const initDashboard = () => {
  const fileInput = document.getElementById("resume-file");
  const textInput = document.getElementById("resume-text");
  const analyzeButton = document.getElementById("analyze-button");
  const logoutButton = document.getElementById("logout-button");

  renderCurrentUser(appState.user);
  setAnalysisEmptyState(true);

  if (fileInput) {
    fileInput.addEventListener("change", async (event) => {
      setError("file-feedback", "");
      const file = event.target.files[0];
      try {
        setFeedback("file-feedback", "Extracting text...", "info");
        const extracted = await handleFileUpload(file);
        appState.resumeText = extracted;
        if (!textInput.value.trim()) {
          textInput.value = extracted.slice(0, 2000);
        }
        setFeedback("file-feedback", "Resume text extracted successfully.", "success");
      } catch (error) {
        setError("file-feedback", error.message);
      }
    });
  }

  if (textInput) {
    textInput.addEventListener("input", (event) => {
      appState.resumeText = event.target.value;
    });
  }

  if (analyzeButton) {
  analyzeButton.addEventListener("click", async () => {
    setError("analysis-feedback", "");
    setLoading(true);
    try {
      const inputText = textInput.value.trim() || appState.resumeText;
      const cleanedText = validateResumeText(inputText);

      // You can hardcode or add UI to select provider
      // For now: use default from config
      const analysis = await sendResumeToAI(cleanedText);  // ← no change needed, uses DEFAULT_PROVIDER

      // Optional: to try a specific one → sendResumeToAI(cleanedText, 'cohere')

      appState.analysis = analysis;
      renderAnalysis(analysis);
      setFeedback("analysis-feedback", `Analysis complete (via ${analysis.provider || 'provider'}).`, "success");
    } catch (error) {
      setError("analysis-feedback", error.message);
    } finally {
      setLoading(false);
    }
  });
}

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      logoutUser();
      redirectTo("./index.html");
    });
  }
};

const init = () => {
  const page = document.body.dataset.page;
  const currentUser = checkAuth();
  appState.user = currentUser;

  if (page === "dashboard" && !currentUser) {
    redirectTo("./index.html");
    return;
  }
  if ((page === "login" || page === "signup") && currentUser) {
    redirectTo("./dashboard.html");
    return;
  }
  if (page === "login" || page === "signup") {
    initAuthPages();
  }
  if (page === "dashboard") {
    initDashboard();
  }
};

init();
