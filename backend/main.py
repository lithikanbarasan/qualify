from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from engine import analyze, extract_pdf

app=FastAPI(title='Evidence API',version='2.0')
app.add_middleware(CORSMiddleware,allow_origins=['http://localhost:5173','http://127.0.0.1:5173'],allow_methods=['GET','POST'],allow_headers=['*'])

@app.get('/api/health')
def health(): return {'status':'ok'}

@app.post('/api/analyze')
async def analyze_application(job:str=Form(...),resume_text:str=Form(''),resume_file:UploadFile|None=File(None)):
    try:
        resume=resume_text
        if resume_file is not None and resume_file.filename:
            raw=await resume_file.read(2_000_001)
            if len(raw)>2_000_000: raise ValueError('File exceeds 2 MB limit.')
            if resume_file.filename.lower().endswith('.pdf'): resume=extract_pdf(raw)
            elif resume_file.filename.lower().endswith('.txt'): resume=raw.decode('utf-8-sig')
            else: raise ValueError('Only PDF and TXT resumes are supported.')
        return analyze(resume,job)
    except (ValueError,UnicodeError) as exc: raise HTTPException(status_code=422,detail=str(exc))
    except RuntimeError as exc: raise HTTPException(status_code=502,detail=str(exc))
