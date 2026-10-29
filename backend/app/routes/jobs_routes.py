import json
from flask import Blueprint, request, jsonify
from sqlalchemy import or_, desc, asc
from ..models import db, Job, Company, Application, SavedJob, CandidateProfile
from ..auth import optional_token, token_required, role_required
from ..services.ai_engine import compare_resume_with_job

jobs_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')

@jobs_bp.route('', methods=['GET'])
@optional_token
def get_jobs():
    query = Job.query.filter_by(status='active').join(Company)
    
    # Keyword search (title, description, skills)
    q = request.args.get('q', '').strip()
    if q:
        search_filter = or_(
            Job.title.ilike(f'%{q}%'),
            Job.description.ilike(f'%{q}%'),
            Job.skills_required.ilike(f'%{q}%'),
            Company.name.ilike(f'%{q}%')
        )
        query = query.filter(search_filter)
        
    # Location filter
    location = request.args.get('location', '').strip()
    if location:
        query = query.filter(Job.location.ilike(f'%{location}%'))
        
    # Remote filter
    remote = request.args.get('remote', '').strip().lower()
    if remote in ['true', '1', 'yes']:
        query = query.filter(Job.is_remote == True)
        
    # Category filter
    category = request.args.get('category', '').strip()
    if category and category != 'All':
        query = query.filter(Job.category == category)
        
    # Employment type filter
    emp_type = request.args.get('type', '').strip()
    if emp_type and emp_type != 'All':
        query = query.filter(Job.employment_type == emp_type)
        
    # Experience level filter
    exp_level = request.args.get('experience', '').strip()
    if exp_level and exp_level != 'All':
        query = query.filter(Job.experience_level == exp_level)
        
    # Salary minimum
    min_salary = request.args.get('min_salary', type=int)
    if min_salary:
        query = query.filter(or_(Job.salary_max >= min_salary, Job.salary_min >= min_salary))
        
    # Sorting
    sort_by = request.args.get('sort', 'recent')
    if sort_by == 'salary_high':
        query = query.order_by(desc(Job.salary_max))
    elif sort_by == 'salary_low':
        query = query.order_by(asc(Job.salary_min))
    else:
        query = query.order_by(desc(Job.created_at))
        
    jobs = query.all()
    
    # If user is logged in as job seeker, pre-calculate match scores and check saved/applied status
    candidate_skills = []
    saved_job_ids = set()
    applied_job_ids = set()
    
    if hasattr(request, 'current_user') and request.current_user and request.current_user.role == 'job_seeker':
        cand_id = request.current_user.id
        profile = CandidateProfile.query.filter_by(user_id=cand_id).first()
        if profile:
            candidate_skills = profile.get_skills_list()
            
        saved_jobs = SavedJob.query.filter_by(candidate_id=cand_id).all()
        saved_job_ids = {s.job_id for s in saved_jobs}
        
        apps = Application.query.filter_by(candidate_id=cand_id).all()
        applied_job_ids = {a.job_id for a in apps}
        
    results = []
    for job in jobs:
        jdict = job.to_dict()
        jdict['is_saved'] = job.id in saved_job_ids
        jdict['is_applied'] = job.id in applied_job_ids
        
        if candidate_skills:
            match_res = compare_resume_with_job(
                resume_text="",
                candidate_skills=candidate_skills,
                job_title=job.title,
                job_skills_required=job.get_skills_list(),
                job_description=job.description
            )
            jdict['match_score'] = match_res['match_percentage']
            jdict['matching_skills'] = match_res['matching_skills']
            jdict['missing_skills'] = match_res['missing_skills']
        else:
            jdict['match_score'] = None
            jdict['matching_skills'] = []
            jdict['missing_skills'] = []
            
        results.append(jdict)
        
    return jsonify({
        'count': len(results),
        'jobs': results
    }), 200


@jobs_bp.route('/<int:job_id>', methods=['GET'])
@optional_token
def get_job_detail(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job posting not found'}), 404
        
    # Increment views
    try:
        job.views_count = (job.views_count or 0) + 1
        db.session.commit()
    except:
        db.session.rollback()
        
    jdict = job.to_dict()
    jdict['is_saved'] = False
    jdict['is_applied'] = False
    jdict['application_status'] = None
    jdict['match_analysis'] = None
    
    if hasattr(request, 'current_user') and request.current_user and request.current_user.role == 'job_seeker':
        cand_id = request.current_user.id
        saved = SavedJob.query.filter_by(candidate_id=cand_id, job_id=job_id).first()
        jdict['is_saved'] = bool(saved)
        
        existing_app = Application.query.filter_by(candidate_id=cand_id, job_id=job_id).first()
        if existing_app:
            jdict['is_applied'] = True
            jdict['application_status'] = existing_app.status
            
        profile = CandidateProfile.query.filter_by(user_id=cand_id).first()
        skills = profile.get_skills_list() if profile else []
        
        # Resume text if candidate has a resume
        resume_text = ""
        latest_resume = request.current_user.resumes[-1] if request.current_user.resumes else None
        if latest_resume and latest_resume.extracted_text:
            resume_text = latest_resume.extracted_text
            
        match_analysis = compare_resume_with_job(
            resume_text=resume_text,
            candidate_skills=skills,
            job_title=job.title,
            job_skills_required=job.get_skills_list(),
            job_description=job.description
        )
        jdict['match_analysis'] = match_analysis
        jdict['match_score'] = match_analysis['match_percentage']
        
    return jsonify({'job': jdict}), 200


@jobs_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = [
        {"name": "Software Development", "icon": "Code", "count": 0},
        {"name": "Artificial Intelligence & ML", "icon": "Cpu", "count": 0},
        {"name": "Cloud & DevOps", "icon": "Cloud", "count": 0},
        {"name": "Data Science & Analytics", "icon": "BarChart3", "count": 0},
        {"name": "Cybersecurity", "icon": "ShieldCheck", "count": 0},
        {"name": "UI/UX & Product Design", "icon": "Palette", "count": 0},
        {"name": "Product Management", "icon": "Briefcase", "count": 0},
        {"name": "Quality Assurance & Testing", "icon": "CheckCircle2", "count": 0}
    ]
    
    # Count active jobs for each category
    for cat in categories:
        count = Job.query.filter_by(category=cat['name'], status='active').count()
        cat['count'] = count
        
    return jsonify({'categories': categories}), 200


@jobs_bp.route('/featured', methods=['GET'])
@optional_token
def get_featured_jobs():
    jobs = Job.query.filter_by(status='active').order_by(desc(Job.views_count), desc(Job.created_at)).limit(6).all()
    results = [j.to_dict() for j in jobs]
    return jsonify({'jobs': results}), 200


@jobs_bp.route('/recommendations', methods=['GET'])
@token_required
@role_required('job_seeker')
def get_recommendations():
    cand_id = request.current_user.id
    profile = CandidateProfile.query.filter_by(user_id=cand_id).first()
    candidate_skills = profile.get_skills_list() if profile else []
    
    # Resume text if available
    latest_resume = request.current_user.resumes[-1] if request.current_user.resumes else None
    resume_text = latest_resume.extracted_text if (latest_resume and latest_resume.extracted_text) else ""
    
    # Jobs candidate has not applied to yet
    applied_job_ids = [a.job_id for a in Application.query.filter_by(candidate_id=cand_id).all()]
    query = Job.query.filter_by(status='active')
    if applied_job_ids:
        query = query.filter(~Job.id.in_(applied_job_ids))
        
    available_jobs = query.all()
    
    scored_jobs = []
    for job in available_jobs:
        match_res = compare_resume_with_job(
            resume_text=resume_text,
            candidate_skills=candidate_skills,
            job_title=job.title,
            job_skills_required=job.get_skills_list(),
            job_description=job.description
        )
        jdict = job.to_dict()
        jdict['match_score'] = match_res['match_percentage']
        jdict['matching_skills'] = match_res['matching_skills']
        jdict['missing_skills'] = match_res['missing_skills']
        jdict['explanation'] = match_res['explanation']
        scored_jobs.append(jdict)
        
    # Sort descending by match score
    scored_jobs.sort(key=lambda x: x['match_score'], reverse=True)
    
    return jsonify({
        'recommended_jobs': scored_jobs[:8]
    }), 200
