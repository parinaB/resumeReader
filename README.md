# Resume Analyzer (Frontend Only)

## Project Overview
Resume Analyzer is a frontend-only web app that lets users sign up, upload or paste resumes, and receive AI-based scoring with improvement suggestions. It uses browser storage for authentication and client-side PDF parsing for text extraction.

## Features
- Frontend-only signup and login with SHA-256 password hashing
- LocalStorage user persistence and session handling
- PDF resume upload with client-side text extraction
- Manual resume text input
- AI analysis with score, strengths, weaknesses, missing sections, and improvements
- Loading, success, and error feedback states

## Tech Stack
- HTML, CSS, and Vanilla JavaScript (ES modules)
- Web Crypto API for password hashing
- PDF.js for PDF text extraction

## Setup Instructions
1. Clone the repository.
2. Ensure you serve the files via a local web server (required for ES modules).
3. Add your API key values to `.env`.
4. Open `index.html` via the server and create a new account.

## Environment Variables
Set the following in `.env`:
```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
CLAUDE_API_KEY=YOUR_CLAUDE_API_KEY_HERE
COHERE_API_KEY=YOUR_COHERE_API_KEY_HERE
ANOTHER_AI_KEY=YOUR_NEW_AI_KEY_HERE
PDF_API_KEY=YOUR_PDF_API_KEY_HERE
```

## Security Notes
- This project is frontend-only and stores hashed passwords in LocalStorage.
- LocalStorage is not secure for production authentication; use a proper backend for real deployments.
- API keys must never be hardcoded in source files.

## Future Improvements
- Add job description matching
- Export analysis to PDF
- Add resume comparison and historical tracking
- Add dark mode
