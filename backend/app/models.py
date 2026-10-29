from datetime import datetime
import json
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='job_seeker')  # 'job_seeker', 'recruiter', 'admin'
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    phone = db.Column(db.String(30), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    candidate_profile = db.relationship('CandidateProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    company = db.relationship('Company', backref='recruiter', uselist=False, cascade='all, delete-orphan')
    resumes = db.relationship('Resume', backref='candidate', cascade='all, delete-orphan')
    applications = db.relationship('Application', backref='candidate', cascade='all, delete-orphan')
    saved_jobs = db.relationship('SavedJob', backref='candidate', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'phone': self.phone,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CandidateProfile(db.Model):
    __tablename__ = 'candidate_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    headline = db.Column(db.String(150), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(120), nullable=True)
    current_title = db.Column(db.String(120), nullable=True)
    years_experience = db.Column(db.Float, default=0.0)
    skills = db.Column(db.Text, default='[]')  # JSON array string
    education = db.Column(db.Text, default='[]')  # JSON array string
    experience = db.Column(db.Text, default='[]')  # JSON array string
    github_url = db.Column(db.String(255), nullable=True)
    linkedin_url = db.Column(db.String(255), nullable=True)
    portfolio_url = db.Column(db.String(255), nullable=True)
    profile_image = db.Column(db.String(255), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_skills_list(self):
        try:
            return json.loads(self.skills) if self.skills else []
        except:
            return [s.strip() for s in self.skills.split(',') if s.strip()]
            
    def set_skills_list(self, skills_list):
        self.skills = json.dumps(skills_list)
        
    def get_education_list(self):
        try:
            return json.loads(self.education) if self.education else []
        except:
            return []
            
    def get_experience_list(self):
        try:
            return json.loads(self.experience) if self.experience else []
        except:
            return []

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'headline': self.headline or '',
            'bio': self.bio or '',
            'location': self.location or '',
            'current_title': self.current_title or '',
            'years_experience': self.years_experience or 0.0,
            'skills': self.get_skills_list(),
            'education': self.get_education_list(),
            'experience': self.get_experience_list(),
            'github_url': self.github_url or '',
            'linkedin_url': self.linkedin_url or '',
            'portfolio_url': self.portfolio_url or '',
            'profile_image': self.profile_image or '',
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False, index=True)
    logo = db.Column(db.String(255), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    industry = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(120), nullable=True)
    company_size = db.Column(db.String(50), nullable=True)  # e.g., '1-10', '11-50', '51-200', '201-1000', '1000+'
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    jobs = db.relationship('Job', backref='company', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'recruiter_id': self.recruiter_id,
            'name': self.name,
            'logo': self.logo or '',
            'website': self.website or '',
            'description': self.description or '',
            'industry': self.industry or 'Technology',
            'location': self.location or '',
            'company_size': self.company_size or '11-50',
            'is_verified': self.is_verified,
            'jobs_count': len([j for j in self.jobs if j.status == 'active']),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text, nullable=True)
    responsibilities = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(80), nullable=False, default='Software Development', index=True)
    employment_type = db.Column(db.String(50), nullable=False, default='Full-time')  # Full-time, Part-time, Contract, Remote, Internship
    experience_level = db.Column(db.String(50), nullable=False, default='Mid-level')  # Entry-level, Mid-level, Senior, Lead, Executive
    location = db.Column(db.String(120), nullable=False, default='Remote')
    is_remote = db.Column(db.Boolean, default=False)
    salary_min = db.Column(db.Integer, nullable=True)
    salary_max = db.Column(db.Integer, nullable=True)
    salary_currency = db.Column(db.String(10), default='USD')
    skills_required = db.Column(db.Text, default='[]')  # JSON array string
    status = db.Column(db.String(20), default='active', index=True)  # 'active', 'closed', 'draft', 'flagged'
    views_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    applications = db.relationship('Application', backref='job', cascade='all, delete-orphan')
    saved_by = db.relationship('SavedJob', backref='job', cascade='all, delete-orphan')
    
    def get_skills_list(self):
        try:
            return json.loads(self.skills_required) if self.skills_required else []
        except:
            return [s.strip() for s in self.skills_required.split(',') if s.strip()]
            
    def set_skills_list(self, skills_list):
        self.skills_required = json.dumps(skills_list)

    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'company_name': self.company.name if self.company else 'Unknown Company',
            'company_logo': self.company.logo if self.company else '',
            'company_verified': self.company.is_verified if self.company else False,
            'company_location': self.company.location if self.company else '',
            'title': self.title,
            'description': self.description,
            'requirements': self.requirements or '',
            'responsibilities': self.responsibilities or '',
            'category': self.category,
            'employment_type': self.employment_type,
            'experience_level': self.experience_level,
            'location': self.location,
            'is_remote': self.is_remote,
            'salary_min': self.salary_min,
            'salary_max': self.salary_max,
            'salary_currency': self.salary_currency,
            'skills_required': self.get_skills_list(),
            'status': self.status,
            'views_count': self.views_count,
            'applications_count': len(self.applications),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Resume(db.Model):
    __tablename__ = 'resumes'
    
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    filename = db.Column(db.String(255), nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=True)  # in bytes
    file_type = db.Column(db.String(50), nullable=True)  # 'pdf', 'docx', 'txt'
    extracted_text = db.Column(db.Text, nullable=True)
    extracted_skills = db.Column(db.Text, default='[]')  # JSON array
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_skills_list(self):
        try:
            return json.loads(self.extracted_skills) if self.extracted_skills else []
        except:
            return []

    def to_dict(self):
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'filename': self.filename,
            'original_name': self.original_name,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'extracted_skills': self.get_skills_list(),
            'has_text': bool(self.extracted_text and len(self.extracted_text.strip()) > 0),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Application(db.Model):
    __tablename__ = 'applications'
    __table_args__ = (
        db.UniqueConstraint('job_id', 'candidate_id', name='uq_job_candidate'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False, index=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id'), nullable=True)
    cover_letter = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(40), default='Applied', index=True)
    # Statuses: 'Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'
    applied_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    recruiter_notes = db.Column(db.Text, nullable=True)
    match_score = db.Column(db.Float, default=0.0)
    match_details = db.Column(db.Text, default='{}')  # JSON string breakdown
    
    # Relationships
    resume = db.relationship('Resume', foreign_keys=[resume_id])
    interviews = db.relationship('Interview', backref='application', cascade='all, delete-orphan')

    def get_match_breakdown(self):
        try:
            return json.loads(self.match_details) if self.match_details else {}
        except:
            return {}

    def to_dict(self, include_job=True, include_candidate=True):
        data = {
            'id': self.id,
            'job_id': self.job_id,
            'candidate_id': self.candidate_id,
            'resume_id': self.resume_id,
            'cover_letter': self.cover_letter or '',
            'status': self.status,
            'applied_at': self.applied_at.isoformat() if self.applied_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'recruiter_notes': self.recruiter_notes or '',
            'match_score': self.match_score,
            'match_details': self.get_match_breakdown(),
            'resume': self.resume.to_dict() if self.resume else None
        }
        if include_job and self.job:
            data['job'] = {
                'id': self.job.id,
                'title': self.job.title,
                'company_name': self.job.company.name if self.job.company else '',
                'company_logo': self.job.company.logo if self.job.company else '',
                'location': self.job.location,
                'employment_type': self.job.employment_type,
                'status': self.job.status
            }
        if include_candidate and self.candidate:
            profile = self.candidate.candidate_profile
            data['candidate'] = {
                'id': self.candidate.id,
                'full_name': f"{self.candidate.first_name} {self.candidate.last_name}",
                'email': self.candidate.email,
                'phone': self.candidate.phone,
                'headline': profile.headline if profile else '',
                'location': profile.location if profile else '',
                'years_experience': profile.years_experience if profile else 0,
                'skills': profile.get_skills_list() if profile else []
            }
        return data


class SavedJob(db.Model):
    __tablename__ = 'saved_jobs'
    __table_args__ = (
        db.UniqueConstraint('candidate_id', 'job_id', name='uq_candidate_job_save'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False, index=True)
    saved_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'job_id': self.job_id,
            'saved_at': self.saved_at.isoformat() if self.saved_at else None,
            'job': self.job.to_dict() if self.job else None
        }


class Interview(db.Model):
    __tablename__ = 'interviews'
    
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=False, index=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    scheduled_date = db.Column(db.String(20), nullable=False)  # YYYY-MM-DD
    scheduled_time = db.Column(db.String(20), nullable=False)  # HH:MM AM/PM
    meeting_link = db.Column(db.String(255), nullable=True)
    location_type = db.Column(db.String(50), default='Remote')  # Remote, In-Person, Phone
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), default='Scheduled')  # Scheduled, Completed, Cancelled, Rescheduled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    candidate = db.relationship('User', foreign_keys=[candidate_id])
    recruiter = db.relationship('User', foreign_keys=[recruiter_id])
    job = db.relationship('Job', foreign_keys=[job_id])

    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'job_id': self.job_id,
            'job_title': self.job.title if self.job else '',
            'company_name': self.job.company.name if (self.job and self.job.company) else '',
            'candidate_id': self.candidate_id,
            'candidate_name': f"{self.candidate.first_name} {self.candidate.last_name}" if self.candidate else '',
            'recruiter_id': self.recruiter_id,
            'scheduled_date': self.scheduled_date,
            'scheduled_time': self.scheduled_time,
            'meeting_link': self.meeting_link or '',
            'location_type': self.location_type,
            'notes': self.notes or '',
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default='general')  # 'application_status', 'interview_scheduled', 'system'
    link = db.Column(db.String(255), nullable=True)
    is_read = db.Column(db.Boolean, default=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'link': self.link or '',
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ResumeAnalysisReport(db.Model):
    __tablename__ = 'resume_analysis_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=True)
    overall_score = db.Column(db.Float, default=0.0)
    match_score = db.Column(db.Float, default=0.0)
    extracted_skills = db.Column(db.Text, default='[]')
    missing_skills = db.Column(db.Text, default='[]')
    matching_skills = db.Column(db.Text, default='[]')
    suggestions = db.Column(db.Text, default='[]')
    section_scores = db.Column(db.Text, default='{}')
    analysis_type = db.Column(db.String(50), default='rule_based')  # 'rule_based' or 'ai_llm'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        try:
            skills = json.loads(self.extracted_skills)
        except:
            skills = []
        try:
            missing = json.loads(self.missing_skills)
        except:
            missing = []
        try:
            matching = json.loads(self.matching_skills)
        except:
            matching = []
        try:
            sugg = json.loads(self.suggestions)
        except:
            sugg = []
        try:
            secs = json.loads(self.section_scores)
        except:
            secs = {}
            
        return {
            'id': self.id,
            'resume_id': self.resume_id,
            'user_id': self.user_id,
            'job_id': self.job_id,
            'overall_score': round(self.overall_score, 1),
            'match_score': round(self.match_score, 1),
            'extracted_skills': skills,
            'missing_skills': missing,
            'matching_skills': matching,
            'suggestions': sugg,
            'section_scores': secs,
            'analysis_type': self.analysis_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    actor_name = db.Column(db.String(100), nullable=True)
    actor_role = db.Column(db.String(50), nullable=True)
    action = db.Column(db.String(100), nullable=False, index=True)
    target_type = db.Column(db.String(50), nullable=True)  # 'user', 'job', 'company', 'application'
    target_id = db.Column(db.Integer, nullable=True)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'actor_id': self.actor_id,
            'actor_name': self.actor_name or 'System',
            'actor_role': self.actor_role or 'system',
            'action': self.action,
            'target_type': self.target_type or '',
            'target_id': self.target_id,
            'details': self.details or '',
            'ip_address': self.ip_address or '',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
