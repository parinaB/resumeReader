# Resume Reader

A simple web application that lets you upload or paste your resume and get instant AI-powered feedback:  
score (0–100), strengths, weaknesses, suggested improvements, and missing sections.

**Currently supports:** OpenAI, Cohere, AI21 (you pick which provider to use)

## Features

- Upload PDF / DOCX / TXT resume or paste plain text
- Automatic text extraction from files
- Clean dashboard UI
- Basic login / signup (stored in localStorage)
- Structured JSON output from multiple LLMs
- Easy to switch AI providers in `js/config.js`


## How to Run Locally (2 minutes)

1. Clone the repository

   ```bash
   git clone https://github.com/YOUR_USERNAME/resumeReader.git
   cd resumeReader
    ```

2. Add your own API keys in js/config.jsOpen js/config.js and replace the placeholder strings with real keys:
   openai: {
     apiKey: "sk-YourRealOpenAIKeyHere123...",   // ← paste your key
      ...
   },
  cohere: {
    apiKey: "YourCohereKeyHere...",             // ← paste your key
    ...
  },
  ai21: {
    apiKey: "YourAI21KeyHere...",               // ← paste your key
    ...
  }
  Get free/trial keys from:
  OpenAI: https://platform.openai.com/account/api-keys
  Cohere: https://dashboard.cohere.com/api-keys
  AI21:   https://studio.ai21.com/account/api-keys

3. Open the project
   Double-click index.html (simple way)
   Recommended: Use VS Code → right-click → "Open with Live Server"
   Or run: python -m http.server (or any static server)

4. Flow:
   Sign up / log in
   Go to dashboard
   Upload resume or paste text
   Click "Analyze"


## Important Notes

This is currently frontend-only.
  Direct API calls from browser → may hit CORS errors or require the "dangerous browser header" for Anthropic-style APIs.
  Never commit real API keys — always use placeholders in the repo.
  js/server.js (if present) is a backend proxy example → for production use (hides keys).

## ScreenShots of working 
  - Sample Resume1: <img width="1710" height="990" alt="Screenshot 2026-01-23 at 3 35 31 PM" src="https://github.com/user-attachments/assets/707978e0-56ce-435e-a901-6b69fabc799f" />
  - Sample Resume2 : <img width="1710" height="989" alt="Screenshot 2026-01-23 at 3 36 42 PM" src="https://github.com/user-attachments/assets/e7b54df0-efc0-45a3-82a8-d680af0687eb" />


  

## Folder Structure 

-  resumeReader/
- ├── index.html          # Login page
- ├── signup.html
- ├── dashboard.html      # Upload + analysis page
- ├── css/                # styles
- ├── js/
- │   ├── ai.js           # LLM calls & parsing
- │   ├── auth.js         # login/signup
- │   ├── config.js       # ← EDIT THIS with your keys!
- │   ├── main.js         # app logic
- │   ├── resume.js       # file handling
- │   └── ui.js           # rendering
- ├── .gitignore
- └── README.md


## Tech Used

- HTML5 + CSS3 + Vanilla JavaScript
- FileReader API (text extraction)
- Fetch API (LLM calls)
- LocalStorage (simple auth)

## Future Plans / Ideas

- Deploy live version (Vercel / Netlify / GitHub Pages)
- Add backend proxy to hide API keys properly
- Rate limiting & daily quota
- Export analysis as PDF
- Add more providers (Grok, Gemini, Claude, etc.)
