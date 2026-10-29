# Evidence — AI Job Application Analyzer

React + FastAPI + Gemini semantic matching. Unlike the first prototype, **Gemini performs the actual requirement extraction and evidence assessment**. Python validates every quoted job and resume passage against the source text and removes unsupported job requirements. The model's interpretation is still fallible and should be reviewed.

## Setup

### Backend (Terminal 1)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export GEMINI_API_KEY='your-key-here'
uvicorn main:app --reload
```
Do not commit your API key. For Windows, use the corresponding environment variable syntax.

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Use the included `sample_resume.txt` and `sample_job.txt` for a first test.

### Tests
```bash
python3 test_engine.py
```

## Architecture
1. FastAPI parses text/PDF resumes and accepts a pasted job posting.
2. Gemini 2.5 Flash extracts job requirements, labels priority, finds supporting resume passages, and suggests honest next steps in structured JSON.
3. Python validates the JSON schema and checks that each cited quote exists verbatim (ignoring whitespace/case) in its source. Unverifiable job requirements are dropped; unverifiable resume quotes are removed and statuses downgraded to Not demonstrated.
4. React displays requirements, evidence, and improvement suggestions.

## Limitations and transparency
- AI is used for semantic matching, not just writing summaries.
- Exact quote verification is **not** proof that the model's interpretation is correct. Review classifications manually.
- No invented ATS scores, eligibility determinations, or hiring predictions.
- PDF extraction works for text PDFs, not scanned images.
- No accounts or storage; the backend sends document text to Gemini for processing. Avoid uploading sensitive personal information.
- No live Gemini API call or browser build has been verified in this environment. Automated validation tests passed.
- The frontend is a prototype; the old optional AI coaching endpoint was intentionally removed in favor of a single real AI analysis path.
