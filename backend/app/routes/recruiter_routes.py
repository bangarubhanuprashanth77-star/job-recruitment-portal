import json
from flask import Blueprint, request, jsonify
from ..models import db, User, Company, Job, Application, Interview, Notification
from ..auth import token_required, role_required
from ..services.audit_service import log_audit

recruiter_bp = Blueprint('recruiter', __name__, url_prefix='/api/recruiter')

@recruiter_bp.route('/company', methods=['GET'])
@token_required
@role_required('recruiter')
def get_company():
    user = request.current_user
    company = user.company
    if not company:
        company = Company(
            recruiter_id=user.id,
            name=f"{user.first_name}'s Company",
            industry="Technology",
            location="Remote"
        )
        db.session.add(company)
        db.session.commit()
        
    return jsonify({'company': company.to_dict()}), 200


@recruiter_bp.route('/company', methods=['PUT'])
@token_required
@role_required('recruiter')
def update_company():
    user = request.current_user
    company = user.company
    if not company:
        company = Company(recruiter_id=user.id, name=f"{user.first_name}'s Organization")
        db.session.add(company)
        
    data = request.get_json() or {}
    
    if 'name' in data and data['name']:
        company.name = data['name'].strip()
    if 'logo' in data:
        company.logo = data['logo'].strip()
    if 'website' in data:
        company.website = data['website'].strip()
    if 'description' in data:
        company.description = data['description']
    if 'industry' in data:
        company.industry = data['industry']
    if 'location' in data:
        company.location = data['location']
    if 'company_size' in data:
        company.company_size = data['company_size']
        
    try:
        db.session.commit()
        log_audit(
            action="COMPANY_UPDATED",
            target_type="company",
            target_id=company.id,
            details=f"Updated company '{company.name}' profile details",
            actor=user
        )
        return jsonify({
            'message': 'Company profile updated successfully',
            'company': company.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update company: {str(e)}'}), 500


@recruiter_bp.route('/jobs', methods=['GET'])
@token_required
@role_required('recruiter')
def get_recruiter_jobs():
    user = request.current_user
    company = user.company
    if not company:
        return jsonify({'jobs': []}), 200
        
    jobs = Job.query.filter_by(company_id=company.id).order_by(Job.created_at.desc()).all()
    return jsonify({'jobs': [j.to_dict() for j in jobs]}), 200


@recruiter_bp.route('/jobs', methods=['POST'])
@token_required
@role_required('recruiter')
def create_job():
    user = request.current_user
    company = user.company
    if not company:
        company = Company(recruiter_id=user.id, name=f"{user.first_name}'s Organization")
        db.session.add(company)
        db.session.commit()
        
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    requirements = data.get('requirements', '').strip()
    responsibilities = data.get('responsibilities', '').strip()
    category = data.get('category', 'Software Development')
    employment_type = data.get('employment_type', 'Full-time')
    experience_level = data.get('experience_level', 'Mid-level')
    location = data.get('location', 'Remote').strip()
    is_remote = bool(data.get('is_remote', False))
    salary_min = data.get('salary_min')
    salary_max = data.get('salary_max')
    skills_required = data.get('skills_required', [])
    
    if not title or not description:
        return jsonify({'error': 'Job title and description are required'}), 400
        
    if isinstance(skills_required, str):
        skills_required = [s.strip() for s in skills_required.split(',') if s.strip()]
        
    try:
        job = Job(
            company_id=company.id,
            title=title,
            description=description,
            requirements=requirements,
            responsibilities=responsibilities,
            category=category,
            employment_type=employment_type,
            experience_level=experience_level,
            location=location,
            is_remote=is_remote,
            salary_min=int(salary_min) if salary_min else None,
            salary_max=int(salary_max) if salary_max else None,
            status='active'
        )
        job.set_skills_list(skills_required)
        db.session.add(job)
        db.session.commit()
        
        log_audit(
            action="JOB_CREATED",
            target_type="job",
            target_id=job.id,
            details=f"Recruiter created job posting '{title}'",
            actor=user
        )
        return jsonify({
            'message': 'Job posted successfully!',
            'job': job.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create job: {str(e)}'}), 500


@recruiter_bp.route('/jobs/<int:job_id>', methods=['PUT'])
@token_required
@role_required('recruiter')
def update_job(job_id):
    user = request.current_user
    company = user.company
    if not company:
        return jsonify({'error': 'Company not found'}), 404
        
    job = Job.query.filter_by(id=job_id, company_id=company.id).first()
    if not job:
        return jsonify({'error': 'Job not found or access denied'}), 404
        
    data = request.get_json() or {}
    
    if 'title' in data and data['title']:
        job.title = data['title'].strip()
    if 'description' in data and data['description']:
        job.description = data['description'].strip()
    if 'requirements' in data:
        job.requirements = data['requirements']
    if 'responsibilities' in data:
        job.responsibilities = data['responsibilities']
    if 'category' in data:
        job.category = data['category']
    if 'employment_type' in data:
        job.employment_type = data['employment_type']
    if 'experience_level' in data:
        job.experience_level = data['experience_level']
    if 'location' in data:
        job.location = data['location']
    if 'is_remote' in data:
        job.is_remote = bool(data['is_remote'])
    if 'salary_min' in data:
        job.salary_min = int(data['salary_min']) if data['salary_min'] else None
    if 'salary_max' in data:
        job.salary_max = int(data['salary_max']) if data['salary_max'] else None
    if 'skills_required' in data:
        skills = data['skills_required']
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(',') if s.strip()]
        job.set_skills_list(skills)
    if 'status' in data and data['status'] in ['active', 'closed', 'draft']:
        job.status = data['status']
        
    try:
        db.session.commit()
        log_audit(
            action="JOB_UPDATED",
            target_type="job",
            target_id=job.id,
            details=f"Recruiter updated job posting '{job.title}'",
            actor=user
        )
        return jsonify({
            'message': 'Job updated successfully',
            'job': job.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update job: {str(e)}'}), 500


@recruiter_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
@token_required
@role_required('recruiter')
def delete_job(job_id):
    user = request.current_user
    company = user.company
    if not company:
        return jsonify({'error': 'Company not found'}), 404
        
    job = Job.query.filter_by(id=job_id, company_id=company.id).first()
    if not job:
        return jsonify({'error': 'Job not found or access denied'}), 404
        
    try:
        job_title = job.title
        db.session.delete(job)
        db.session.commit()
        log_audit(
            action="JOB_DELETED",
            target_type="job",
            target_id=job_id,
            details=f"Recruiter deleted job posting '{job_title}'",
            actor=user
        )
        return jsonify({'message': f"Job '{job_title}' deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete job: {str(e)}'}), 500


@recruiter_bp.route('/jobs/<int:job_id>/applicants', methods=['GET'])
@token_required
@role_required('recruiter')
def get_job_applicants(job_id):
    user = request.current_user
    company = user.company
    job = Job.query.filter_by(id=job_id, company_id=company.id).first()
    if not job:
        return jsonify({'error': 'Job not found or access denied'}), 404
        
    status_filter = request.args.get('status')
    min_score = request.args.get('min_score', type=float)
    
    query = Application.query.filter_by(job_id=job.id)
    if status_filter and status_filter != 'All':
        query = query.filter_by(status=status_filter)
    if min_score is not None:
        query = query.filter(Application.match_score >= min_score)
        
    applicants = query.order_by(Application.match_score.desc(), Application.applied_at.desc()).all()
    results = [a.to_dict(include_job=False, include_candidate=True) for a in applicants]
    
    return jsonify({
        'job': job.to_dict(),
        'applicants': results
    }), 200


@recruiter_bp.route('/applications/<int:app_id>/status', methods=['PUT'])
@token_required
@role_required('recruiter')
def update_application_status(app_id):
    user = request.current_user
    company = user.company
    
    application = Application.query.get(app_id)
    if not application or application.job.company_id != company.id:
        return jsonify({'error': 'Application not found or unauthorized'}), 404
        
    data = request.get_json() or {}
    new_status = data.get('status')
    notes = data.get('notes')
    
    valid_statuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired']
    if new_status and new_status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Allowed: {valid_statuses}'}), 400
        
    old_status = application.status
    if new_status:
        application.status = new_status
    if notes is not None:
        application.recruiter_notes = notes
        
    # Send notification to candidate
    candidate_notif = Notification(
        user_id=application.candidate_id,
        title=f"Application Status Updated: {new_status}",
        message=f"Your application for '{application.job.title}' at {company.name} is now: {new_status}.",
        type="application_status",
        link="/candidate/applications"
    )
    db.session.add(candidate_notif)
    
    try:
        db.session.commit()
        log_audit(
            action="APPLICATION_STATUS_UPDATED",
            target_type="application",
            target_id=application.id,
            details=f"Recruiter changed status from '{old_status}' to '{new_status}' for candidate ID {application.candidate_id}",
            actor=user
        )
        return jsonify({
            'message': f'Application status updated to {new_status}',
            'application': application.to_dict(include_job=True, include_candidate=True)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update status: {str(e)}'}), 500


@recruiter_bp.route('/interviews', methods=['POST'])
@token_required
@role_required('recruiter')
def schedule_interview():
    user = request.current_user
    company = user.company
    data = request.get_json() or {}
    
    app_id = data.get('application_id')
    scheduled_date = data.get('scheduled_date', '').strip()
    scheduled_time = data.get('scheduled_time', '').strip()
    meeting_link = data.get('meeting_link', '').strip()
    location_type = data.get('location_type', 'Remote')
    notes = data.get('notes', '').strip()
    
    if not app_id or not scheduled_date or not scheduled_time:
        return jsonify({'error': 'Application ID, date, and time are required'}), 400
        
    application = Application.query.get(app_id)
    if not application or application.job.company_id != company.id:
        return jsonify({'error': 'Application not found or unauthorized'}), 404
        
    interview = Interview(
        application_id=application.id,
        job_id=application.job_id,
        candidate_id=application.candidate_id,
        recruiter_id=user.id,
        scheduled_date=scheduled_date,
        scheduled_time=scheduled_time,
        meeting_link=meeting_link,
        location_type=location_type,
        notes=notes,
        status='Scheduled'
    )
    db.session.add(interview)
    
    # Automatically move application status to Interview Scheduled
    application.status = 'Interview Scheduled'
    
    # Notify candidate
    cand_notif = Notification(
        user_id=application.candidate_id,
        title="Interview Scheduled!",
        message=f"You have an interview scheduled for '{application.job.title}' with {company.name} on {scheduled_date} at {scheduled_time} ({location_type}).",
        type="interview_scheduled",
        link="/candidate/applications"
    )
    db.session.add(cand_notif)
    
    try:
        db.session.commit()
        log_audit(
            action="INTERVIEW_SCHEDULED",
            target_type="interview",
            target_id=interview.id,
            details=f"Interview scheduled on {scheduled_date} at {scheduled_time} for candidate ID {application.candidate_id}",
            actor=user
        )
        return jsonify({
            'message': 'Interview scheduled successfully!',
            'interview': interview.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to schedule interview: {str(e)}'}), 500


@recruiter_bp.route('/dashboard', methods=['GET'])
@token_required
@role_required('recruiter')
def get_recruiter_dashboard():
    user = request.current_user
    company = user.company
    if not company:
        return jsonify({
            'stats': {'total_jobs': 0, 'active_jobs': 0, 'total_applicants': 0, 'interviews_scheduled': 0},
            'pipeline': [],
            'recent_applicants': [],
            'job_performance': []
        }), 200
        
    jobs = Job.query.filter_by(company_id=company.id).all()
    job_ids = [j.id for j in jobs]
    
    total_jobs = len(jobs)
    active_jobs = len([j for j in jobs if j.status == 'active'])
    
    applications = Application.query.filter(Application.job_id.in_(job_ids)).all() if job_ids else []
    total_applicants = len(applications)
    
    # Pipeline status distribution for charts
    status_counts = {
        'Applied': 0,
        'Under Review': 0,
        'Shortlisted': 0,
        'Interview Scheduled': 0,
        'Hired': 0,
        'Rejected': 0
    }
    for app in applications:
        if app.status in status_counts:
            status_counts[app.status] += 1
            
    pipeline_data = [{"status": k, "count": v} for k, v in status_counts.items()]
    
    # Recent applicants
    recent_apps = sorted(applications, key=lambda a: a.applied_at or datetime.min, reverse=True)[:6]
    
    # Job performance list
    job_perf = []
    for j in jobs[:6]:
        j_apps = [a for a in applications if a.job_id == j.id]
        avg_score = round(sum(a.match_score for a in j_apps) / len(j_apps), 1) if j_apps else 0.0
        job_perf.append({
            'id': j.id,
            'title': j.title,
            'views': j.views_count,
            'applicants': len(j_apps),
            'avg_match_score': avg_score,
            'status': j.status
        })
        
    return jsonify({
        'company': company.to_dict(),
        'stats': {
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'total_applicants': total_applicants,
            'shortlisted': status_counts['Shortlisted'],
            'interviews_scheduled': status_counts['Interview Scheduled'],
            'hired': status_counts['Hired']
        },
        'pipeline': pipeline_data,
        'recent_applicants': [a.to_dict(include_job=True, include_candidate=True) for a in recent_apps],
        'job_performance': job_perf
    }), 200
