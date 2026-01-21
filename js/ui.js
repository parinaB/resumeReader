const HIDDEN_CLASS = "hidden";

const getElement = (id) => document.getElementById(id);

const setText = (id, value) => {
  const element = getElement(id);
  if (element) {
    element.textContent = value;
  }
};

const setHidden = (id, hidden) => {
  const element = getElement(id);
  if (element) {
    element.classList.toggle(HIDDEN_CLASS, hidden);
  }
};

const createListItems = (items) => {
  const fragment = document.createDocumentFragment();
  if (!items || items.length === 0) {
    const listItem = document.createElement("li");
    listItem.textContent = "None provided.";
    fragment.appendChild(listItem);
    return fragment;
  }
  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    fragment.appendChild(listItem);
  });
  return fragment;
};

export const setFeedback = (id, message, type = "info") => {
  const element = getElement(id);
  if (!element) {
    return;
  }
  element.textContent = message;
  element.dataset.type = type;
};

export const clearFeedback = (id) => {
  setFeedback(id, "");
};

export const setLoadingState = (isLoading) => {
  setHidden("analysis-loading", !isLoading);
  setHidden("score-spinner", !isLoading);
  setHidden("analysis-score", isLoading);
  if (isLoading) {
    setAnalysisVisibility(true);
    setAnalysisEmptyState(false);
  }
};

export const setAnalysisEmptyState = (showEmpty) => {
  setHidden("analysis-empty", !showEmpty);
};

export const setAnalysisVisibility = (show) => {
  setHidden("analysis-results", !show);
};

export const renderCurrentUser = (user) => {
  if (!user) {
    return;
  }
  setText("current-user", user.username);
};

export const renderAnalysis = (analysis) => {
  if (!analysis) {
    setAnalysisVisibility(false);
    setAnalysisEmptyState(true);
    return;
  }
  setText("analysis-score", `${analysis.score}`);
  const strengths = getElement("analysis-strengths");
  const weaknesses = getElement("analysis-weaknesses");
  const missing = getElement("analysis-missing");
  const improvements = getElement("analysis-improvements");
  strengths.replaceChildren(createListItems(analysis.strengths));
  weaknesses.replaceChildren(createListItems(analysis.weaknesses));
  missing.replaceChildren(createListItems(analysis.missingSections));
  improvements.replaceChildren(createListItems(analysis.improvements));
  setAnalysisVisibility(true);
  setAnalysisEmptyState(false);
};
