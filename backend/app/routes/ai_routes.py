import json
from flask import Blueprint, request, jsonify
from ..models import db, Resume, Job, ResumeAnalysisReport, CandidateProfile
from ..auth import optional_token, token_required
from ..services.ai_engine import (
    extract_skills_from_text, analyze_resume_quality,
    compare_resume_with_job
)

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/analyze-resume', methods=['POST'])
@optional_token
def analyze_resume_endpoint():
    data = request.get_json() or {}
    text = data.get('text', '').strip()
    resume_id = data.get('resume_id')
    
    if resume_id:
        resume = Resume.query.get(resume_id)
        if resume and resume.extracted_text:
            text = resume.extracted_text
            
    if not text:
        return jsonify({'error': 'Please provide resume text or a valid resume_id to analyze'}), 400
        
    analysis = analyze_resume_quality(text)
    
    # Save report if user is authenticated
    if hasattr(request, 'current_user') and request.current_user:
        try:
            report = ResumeAnalysisReport(
                resume_id=resume_id,
                user_id=request.current_user.id,
                overall_score=analysis['overall_score'],
                extracted_skills=json.dumps(analysis['extracted_skills']),
                suggestions=json.dumps(analysis['suggestions']),
                section_scores=json.dumps(analysis['section_scores']),
                analysis_type="rule_based"
            )
            db.session.add(report)
            db.session.commit()
        except:
            db.session.rollback()
            
    return jsonify({
        'analysis': analysis,
        'engine': 'JobConnect Smart Matcher Engine (Rule-based & Heuristic Analysis)'
    }), 200


@ai_bp.route('/match-job', methods=['POST'])
@optional_token
def match_job_endpoint():
    data = request.get_json() or {}
    resume_text = data.get('resume_text', '').strip()
    candidate_skills = data.get('candidate_skills', [])
    job_id = data.get('job_id')
    job_title = data.get('job_title', '')
    job_description = data.get('job_description', '')
    job_skills_required = data.get('job_skills_required', [])
    
    if job_id:
        job = Job.query.get(job_id)
        if job:
            job_title = job.title
            job_description = job.description
            job_skills_required = job.get_skills_list()
            
    if hasattr(request, 'current_user') and request.current_user and not candidate_skills:
        profile = request.current_user.candidate_profile
        if profile:
            candidate_skills = profile.get_skills_list()
            
    match_result = compare_resume_with_job(
        resume_text=resume_text,
        candidate_skills=candidate_skills,
        job_title=job_title,
        job_skills_required=job_skills_required,
        job_description=job_description
    )
    
    return jsonify({
        'result': match_result,
        'transparency_note': 'Score computed based on required skill presence, text overlap, and technical ontology. Never automatically disqualifies candidates.'
    }), 200


@ai_bp.route('/generate-job-description', methods=['POST'])
@token_required
def generate_job_description():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    category = data.get('category', 'Software Development')
    experience_level = data.get('experience_level', 'Mid-level')
    
    if not title:
        return jsonify({'error': 'Title is required'}), 400
        
    # AI Rule-based generator for realistic job descriptions
    templates = {
        'Frontend': {
            'description': f"We are seeking a talented {experience_level} {title} to build modern, responsive, and intuitive web applications. You will work closely with product managers, UI/UX designers, and backend engineers to craft engaging user experiences.",
            'responsibilities': "• Develop highly responsive user interface components using modern frameworks.\n• Optimize web applications for maximum speed, accessibility, and scalability.\n• Collaborate with UX/UI designers to transform wireframes into pixel-perfect interfaces.\n• Write clean, testable, and maintainable frontend code.",
            'requirements': "• Strong proficiency in JavaScript, TypeScript, HTML5, and CSS3/Tailwind CSS.\n• Demonstrated experience with modern frontend libraries (React, Vue, or Next.js).\n• Familiarity with RESTful APIs, state management, and build tools.\n• Excellent problem-solving and cross-functional communication skills.",
            'suggested_skills': ["JavaScript", "TypeScript", "React.js", "Tailwind CSS", "HTML", "CSS", "Git", "REST APIs"]
        },
        'Backend': {
            'description': f"We are looking for a skilled {experience_level} {title} to design, scale, and maintain robust server-side architectures, microservices, and high-performance databases.",
            'responsibilities': "• Architect, develop, and deploy scalable RESTful and GraphQL APIs.\n• Optimize database queries, schema design, and caching layers for performance.\n• Implement secure authentication, authorization, and data encryption standards.\n• Maintain CI/CD pipelines, automated testing, and cloud infrastructure monitoring.",
            'requirements': "• Strong expertise in server-side languages (Python, Go, Node.js, or Java).\n• Experience with relational and NoSQL databases (PostgreSQL, MongoDB, Redis).\n• Deep understanding of microservices architecture and API design principles.\n• Hands-on experience with Docker, cloud providers (AWS/GCP), and version control.",
            'suggested_skills': ["Python", "Node.js", "PostgreSQL", "Docker", "AWS", "REST APIs", "Microservices", "Git"]
        },
        'Full Stack': {
            'description': f"Join our engineering team as an impact-driven {experience_level} {title}. You will own full feature development end-to-end, from customer-facing interfaces to resilient backend services.",
            'responsibilities': "• Design and implement complete end-to-end features across web client and cloud backend.\n• Ensure smooth integration between user interfaces and backend API endpoints.\n• Write comprehensive automated unit and integration tests.\n• Participate in system architecture reviews and mentor junior developers.",
            'requirements': "• Full stack competency spanning frontend (React/TypeScript) and backend (Python/Node.js).\n• Solid database modeling experience with SQL and NoSQL databases.\n• Experience deploying cloud services on AWS or GCP.\n• Passion for shipping high-quality software with agile team collaboration.",
            'suggested_skills': ["React.js", "TypeScript", "Python", "Node.js", "PostgreSQL", "Docker", "Git", "REST APIs"]
        },
        'AI / Data': {
            'description': f"We are hiring a passionate {experience_level} {title} to develop intelligent machine learning pipelines, predictive analytics models, and scalable AI-driven solutions.",
            'responsibilities': "• Design, train, evaluate, and deploy machine learning models in production environments.\n• Perform exploratory data analysis and build automated ETL pipelines.\n• Implement prompt engineering and LLM integrations for intelligent application features.\n• Monitor model performance, drift, and continuous feedback loops.",
            'requirements': "• Proven expertise in Python, PyTorch, TensorFlow, and Scikit-Learn.\n• Strong foundation in statistics, linear algebra, and data manipulation (Pandas, NumPy).\n• Familiarity with LLM architectures, RAG pipelines, and vector databases.\n• Strong communication skills to present technical insights to stakeholders.",
            'suggested_skills': ["Python", "Machine Learning", "PyTorch", "Pandas", "NumPy", "LLMs", "SQL", "Docker"]
        }
    }
    
    # Determine best template match
    t_lower = title.lower()
    if any(k in t_lower for k in ['front', 'react', 'ui', 'web design']):
        match = templates['Frontend']
    elif any(k in t_lower for k in ['back', 'api', 'server', 'database', 'system']):
        match = templates['Backend']
    elif any(k in t_lower for k in ['ai', 'data', 'ml', 'machine learning', 'deep learning']):
        match = templates['AI / Data']
    else:
        match = templates['Full Stack']
        
    return jsonify({
        'title': title,
        'description': match['description'],
        'responsibilities': match['responsibilities'],
        'requirements': match['requirements'],
        'suggested_skills': match['suggested_skills']
    }), 200
