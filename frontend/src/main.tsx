import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Upload,ArrowRight,Download,ChevronDown,CheckCircle2,AlertCircle,HelpCircle} from 'lucide-react';
import './style.css';

type Requirement={requirement:string;priority:string;job_quote:string;status:string;resume_quote:string|null;next_step:string};
type Report={requirements:Requirement[];summary:string;limitations:string[]};
type Filter='all'|'Supported'|'Partially supported'|'Not demonstrated'|'Needs review';

function App(){
 const [file,setFile]=useState<File|null>(null);
 const [resume,setResume]=useState('');
 const [job,setJob]=useState('');
 const [report,setReport]=useState<Report|null>(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [filter,setFilter]=useState<Filter>('all');
 const [expanded,setExpanded]=useState<Record<number,boolean>>({});
 
async function analyze(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError('');
  setReport(null);
  setExpanded({});
  setFilter('all');

  try {
    const form = new FormData();
    form.append('job', job);
    form.append('resume_text', resume);

    if (file) {
      form.append('resume_file', file);
    }

    const apiBase = import.meta.env.VITE_API_URL || '';

    const response = await fetch(`${apiBase}/api/analyze`, {
      method: 'POST',
      body: form,
    });
    // Handle API failures before attempting to parse JSON.
    if (!response.ok) {
      if (response.status === 503 || response.status === 502) {
        throw new Error(
          'Our AI service is temporarily busy. Please try again shortly.'
        );
      }

      // The backend may return JSON or plain text.
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(
          typeof errorData.detail === 'string'
            ? errorData.detail
            : 'Could not analyze these documents.'
        );
      }

      throw new Error(
        'Something went wrong while analyzing your resume. Please try again.'
      );
    }

    const data: Report = await response.json();

    setReport(data);

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);

  } catch (e) {
    setError(
      e instanceof Error
        ? e.message
        : 'Something went wrong. Please try again.'
    );
  } finally {
    setLoading(false);
  }
}

 function download(){
  if(!report)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='qualify-report.json';a.click();URL.revokeObjectURL(url);
 }
 const filters:Filter[]=['all','Supported','Partially supported','Not demonstrated','Needs review'];
 const counts=(status:Filter)=>report?.requirements.filter(r=>status==='all'||r.status===status).length||0;
 const visible=report?.requirements.map((r,i)=>({...r,index:i})).filter(r=>filter==='all'||r.status===filter)||[];
 return <div className="app">
  <header><div className="shell header"><div className="logo">qualify<span>.</span></div></div></header>
  <main className="shell">
   <div className="intro"><h1>Find your fit.</h1><p>Compare your resume to a job description.</p></div>
   <form onSubmit={analyze}>
    <div className="fields">
     <section className="field"><div className="field-title"><span className="number">1</span><h2>Resume</h2></div>
      <label className="upload" htmlFor="resume-file"><Upload size={20}/><span>{file?file.name:'Upload PDF or TXT'}</span><small>{file?'Click to replace':'Choose a file · 2 MB max'}</small></label>
      <input id="resume-file" type="file" accept=".pdf,.txt,application/pdf,text/plain" onChange={e=>setFile(e.target.files?.[0]||null)}/>
      {file?<button type="button" className="text-button" onClick={()=>setFile(null)}>Remove file</button>:<><div className="separator">or paste resume</div><textarea aria-label="Resume text" className="resume-text" placeholder="Paste resume text..." value={resume} onChange={e=>setResume(e.target.value)}/></>}
     </section>
     <section className="field"><div className="field-title"><span className="number">2</span><h2>Job description</h2></div>
      <textarea aria-label="Job description" className="job-text" placeholder="Paste the job description here..." value={job} onChange={e=>setJob(e.target.value)} required/>
     </section>
    </div>
    {error&&<p className="error" role="alert"><AlertCircle size={17}/>{error}</p>}
    <button type="submit" className="primary" disabled={loading||!job.trim()||(!file&&!resume.trim())}>{loading?'Analyzing…':'Analyze resume'}<ArrowRight size={18}/></button>
   </form>
   {report&&<section id="results" className="results">
    <div className="results-top"><div><h2>Analysis</h2><p>{report.requirements.length} job requirements reviewed</p></div><button type="button" className="download" onClick={download}><Download size={16}/> Export</button></div>
    <div className="summary">
     <div><strong>{counts('Supported')}</strong><span>Supported</span></div>
     <div><strong>{counts('Partially supported')}</strong><span>Partial</span></div>
     <div><strong>{counts('Not demonstrated')}</strong><span>Not shown</span></div>
     <div><strong>{counts('Needs review')}</strong><span>Review</span></div>
    </div>
    <div className="filters" aria-label="Filter results">{filters.map(f=><button type="button" key={f} className={filter===f?'selected':''} onClick={()=>setFilter(f)}>{f==='all'?'All':f==='Not demonstrated'?'Not shown':f==='Partially supported'?'Partial':f==='Needs review'?'Review':f} <span>{counts(f)}</span></button>)}</div>
    <div className="results-list">{visible.length?visible.map(r=><article className="item" key={r.index}>
      <button type="button" className="item-header" aria-expanded={!!expanded[r.index]} onClick={()=>setExpanded(v=>({...v,[r.index]:!v[r.index]}))}>
       <span className={'status-dot '+(r.status==='Supported'?'ok':r.status==='Not demonstrated'?'missing':'partial')}/>
       <span className="item-main"><strong>{r.requirement}</strong><small>{r.priority} · {r.status==='Not demonstrated'?'Not shown in resume':r.status}</small></span>
       <ChevronDown className={expanded[r.index]?'rotated':''} size={18}/>
      </button>
      {expanded[r.index]&&<div className="details">
       <div><span className="detail-label">Job requirement</span><p>{r.job_quote}</p></div>
       <div><span className="detail-label">Resume evidence</span><p>{r.resume_quote||'No verified passage found.'}</p></div>
       <div className="suggestion"><span className="detail-label">Suggested next step</span><p>{r.next_step}</p></div>
      </div>}
     </article>):<p className="empty">No requirements in this category.</p>}</div>
    
   </section>}
  </main>
 </div>
}
createRoot(document.getElementById('root')!).render(<App/>);
