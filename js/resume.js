const PDF_WORKER_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js";

const ensurePdfWorker = () => {
  if (!window.pdfjsLib) {
    throw new Error("PDF reader failed to load.");
  }
  if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
  }
};

export const validateResumeText = (text) => {
  if (!text || text.trim().length < 200) {
    throw new Error("Resume text is too short. Please provide more details.");
  }
  return text.trim();
};

export const extractTextFromPDF = async (file) => {
  ensurePdfWorker();
  const buffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
  const pageTexts = [];
  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    pageTexts.push(pageText);
  }
  return pageTexts.join("\n");
};

export const handleFileUpload = async (file) => {
  if (!file) {
    throw new Error("Please select a PDF file.");
  }
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported.");
  }
  const text = await extractTextFromPDF(file);
  return validateResumeText(text);
};
