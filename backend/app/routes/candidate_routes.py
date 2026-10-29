import os
import uuid
import json
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from ..models import (
    db, User, CandidateProfile, Job, Application, Resume,
    SavedJob, Interview, Notification, ResumeAnalysisReport
)
from ..auth import token_required, role_required
from ..services.ai_engine import (
    extract_text_from_file, extract_skills_from_text,
    analyze_resume_quality, compare_resume_with_job
)
from ..services.audit_service import log_audit

candidate_bp = Blueprint('candidate', __name__, url_prefix='/api/candidate')

@candidate_bp.route('/profile', methods=['GET'])
@token_required
@role_required('job_seeker')
def get_profile():
    user = request.current_user
    profile = user.candidate_profile
    if not profile:
        profile = CandidateProfile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()
        
    return jsonify({
        'user': user.to_dict(),
        'profile': profile.to_dict()
    }), 200


@candidate_bp.route('/profile', methods=['PUT'])
@token_required
@role_required('job_seeker')
def update_profile():
    user = request.current_user
    profile = user.candidate_profile
    if not profile:
        profile = CandidateProfile(user_id=user.id)
        db.session.add(profile)
        
    data = request.get_json() or {}
    
    if 'headline' in data:
        profile.headline = data['headline']
    if 'bio' in data:
        profile.bio = data['bio']
    if 'location' in data:
        profile.location = data['location']
    if 'current_title' in data:
        profile.current_title = data['current_title']
    if 'years_experience' in data:
        try:
            profile.years_experience = float(data['years_experience'])
        except:
            pass
    if 'skills' in data:
        profile.set_skills_list(data['skills'])
    if 'education' in data:
        profile.education = json.dumps(data['education'])
    if 'experience' in data:
        profile.experience = json.dumps(data['experience'])
    if 'github_url' in data:
        profile.github_url = data['github_url']
    if 'linkedin_url' in data:
        profile.linkedin_url = data['linkedin_url']
    if 'portfolio_url' in data:
        profile.portfolio_url = data['portfolio_url']
        
    if 'first_name' in data and data['first_name']:
        user.first_name = data['first_name']
    if 'last_name' in data and data['last_name']:
        user.last_name = data['last_name']
    if 'phone' in data:
        user.phone = data['phone']
        
    try:
        db.session.commit()
        log_audit(
            action="PROFILE_UPDATED",
            target_type="candidate_profile",
            target_id=profile.id,
            details="Candidate updated profile details",
            actor=user
        )
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict(),
            'profile': profile.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500


@candidate_bp.route('/resumes', methods=['GET'])
@token_required
@role_required('job_seeker')
def get_resumes():
    user = request.current_user
    resumes = Resume.query.filter_by(candidate_id=user.id).order_by(Resume.created_at.desc()).all()
    return jsonify({'resumes': [r.to_dict() for r in resumes]}), 200


@candidate_bp.route('/resumes/upload', methods=['POST'])
@token_required
@role_required('job_seeker')
def upload_resume():
    user = request.current_user
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided in the request'}), 400
        
    file = request.files['resume']
    if not file or not file.filename:
        return jsonify({'error': 'No file selected'}), 400
        
    orig_filename = secure_filename(file.filename)
    ext = orig_filename.rsplit('.', 1)[-1].lower() if '.' in orig_filename else ''
    
    if ext not in current_app.config.get('ALLOWED_EXTENSIONS', {'pdf', 'docx', 'doc', 'txt'}):
        return jsonify({'error': 'Unsupported file format. Please upload a PDF, DOCX, or TXT file.'}), 400
        
    unique_filename = f"{user.id}_{uuid.uuid4().hex[:10]}_{orig_filename}"
    upload_dir = current_app.config.get('UPLOAD_FOLDER')
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_filename)
    
    file.save(file_path)
    file_size = os.path.getsize(file_path)
    
    # AI Text extraction & skill identification
    extracted_text = extract_text_from_file(file_path)
    extracted_skills = extract_skills_from_text(extracted_text)
    
    # Resume quality analysis
    quality_analysis = analyze_resume_quality(extracted_text)
    
    # Save Resume record
    resume = Resume(
        candidate_id=user.id,
        filename=unique_filename,
        original_name=orig_filename,
        file_path=file_path,
        file_size=file_size,
        file_type=ext,
        extracted_text=extracted_text,
        extracted_skills=json.dumps(extracted_skills)
    )
    db.session.add(resume)
    db.session.flush()
    
    # Save Analysis Report
    report = ResumeAnalysisReport(
        resume_id=resume.id,
        user_id=user.id,
        overall_score=quality_analysis['overall_score'],
        extracted_skills=json.dumps(extracted_skills),
        suggestions=json.dumps(quality_analysis['suggestions']),
        section_scores=json.dumps(quality_analysis['section_scores']),
        analysis_type="rule_based"
    )
    db.session.add(report)
    
    # Sync candidate skills if candidate has few skills
    profile = user.candidate_profile
    if profile:
        existing_skills = set(profile.get_skills_list())
        for sk in extracted_skills:
            existing_skills.add(sk)
        profile.set_skills_list(sorted(list(existing_skills)))
        
    try:
        db.session.commit()
        log_audit(
            action="RESUME_UPLOADED",
            target_type="resume",
            target_id=resume.id,
            details=f"Uploaded resume: {orig_filename} ({len(extracted_skills)} skills extracted)",
            actor=user
        )
        return jsonify({
            'message': 'Resume uploaded and analyzed successfully',
            'resume': resume.to_dict(),
            'analysis': report.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to save resume: {str(e)}'}), 500


@candidate_bp.route('/resumes/<int:resume_id>', methods=['DELETE'])
@token_required
@role_required('job_seeker')
def delete_resume(resume_id):
    user = request.current_user
    resume = Resume.query.filter_by(id=resume_id, candidate_id=user.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
        
    try:
        if os.path.exists(resume.file_path):
            try:
                os.remove(resume.file_path)
            except:
                pass
        db.session.delete(resume)
        db.session.commit()
        return jsonify({'message': 'Resume removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete resume: {str(e)}'}), 500


@candidate_bp.route('/applications', methods=['GET'])
@token_required
@role_required('job_seeker')
def get_applications():
    user = request.current_user
    applications = Application.query.filter_by(candidate_id=user.id).order_by(Application.applied_at.desc()).all()
    results = [a.to_dict(include_job=True, include_candidate=False) for a in applications]
    return jsonify({'applications': results}), 200


@candidate_bp.route('/applications', methods=['POST'])
@token_required
@role_required('job_seeker')
def apply_to_job():
    user = request.current_user
    data = request.get_json() or {}
    job_id = data.get('job_id')
    resume_id = data.get('resume_id')
    cover_letter = data.get('cover_letter', '').strip()
    
    if not job_id:
        return jsonify({'error': 'Job ID is required'}), 400
        
    job = Job.query.get(job_id)
    if not job or job.status != 'active':
        return jsonify({'error': 'Job not found or no longer accepting applications'}), 404
        
    # Prevent duplicate applications
    existing = Application.query.filter_by(job_id=job_id, candidate_id=user.id).first()
    if existing:
        return jsonify({'error': 'You have already submitted an application for this position'}), 400
        
    profile = user.candidate_profile
    skills = profile.get_skills_list() if profile else []
    
    # Calculate match score & details
    resume_text = ""
    if resume_id:
        res = Resume.query.filter_by(id=resume_id, candidate_id=user.id).first()
        if res and res.extracted_text:
            resume_text = res.extracted_text
    elif user.resumes:
        resume_id = user.resumes[-1].id
        resume_text = user.resumes[-1].extracted_text or ""
        
    match_result = compare_resume_with_job(
        resume_text=resume_text,
        candidate_skills=skills,
        job_title=job.title,
        job_skills_required=job.get_skills_list(),
        job_description=job.description
    )
    
    application = Application(
        job_id=job_id,
        candidate_id=user.id,
        resume_id=resume_id,
        cover_letter=cover_letter,
        status='Applied',
        match_score=match_result['match_percentage'],
        match_details=json.dumps(match_result)
    )
    db.session.add(application)
    
    # Notify recruiter
    if job.company and job.company.recruiter_id:
        recruiter_notif = Notification(
            user_id=job.company.recruiter_id,
            title="New Application Received",
            message=f"{user.first_name} {user.last_name} applied for {job.title} ({match_result['match_percentage']}% AI Match)",
            type="application_status",
            link=f"/recruiter/jobs/{job.id}/applicants"
        )
        db.session.add(recruiter_notif)
        
    try:
        db.session.commit()
        log_audit(
            action="APPLICATION_SUBMITTED",
            target_type="application",
            target_id=application.id,
            details=f"Candidate applied for '{job.title}' with {match_result['match_percentage']}% match score",
            actor=user
        )
        return jsonify({
            'message': 'Application submitted successfully!',
            'application': application.to_dict(include_job=True, include_candidate=False)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to submit application: {str(e)}'}), 500


@candidate_bp.route('/saved-jobs', methods=['GET'])
@token_required
@role_required('job_seeker')
def get_saved_jobs():
    user = request.current_user
    saved = SavedJob.query.filter_by(candidate_id=user.id).order_by(SavedJob.saved_at.desc()).all()
    return jsonify({'saved_jobs': [s.to_dict() for s in saved]}), 200


@candidate_bp.route('/saved-jobs/<int:job_id>', methods=['POST'])
@token_required
@role_required('job_seeker')
def save_job(job_id):
    user = request.current_user
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
        
    existing = SavedJob.query.filter_by(candidate_id=user.id, job_id=job_id).first()
    if existing:
        return jsonify({'message': 'Job is already in saved list'}), 200
        
    saved = SavedJob(candidate_id=user.id, job_id=job_id)
    db.session.add(saved)
    try:
        db.session.commit()
        return jsonify({'message': 'Job saved to favorites', 'saved': saved.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to save job: {str(e)}'}), 500


@candidate_bp.route('/saved-jobs/<int:job_id>', methods=['DELETE'])
@token_required
@role_required('job_seeker')
def unsave_job(job_id):
    user = request.current_user
    saved = SavedJob.query.filter_by(candidate_id=user.id, job_id=job_id).first()
    if not saved:
        return jsonify({'message': 'Job was not saved'}), 200
        
    db.session.delete(saved)
    try:
        db.session.commit()
        return jsonify({'message': 'Job removed from favorites'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to remove saved job: {str(e)}'}), 500


@candidate_bp.route('/interviews', methods=['GET'])
@token_required
@role_required('job_seeker')
def get_interviews():
    user = request.current_user
    interviews = Interview.query.filter_by(candidate_id=user.id).order_by(Interview.scheduled_date.asc()).all()
    return jsonify({'interviews': [i.to_dict() for i in interviews]}), 200


@candidate_bp.route('/dashboard', methods=['GET'])
@token_required
@role_required('job_seeker')
def get_dashboard():
    user = request.current_user
    apps = Application.query.filter_by(candidate_id=user.id).all()
    
    total_apps = len(apps)
    under_review = len([a for a in apps if a.status == 'Under Review'])
    shortlisted = len([a for a in apps if a.status == 'Shortlisted'])
    interviews_scheduled = len([a for a in apps if a.status == 'Interview Scheduled'])
    hired = len([a for a in apps if a.status == 'Hired'])
    rejected = len([a for a in apps if a.status == 'Rejected'])
    
    saved_count = SavedJob.query.filter_by(candidate_id=user.id).count()
    resumes_count = len(user.resumes)
    
    # Latest resume score
    latest_report = ResumeAnalysisReport.query.filter_by(user_id=user.id).order_by(ResumeAnalysisReport.created_at.desc()).first()
    latest_score = latest_report.overall_score if latest_report else None
    
    # Recent applications
    recent_apps = sorted(apps, key=lambda a: a.applied_at or datetime.min, reverse=True)[:5]
    
    # Upcoming interviews
    upcoming_interviews = Interview.query.filter_by(candidate_id=user.id, status='Scheduled').order_by(Interview.scheduled_date.asc()).limit(3).all()
    
    return jsonify({
        'stats': {
            'total_applications': total_apps,
            'under_review': under_review,
            'shortlisted': shortlisted,
            'interviews_scheduled': interviews_scheduled,
            'hired': hired,
            'rejected': rejected,
            'saved_jobs': saved_count,
            'resumes_count': resumes_count,
            'latest_resume_score': latest_score
        },
        'recent_applications': [a.to_dict(include_job=True, include_candidate=False) for a in recent_apps],
        'upcoming_interviews': [i.to_dict() for i in upcoming_interviews]
    }), 200
