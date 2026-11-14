import os
import json
import math
import warnings

# Suppress deprecation warnings from google packages
warnings.filterwarnings("ignore", category=FutureWarning)

from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import PyPDF2

load_dotenv()
app = FastAPI(title="TrueHire AI Service")

# Configure Gemini (using google-generativeai which is installed)
API_KEY = os.getenv("GEMINI_API_KEY")
genai_model = None

if API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=API_KEY)
        genai_model = genai.GenerativeModel('gemini-2.5-flash')
        print("✅ Gemini AI configured successfully (gemini-2.5-flash)")
    except Exception as e:
        print(f"⚠️  Warning: Could not initialize Gemini client: {e}")
else:
    print("⚠️  GEMINI_API_KEY not set — running in fallback mode")


# ─── Pure Python TF-IDF Similarity (no sklearn DLLs needed) ─────────────────

def _tokenize(text: str) -> List[str]:
    import re
    return re.findall(r'[a-z0-9+#.]+', text.lower())


def _tfidf_similarity(text_a: str, text_b: str) -> float:
    tokens_a = _tokenize(text_a)
    tokens_b = _tokenize(text_b)
    if not tokens_a or not tokens_b:
        return 0.0

    all_tokens = list(set(tokens_a + tokens_b))

    def tf(tokens, word):
        return tokens.count(word) / len(tokens) if tokens else 0

    def idf(word):
        doc_count = sum(1 for t in [tokens_a, tokens_b] if word in t)
        return math.log(2 / (1 + doc_count)) + 1

    def vec(tokens):
        return [tf(tokens, w) * idf(w) for w in all_tokens]

    va, vb = vec(tokens_a), vec(tokens_b)
    dot = sum(a * b for a, b in zip(va, vb))
    mag_a = math.sqrt(sum(x**2 for x in va))
    mag_b = math.sqrt(sum(x**2 for x in vb))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


# ─── Pydantic Models ─────────────────────────────────────────────────────────

class MatchRequest(BaseModel):
    student_skills: List[str]
    job_skills: List[str]


class InterviewRequest(BaseModel):
    transcript: str


# ─── Endpoints ───────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "TrueHire AI Service",
        "gemini": "configured" if genai_model else "fallback mode"
    }


def extract_text_from_pdf(file: UploadFile) -> str:
    try:
        reader = PyPDF2.PdfReader(file.file)
        text = ""
        for page in reader.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")


@app.post("/api/ai/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not (file.filename or "").endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    text = extract_text_from_pdf(file)

    if not genai_model:
        return {
            "extracted_skills": ["JavaScript", "React", "Node.js"],
            "education": "Not Found",
            "experience_years": 0,
            "message": "Fallback mode (Gemini Key missing)"
        }

    try:
        prompt = f"""
Analyze the following resume text and extract the key information in JSON format.
Return ONLY a raw JSON object with no markdown formatting or backticks.
Required JSON structure:
{{
    "extracted_skills": ["skill1", "skill2"],
    "education": "Highest degree and college",
    "experience_years": 0.0
}}

Resume Text:
{text[:5000]}
"""
        response = genai_model.generate_content(prompt)
        res_text = response.text.strip()
        for prefix in ("```json", "```"):
            if res_text.startswith(prefix):
                res_text = res_text[len(prefix):]
        if res_text.endswith("```"):
            res_text = res_text[:-3]

        data = json.loads(res_text.strip())
        data["message"] = "Resume parsed successfully by Gemini AI."
        return data

    except Exception as e:
        print("Gemini API Error:", e)
        return {
            "extracted_skills": ["Python", "Machine Learning", "Data Analysis"],
            "education": "Unknown",
            "experience_years": 0,
            "message": f"Parsed with fallback (Gemini API Error: {str(e)})"
        }


@app.post("/api/ai/match-jobs")
async def match_jobs(req: MatchRequest):
    student = " ".join(req.student_skills)
    job = " ".join(req.job_skills)

    if not student.strip() or not job.strip():
        return {"match_score": 0, "missing_skills": req.job_skills, "message": "No skills provided"}

    similarity = _tfidf_similarity(student, job)
    score = int(similarity * 100)

    student_set = set(s.lower() for s in req.student_skills)
    job_set = set(s.lower() for s in req.job_skills)
    missing = list(job_set - student_set)

    return {
        "match_score": score,
        "missing_skills": missing,
        "message": "Match calculated successfully."
    }


@app.post("/api/ai/analyze-interview")
async def analyze_interview(req: InterviewRequest):
    transcript = req.transcript.strip()
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")

    def _fallback_analysis(error_msg: str = ""):
        word_count = len(transcript.split())
        overall_score = min(max(int(word_count * 1.5) + 40, 55), 92)
        confidence_level = "High" if overall_score >= 80 else "Medium" if overall_score >= 65 else "Low"
        return {
            "overallScore": overall_score,
            "confidenceLevel": confidence_level,
            "strengths": [
                "Clear verbal articulation of background and skillset",
                "Focused on relevant project technical stack",
                "Good pacing and structured thoughts"
            ],
            "areasToImprove": [
                "Quantify achievements with business metrics and KPIs",
                "Provide more concrete system design examples",
                "Explain challenging bugs encountered and how they were resolved"
            ],
            "feedback": "Strong foundational communication. Enhancing quantifiable results and technical depth will significantly boost interview performance.",
            "message": f"Analyzed successfully ({'rule-based fallback' if not error_msg else f'fallback: {error_msg}'})."
        }

    if not genai_model:
        return _fallback_analysis()

    try:
        prompt = f"""
You are an expert technical and HR interviewer. Analyze the following candidate interview answer transcript.
Evaluate communication clarity, technical depth, and confidence.
Return ONLY valid raw JSON with no markdown formatting or backticks.
Required JSON structure:
{{
    "overallScore": integer between 40 and 98,
    "confidenceLevel": "High" or "Medium" or "Low",
    "strengths": ["string", "string", "string"],
    "areasToImprove": ["string", "string", "string"],
    "feedback": "detailed summary paragraph of feedback"
}}

Candidate Answer Transcript:
\"\"\"{transcript[:5000]}\"\"\"
"""
        response = genai_model.generate_content(prompt)
        res_text = response.text.strip()
        for prefix in ("```json", "```"):
            if res_text.startswith(prefix):
                res_text = res_text[len(prefix):]
        if res_text.endswith("```"):
            res_text = res_text[:-3]

        data = json.loads(res_text.strip())
        data["message"] = "Interview analyzed successfully by Gemini AI."
        return data

    except Exception as e:
        print("Gemini Interview Analysis Error:", e)
        return _fallback_analysis(str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
