import sys
sys.path.insert(0,'backend')
from engine import validate_report
resume='Built a React dashboard and integrated existing REST endpoints using JavaScript.'
job='Required: Python programming experience and REST API development. Preferred: React experience.'
raw={'requirements':[{'requirement':'React','priority':'Preferred','job_quote':'React experience','resume_quote':'Built a React dashboard','status':'Supported','next_step':'Highlight the React dashboard.'},{'requirement':'Python','priority':'Required','job_quote':'Python programming experience','resume_quote':'Used Python professionally','status':'Supported','next_step':'Add Python experience.'},{'requirement':'Fabricated','job_quote':'Kubernetes architect','resume_quote':None,'status':'Supported','next_step':'N/A'}]}
report=validate_report(raw,resume,job)
assert len(report['requirements'])==2
assert report['requirements'][0]['status']=='Supported'
assert report['requirements'][1]['status']=='Needs review'
assert report['requirements'][1]['resume_quote'] is None
print('PASS: verified evidence, flagged fabricated quote for review, rejected fabricated job requirement')
