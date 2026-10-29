
# qualify. — AI Resume Analyzer

qualify. is a resume analysis tool that compares a resume against a job description and shows which requirements are supported by the applicant's experience. Instead of giving users a match score, I wanted to show exactly what evidence was found in their resume, what was missing, and what they could improve.

**Live demo:** https://qualify-rho.vercel.app/

## Features

- Upload a PDF or TXT resume, or paste resume text directly.
- Paste a job description to analyze.
- Extract required and preferred job qualifications.
- Classify requirements as Supported, Partially supported, Not demonstrated, or Needs review.
- Show supporting evidence from the original resume.
- Suggest next steps for improving or clarifying the resume.
- Filter results by classification and export the analysis as JSON.

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

Open http://localhost:5173.

Use the included `sample_resume.txt` and `sample_job.txt` for a first test.

### Tests

From the project root:

```bash
python3 test_engine.py
```

## Architecture

The frontend uses React, TypeScript, and Vite. The backend uses Python and FastAPI, with Gemini 3.5 Flash Lite for semantic analysis.

1. FastAPI accepts a pasted job description and either uploaded or pasted resume text.
2. Python extracts the resume text and assigns an ID to each passage.
3. Gemini extracts job requirements, identifies whether they are required or preferred, selects relevant resume passage IDs, and suggests next steps.
4. Python validates the returned job requirements and passage IDs against the original input. The displayed resume evidence comes directly from the source text rather than AI-generated quotations.
5. React displays the requirements, classifications, supporting evidence, and suggestions.

I chose to use AI for requirement extraction and semantic matching because job descriptions and resumes can describe the same skill in different ways. I used deterministic Python validation for evidence retrieval so the model cannot simply invent resume quotations.

However, verifying that a passage exists does not guarantee that Gemini interpreted it correctly.

## Classification Categories

- **Supported:** The resume provides evidence that appears to meet the requirement.
- **Partially supported:** The resume demonstrates some, but not all, aspects of the requirement.
- **Not demonstrated:** The requirement is not demonstrated in the resume. This does not necessarily mean the applicant lacks the skill.
- **Needs review:** The evidence or classification needs additional human review.

## Limitations and Transparency

- AI performs the actual requirement extraction and semantic matching, so classifications can vary between runs.
- Evidence validation confirms that the displayed text came from the resume, but it does not guarantee that the classification is correct.
- Requirements involving specific quantities, such as years of professional experience, can be difficult for the model to interpret consistently.
- PDF extraction works for text-based PDFs, but not scanned images.
- Some PDF formatting and line breaks may cause resume evidence to appear incomplete.
- The app does not generate ATS scores, hiring predictions, or eligibility decisions.
- There are no user accounts or saved analysis histories. Resume and job description text is sent to Gemini for processing, so users should avoid submitting sensitive personal information.
- The backend is hosted on Render's free tier, which may take additional time to respond after inactivity.

## Future Improvements

If I had more time, I would focus on improving classification consistency, especially for measurable requirements like years of experience. I would also improve PDF text extraction so resume bullets are displayed as complete passages.

Another priority would be building a larger test dataset with expected classifications. This would make it easier to measure accuracy and identify where the model makes mistakes.

For a production version, I would also add rate limiting, stronger privacy protections, and better handling of temporary Gemini API errors.

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **AI:** Google Gemini 3.5 Flash Lite

The Gemini API key is stored as a backend environment variable rather than being exposed in the frontend.

## Development Transparency

This project was built as a prototype for the MiraFlores AI Engineer case study.

AI coding assistance was used during development for implementation, debugging, and refining the application. Gemini is also used as the runtime model for resume analysis.

The deployed application performs real AI analysis rather than returning mocked results. Authentication, persistent storage, and production-level request limiting were left outside the MVP scope.

**Development time:** [Add actual time spent]

**Reused code:** [Add any reused code or templates, or state none if applicable]
