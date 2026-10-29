import os
import re
import json
from collections import Counter
import math

# Try importing PDF and DOCX libraries
try:
    from pypdf import PdfReader
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False


# Comprehensive Skills Knowledge Base (Canonical names and aliases)
SKILLS_KNOWLEDGE_BASE = {
    # Programming Languages
    "python": ["python", "python3", "py"],
    "javascript": ["javascript", "js", "ecmascript"],
    "typescript": ["typescript", "ts"],
    "java": ["java", "core java", "j2ee"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "csharp", ".net"],
    "go": ["golang", "go programming"],
    "rust": ["rust"],
    "ruby": ["ruby"],
    "php": ["php"],
    "swift": ["swift"],
    "kotlin": ["kotlin"],
    "sql": ["sql", "t-sql", "pl/sql"],
    "html": ["html", "html5"],
    "css": ["css", "css3"],
    "bash": ["bash", "shell scripting", "powershell"],
    "r": ["r language", "r programming"],
    "dart": ["dart", "flutter"],
    "scala": ["scala"],
    
    # Frameworks & Libraries
    "react": ["react", "react.js", "reactjs"],
    "node.js": ["node", "node.js", "nodejs"],
    "express": ["express", "express.js", "expressjs"],
    "next.js": ["next.js", "nextjs"],
    "vue.js": ["vue", "vue.js", "vuejs"],
    "angular": ["angular", "angularjs"],
    "django": ["django", "django rest framework", "drf"],
    "flask": ["flask"],
    "fastapi": ["fastapi"],
    "spring boot": ["spring", "spring boot", "springboot", "spring mvc"],
    "asp.net": ["asp.net", "asp.net core", "dotnet core"],
    "ruby on rails": ["rails", "ruby on rails"],
    "tailwind css": ["tailwind", "tailwindcss"],
    "bootstrap": ["bootstrap"],
    "redux": ["redux", "redux toolkit"],
    "graphql": ["graphql", "apollo graphql"],
    "rest apis": ["rest", "restful", "rest api", "web apis", "restful api"],
    
    # Databases & Storage
    "postgresql": ["postgres", "postgresql"],
    "mysql": ["mysql"],
    "mongodb": ["mongo", "mongodb"],
    "redis": ["redis"],
    "sqlite": ["sqlite", "sqlite3"],
    "oracle": ["oracle db", "oracle database"],
    "elasticsearch": ["elasticsearch", "elastic search"],
    "dynamodb": ["dynamodb"],
    "firebase": ["firebase", "firestore"],
    
    # Cloud, DevOps & Infrastructure
    "aws": ["aws", "amazon web services", "ec2", "s3", "lambda"],
    "azure": ["azure", "microsoft azure"],
    "gcp": ["gcp", "google cloud", "google cloud platform"],
    "docker": ["docker", "containerization"],
    "kubernetes": ["k8s", "kubernetes"],
    "ci/cd": ["ci/cd", "continuous integration", "github actions", "gitlab ci", "jenkins"],
    "git": ["git", "github", "gitlab", "version control"],
    "terraform": ["terraform"],
    "linux": ["linux", "ubuntu", "debian", "centos"],
    "nginx": ["nginx"],
    "microservices": ["microservices", "microservice architecture"],
    
    # AI / Machine Learning / Data Science
    "machine learning": ["machine learning", "ml"],
    "deep learning": ["deep learning"],
    "pytorch": ["pytorch"],
    "tensorflow": ["tensorflow", "keras"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "data analysis": ["data analysis", "data analytics"],
    "natural language processing": ["nlp", "natural language processing"],
    "computer vision": ["computer vision", "opencv"],
    "llms": ["llm", "large language models", "openai", "gpt", "gemini", "langchain", "rag"],
    
    # Software Engineering & Methodology
    "agile": ["agile", "scrum", "kanban"],
    "system design": ["system design", "distributed systems", "software architecture"],
    "unit testing": ["testing", "unit test", "jest", "pytest", "cypress", "junit", "tdd"],
    "ui/ux": ["ui/ux", "figma", "wireframing", "prototyping"],
    "cybersecurity": ["security", "cybersecurity", "owasp", "penetration testing", "oauth"],
    "project management": ["project management", "jira", "confluence"]
}

ACTION_VERBS = [
    "spearheaded", "engineered", "architected", "developed", "implemented", "deployed",
    "designed", "optimized", "accelerated", "scaled", "automated", "mentored",
    "collaborated", "managed", "orchestrated", "transformed", "streamlined", "increased",
    "reduced", "saved", "launched", "delivered", "constructed", "revamped", "formulated"
]

COMMON_SECTIONS = {
    "Contact Info": [r"email", r"phone", r"github", r"linkedin", r"address", r"contact"],
    "Summary / Objective": [r"summary", r"objective", r"profile", r"about me", r"executive summary"],
    "Experience": [r"experience", r"employment", r"work history", r"professional experience", r"internship"],
    "Education": [r"education", r"university", r"degree", r"bachelor", r"master", r"phd", r"college"],
    "Skills": [r"skills", r"technical skills", r"technologies", r"competencies", r"stack", r"proficiencies"],
    "Projects": [r"projects", r"personal projects", r"academic projects", r"portfolio", r"open source"],
    "Certifications": [r"certifications", r"certificate", r"credentials", r"licenses"]
}


def extract_text_from_file(file_path):
    """
    Extracts plain text from PDF, DOCX, or text files.
    """
    if not os.path.exists(file_path):
        return ""
        
    ext = os.path.splitext(file_path)[1].lower()
    extracted_text = ""
    
    try:
        if ext == '.pdf':
            if PYPDF_AVAILABLE:
                reader = PdfReader(file_path)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
            else:
                # Fallback: attempt binary string extraction
                with open(file_path, 'rb') as f:
                    content = f.read()
                    strings = re.findall(rb"[\x20-\x7E]{4,}", content)
                    extracted_text = " ".join([s.decode('latin1', errors='ignore') for s in strings])
                    
        elif ext in ['.docx', '.doc']:
            if DOCX_AVAILABLE and ext == '.docx':
                doc = docx.Document(file_path)
                for para in doc.paragraphs:
                    extracted_text += para.text + "\n"
                for table in doc.tables:
                    for row in table.rows:
                        for cell in row.cells:
                            extracted_text += cell.text + " "
                        extracted_text += "\n"
            else:
                with open(file_path, 'rb') as f:
                    content = f.read()
                    strings = re.findall(rb"[\x20-\x7E]{4,}", content)
                    extracted_text = " ".join([s.decode('latin1', errors='ignore') for s in strings])
                    
        else: # .txt or similar
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    extracted_text = f.read()
            except UnicodeDecodeError:
                with open(file_path, 'r', encoding='latin-1') as f:
                    extracted_text = f.read()
                    
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        
    return extracted_text.strip()


def extract_skills_from_text(text):
    """
    Scans text against our comprehensive tech & domain ontology.
    Returns a sorted list of matched canonical skill names.
    """
    if not text:
        return []
        
    normalized_text = " " + text.lower() + " "
    matched_skills = set()
    
    for canonical_name, aliases in SKILLS_KNOWLEDGE_BASE.items():
        for alias in aliases:
            # Special regex to match word boundaries or symbols like c++, c#, .net
            escaped_alias = re.escape(alias)
            if alias in ["c++", "c#", ".net"]:
                pattern = r'(?:^|[\s,;/()\[\]{}])' + escaped_alias + r'(?:$|[\s,;/()\[\]{}])'
            elif alias in ["r", "go"]:
                pattern = r'\b' + escaped_alias + r'\b'
                # Avoid false positives for generic English words
                if not re.search(pattern, normalized_text, re.IGNORECASE):
                    continue
                # Double check context for single letter/short words
                if alias == "go" and not any(w in normalized_text for w in ["golang", "go language", "backend", "concurrency", "goroutines", "developer"]):
                    continue
                if alias == "r" and not any(w in normalized_text for w in ["r programming", "r language", "statistics", "data science", "rstudio"]):
                    continue
            else:
                pattern = r'(?<![a-zA-Z0-9])' + escaped_alias + r'(?![a-zA-Z0-9])'
                
            if re.search(pattern, normalized_text, re.IGNORECASE):
                # Capitalize nicely for display
                display_name = canonical_name.title() if canonical_name not in ["aws", "gcp", "sql", "html", "css", "ci/cd", "rest apis", "ui/ux", "nlp", "llms", "api"] else canonical_name.upper()
                if canonical_name == "javascript": display_name = "JavaScript"
                if canonical_name == "typescript": display_name = "TypeScript"
                if canonical_name == "postgresql": display_name = "PostgreSQL"
                if canonical_name == "mongodb": display_name = "MongoDB"
                if canonical_name == "node.js": display_name = "Node.js"
                if canonical_name == "react": display_name = "React.js"
                if canonical_name == "vue.js": display_name = "Vue.js"
                if canonical_name == "next.js": display_name = "Next.js"
                if canonical_name == "spring boot": display_name = "Spring Boot"
                if canonical_name == "tailwind css": display_name = "Tailwind CSS"
                if canonical_name == "c++": display_name = "C++"
                if canonical_name == "c#": display_name = "C#"
                
                matched_skills.add(display_name)
                break

    return sorted(list(matched_skills))


def analyze_resume_quality(text):
    """
    Evaluates resume structure, impact verbs, quantified achievements, and suggests improvements.
    """
    if not text or len(text.strip()) < 30:
        return {
            'overall_score': 20.0,
            'sections_detected': [],
            'missing_sections': list(COMMON_SECTIONS.keys()),
            'action_verb_count': 0,
            'quantified_bullet_count': 0,
            'suggestions': [
                {"type": "critical", "message": "The uploaded resume contains very little or unreadable text. Ensure your file is not a scanned image without OCR."},
                {"type": "standard", "message": "Include clear sections: Summary, Experience, Education, and Skills."}
            ],
            'section_scores': {
                'completeness': 15,
                'impact': 10,
                'formatting': 25,
                'skills_density': 10
            }
        }
        
    normalized_text = text.lower()
    
    # 1. Check sections
    detected_sections = []
    missing_sections = []
    
    for section_name, keywords in COMMON_SECTIONS.items():
        found = False
        for kw in keywords:
            if re.search(r'\b' + kw + r'\b', normalized_text):
                found = True
                break
        if found:
            detected_sections.append(section_name)
        else:
            missing_sections.append(section_name)
            
    section_score = (len(detected_sections) / len(COMMON_SECTIONS)) * 100
    
    # 2. Check Action Verbs
    found_verbs = [verb for verb in ACTION_VERBS if re.search(r'\b' + verb + r'\b', normalized_text)]
    verb_count = len(found_verbs)
    impact_score = min(100, int((verb_count / 8) * 100))
    
    # 3. Check Quantified Achievements (percentages, dollar signs, numeric metrics)
    metrics_matches = re.findall(r'(\d+[\d,]*\s*[%+xXkKmMbB]|\$\s*\d+[\d,]*|\b\d{2,}\b|\b\d+\s+(?:users|customers|clients|requests|ms|seconds|hours|dollars|leads))', text)
    quantified_count = len(metrics_matches)
    metrics_score = min(100, int((quantified_count / 5) * 100))
    
    # 4. Check Skills Density
    extracted_skills = extract_skills_from_text(text)
    skills_score = min(100, int((len(extracted_skills) / 10) * 100))
    
    # 5. Length & Formatting
    word_count = len(text.split())
    if 300 <= word_count <= 900:
        length_score = 95
    elif 150 <= word_count < 300:
        length_score = 70
    elif word_count > 900:
        length_score = 80
    else:
        length_score = 40
        
    overall_score = round(
        (section_score * 0.30) +
        (impact_score * 0.25) +
        (metrics_score * 0.20) +
        (skills_score * 0.15) +
        (length_score * 0.10),
        1
    )
    
    # Generate actionable suggestions
    suggestions = []
    
    if missing_sections:
        suggestions.append({
            "type": "improvement",
            "priority": "High",
            "category": "Structure",
            "message": f"Consider adding dedicated sections for: {', '.join(missing_sections[:3])} to pass ATS filters."
        })
        
    if verb_count < 5:
        suggestions.append({
            "type": "improvement",
            "priority": "Medium",
            "category": "Impact",
            "message": "Strengthen your experience bullet points with strong action verbs like 'Engineered', 'Architected', 'Spearheaded', and 'Optimized'."
        })
        
    if quantified_count < 3:
        suggestions.append({
            "type": "improvement",
            "priority": "High",
            "category": "Metrics",
            "message": "Add quantifiable impact to your achievements (e.g., 'reduced API latency by 45%', 'supported 100k+ active users', 'automated 8 hours of manual data entry weekly')."
        })
        
    if len(extracted_skills) < 6:
        suggestions.append({
            "type": "suggestion",
            "priority": "Medium",
            "category": "Skills",
            "message": "Highlight specific tools, frameworks, and modern technologies you use in your projects and daily work."
        })
        
    if word_count < 250:
        suggestions.append({
            "type": "suggestion",
            "priority": "Medium",
            "category": "Length",
            "message": "Your resume seems brief. Expand on key responsibilities, project architectures, and learning experiences."
        })
        
    if not suggestions:
        suggestions.append({
            "type": "positive",
            "priority": "Low",
            "category": "General",
            "message": "Excellent resume structure! Your resume includes diverse action verbs, quantitative metrics, and industry skills."
        })
        
    return {
        'overall_score': overall_score,
        'sections_detected': detected_sections,
        'missing_sections': missing_sections,
        'action_verb_count': verb_count,
        'quantified_bullet_count': quantified_count,
        'extracted_skills': extracted_skills,
        'word_count': word_count,
        'suggestions': suggestions,
        'section_scores': {
            'completeness': int(section_score),
            'impact': int(impact_score),
            'metrics': int(metrics_score),
            'skills_density': int(skills_score),
            'formatting': int(length_score)
        }
    }


def compare_resume_with_job(resume_text, candidate_skills, job_title, job_skills_required, job_description=""):
    """
    Compares candidate profile/resume against job requirements.
    Calculates transparent skill match percentage, matching skills, and missing skills.
    Never fabricates qualifications. Clearly returns the breakdown.
    """
    # 1. Collect candidate skills (from profile skills list + extracted text)
    all_candidate_skills = set()
    for s in candidate_skills:
        if s and isinstance(s, str):
            all_candidate_skills.add(s.strip().lower())
            
    if resume_text:
        text_extracted_skills = extract_skills_from_text(resume_text)
        for s in text_extracted_skills:
            all_candidate_skills.add(s.lower())
            
    # 2. Extract job skills (from job_skills_required + job_description scan)
    required_skills_set = set()
    for s in job_skills_required:
        if s and isinstance(s, str):
            required_skills_set.add(s.strip())
            
    if job_description:
        desc_skills = extract_skills_from_text(job_description)
        for s in desc_skills:
            required_skills_set.add(s)
            
    if not required_skills_set:
        # If no explicit skills are set, extract from job title and default to general
        required_skills_set = set(extract_skills_from_text(job_title) or ["Communication", "Problem Solving"])
        
    # 3. Compute matching & missing
    matching = []
    missing = []
    
    for req_skill in required_skills_set:
        req_norm = req_skill.lower()
        
        # Check direct or substring match or knowledge base match
        is_matched = False
        if req_norm in all_candidate_skills:
            is_matched = True
        else:
            # Check aliases in SKILLS_KNOWLEDGE_BASE
            aliases = SKILLS_KNOWLEDGE_BASE.get(req_norm, [req_norm])
            for alias in aliases:
                if any(cand_s in alias or alias in cand_s for cand_s in all_candidate_skills):
                    is_matched = True
                    break
                    
        if is_matched:
            matching.append(req_skill)
        else:
            missing.append(req_skill)
            
    total_req = len(required_skills_set)
    skill_match_ratio = (len(matching) / total_req) if total_req > 0 else 0.5
    
    # 4. Text keyword similarity (TF-IDF / Jaccard representation)
    full_candidate_text = (resume_text or "") + " " + " ".join(candidate_skills)
    cand_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', full_candidate_text.lower()))
    job_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', (job_title + " " + job_description).lower()))
    
    # Ignore ultra-common stopwords
    stopwords = {"and", "the", "for", "with", "that", "this", "from", "are", "have", "will", "our", "you", "your", "can", "work"}
    cand_words -= stopwords
    job_words -= stopwords
    
    overlap_ratio = len(cand_words.intersection(job_words)) / len(job_words) if job_words else 0.5
    
    # Calculate transparent final score
    # 70% Skill match + 30% Keyword / context overlap
    raw_match = (skill_match_ratio * 0.70) + (min(1.0, overlap_ratio * 2.5) * 0.30)
    final_percentage = round(raw_match * 100, 1)
    final_percentage = max(10.0, min(99.0, final_percentage))  # Keep in realistic transparent bounds
    
    explanation = f"Match calculated from {len(matching)} out of {total_req} required technical skills and contextual relevance."
    
    return {
        'match_percentage': final_percentage,
        'matching_skills': sorted(matching),
        'missing_skills': sorted(missing),
        'total_required_skills': total_req,
        'explanation': explanation,
        'is_strong_match': final_percentage >= 70.0,
        'analysis_type': 'rule_based'
    }
