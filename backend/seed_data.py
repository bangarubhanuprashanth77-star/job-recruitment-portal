import os
import json
from datetime import datetime, timedelta
from app import create_app
from app.models import (
    db, User, CandidateProfile, Company, Job, Application,
    Resume, SavedJob, Interview, Notification, ResumeAnalysisReport, AuditLog
)

app = create_app()

def seed_database():
    with app.app_context():
        print("Clearing existing database tables...")
        db.drop_all()
        db.create_all()
        
        print("Seeding demo users...")
        
        # 1. Admin User
        admin = User(
            email="admin@jobconnect.ai",
            role="admin",
            first_name="Alex",
            last_name="Vance",
            phone="+1 (555) 019-2831",
            is_active=True
        )
        admin.set_password("AdminPass123!")
        db.session.add(admin)
        
        # 2. Recruiters
        recruiter_sarah = User(
            email="recruiter@techcorp.com",
            role="recruiter",
            first_name="Sarah",
            last_name="Jenkins",
            phone="+1 (555) 234-5678",
            is_active=True
        )
        recruiter_sarah.set_password("Recruiter123!")
        db.session.add(recruiter_sarah)
        
        recruiter_david = User(
            email="david@cloudscale.io",
            role="recruiter",
            first_name="David",
            last_name="Ross",
            phone="+1 (555) 345-6789",
            is_active=True
        )
        recruiter_david.set_password("Recruiter123!")
        db.session.add(recruiter_david)
        
        recruiter_elena = User(
            email="elena@finwave.com",
            role="recruiter",
            first_name="Elena",
            last_name="Rivera",
            phone="+1 (555) 456-7890",
            is_active=True
        )
        recruiter_elena.set_password("Recruiter123!")
        db.session.add(recruiter_elena)
        
        # 3. Job Seekers
        seeker_jane = User(
            email="seeker@jobconnect.ai",
            role="job_seeker",
            first_name="Jane",
            last_name="Doe",
            phone="+1 (555) 789-0123",
            is_active=True
        )
        seeker_jane.set_password("Seeker123!")
        db.session.add(seeker_jane)
        
        seeker_kevin = User(
            email="kevin@jobconnect.ai",
            role="job_seeker",
            first_name="Kevin",
            last_name="Patel",
            phone="+1 (555) 890-1234",
            is_active=True
        )
        seeker_kevin.set_password("Seeker123!")
        db.session.add(seeker_kevin)
        
        seeker_maria = User(
            email="maria@jobconnect.ai",
            role="job_seeker",
            first_name="Maria",
            last_name="Rodriguez",
            phone="+1 (555) 901-2345",
            is_active=True
        )
        seeker_maria.set_password("Seeker123!")
        db.session.add(seeker_maria)
        
        db.session.flush()
        
        print("Seeding Candidate Profiles...")
        jane_profile = CandidateProfile(
            user_id=seeker_jane.id,
            headline="Senior Full Stack Engineer | React, Node.js, Python, AWS",
            bio="Passionate software engineer with 5+ years of experience designing and shipping scalable web applications and distributed cloud systems. Strong believer in clean architecture, performance optimization, and intuitive user experiences.",
            location="San Francisco, CA (Open to Remote)",
            current_title="Senior Full Stack Engineer",
            years_experience=5.5,
            skills=json.dumps(["React.js", "TypeScript", "JavaScript", "Python", "Node.js", "PostgreSQL", "Docker", "AWS", "REST APIs", "Tailwind CSS", "Git"]),
            education=json.dumps([
                {"degree": "B.S. in Computer Science", "school": "University of California, Berkeley", "year": "2019"}
            ]),
            experience=json.dumps([
                {"title": "Senior Frontend Developer", "company": "Vanguard Tech", "duration": "2022 - Present", "description": "Led team of 6 engineers redesigning core SaaS platform using React & TypeScript, boosting user retention by 28%."},
                {"title": "Software Engineer", "company": "DevSphere Labs", "duration": "2019 - 2022", "description": "Built resilient REST APIs in Python & Node.js handling 15M daily requests."}
            ]),
            github_url="https://github.com/janedoe-demo",
            linkedin_url="https://linkedin.com/in/janedoe-demo",
            portfolio_url="https://janedoe.dev"
        )
        db.session.add(jane_profile)
        
        kevin_profile = CandidateProfile(
            user_id=seeker_kevin.id,
            headline="AI/ML Engineer & Researcher | PyTorch, NLP, LLMs, Computer Vision",
            bio="Machine learning engineer specializing in NLP, fine-tuning large language models, and deploying low-latency deep learning pipelines to production clusters.",
            location="Boston, MA",
            current_title="AI Research Engineer",
            years_experience=4.0,
            skills=json.dumps(["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "NLP", "LLMs", "Pandas", "NumPy", "Docker", "Machine Learning", "Git"]),
            education=json.dumps([
                {"degree": "M.S. in Artificial Intelligence", "school": "Boston University", "year": "2021"}
            ]),
            experience=json.dumps([
                {"title": "Machine Learning Engineer", "company": "Cognitive AI", "duration": "2021 - Present", "description": "Implemented RAG architecture and LLM evaluation benchmarks reducing hallucination rates by 34%."}
            ]),
            github_url="https://github.com/kevinpatel-ai",
            linkedin_url="https://linkedin.com/in/kevinpatel-ai"
        )
        db.session.add(kevin_profile)
        
        maria_profile = CandidateProfile(
            user_id=seeker_maria.id,
            headline="Cloud & DevOps Architect | Kubernetes, Terraform, AWS, CI/CD",
            bio="DevOps architect enthusiastic about zero-downtime deployments, infrastructure-as-code, and automating scalable CI/CD pipelines.",
            location="Austin, TX",
            current_title="Lead DevOps Engineer",
            years_experience=6.0,
            skills=json.dumps(["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux", "Python", "Bash", "Nginx", "Git"]),
            education=json.dumps([
                {"degree": "B.S. in Information Systems", "school": "UT Austin", "year": "2018"}
            ]),
            experience=json.dumps([
                {"title": "DevOps Architect", "company": "CloudNet Solutions", "duration": "2020 - Present", "description": "Migrated monolithic infrastructure to Kubernetes EKS, lowering cloud costs by $120k annually."}
            ])
        )
        db.session.add(maria_profile)
        
        print("Seeding Companies...")
        nexustech = Company(
            recruiter_id=recruiter_sarah.id,
            name="NexusTech Innovations",
            logo="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop",
            website="https://nexustech.io",
            description="NexusTech is an enterprise AI software company empowering global enterprises with automated decision intelligence, real-time analytics, and collaborative workflow tools.",
            industry="Software & AI",
            location="San Francisco, CA",
            company_size="51-200",
            is_verified=True
        )
        db.session.add(nexustech)
        
        cloudscale = Company(
            recruiter_id=recruiter_david.id,
            name="CloudScale Systems",
            logo="https://images.unsplash.com/photo-1542744094-3a31f272c490?w=150&h=150&fit=crop",
            website="https://cloudscale.io",
            description="CloudScale delivers next-generation cloud infrastructure, observability telemetry, and high-performance serverless edge compute for global internet platforms.",
            industry="Cloud Computing",
            location="Seattle, WA",
            company_size="201-1000",
            is_verified=True
        )
        db.session.add(cloudscale)
        
        finwave = Company(
            recruiter_id=recruiter_elena.id,
            name="FinWave Technologies",
            logo="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop",
            website="https://finwave.com",
            description="Modern financial technology platform revolutionizing instant cross-border payments, decentralized treasury solutions, and automated compliance.",
            industry="Fintech",
            location="New York, NY",
            company_size="51-200",
            is_verified=True
        )
        db.session.add(finwave)
        
        db.session.flush()
        
        print("Seeding Jobs...")
        job1 = Job(
            company_id=nexustech.id,
            title="Senior Full Stack Engineer (React & Python)",
            description="We are seeking an experienced Senior Full Stack Engineer to lead architecture on our next-generation customer analytics platform. You will build user-facing interactive dashboards in React/TypeScript and highly performant backend microservices in Python.",
            responsibilities="• Architect and ship scalable full stack web features with high test coverage.\n• Collaborate with UX researchers and product managers on customer workflow enhancements.\n• Optimize client bundle sizes and backend database queries for sub-second latency.\n• Mentor junior and mid-level software engineers on modern coding standards.",
            requirements="• 4+ years of professional full stack software development experience.\n• Proficiency in React.js, TypeScript, and modern CSS frameworks (Tailwind).\n• Strong command of Python (FastAPI/Flask/Django) and relational databases (PostgreSQL).\n• Hands-on familiarity with Docker containerization and cloud deployments.",
            category="Software Development",
            employment_type="Full-time",
            experience_level="Senior",
            location="Remote / San Francisco",
            is_remote=True,
            salary_min=140000,
            salary_max=180000,
            salary_currency="USD",
            skills_required=json.dumps(["React.js", "TypeScript", "Python", "PostgreSQL", "Docker", "REST APIs", "Git"]),
            status="active",
            views_count=142
        )
        db.session.add(job1)
        
        job2 = Job(
            company_id=nexustech.id,
            title="AI / ML Platform Engineer",
            description="Join our AI research team to build and maintain end-to-end model training pipelines, automated feature stores, and high-throughput inference endpoints for generative AI workflows.",
            responsibilities="• Design distributed ML training pipelines using PyTorch and GPU clusters.\n• Package and deploy foundation models with optimized quantized runtimes.\n• Build data ingestion pipelines processing millions of structured records daily.\n• Collaborate with product teams to integrate AI models into customer apps.",
            requirements="• Strong foundation in machine learning, linear algebra, and data structures.\n• Hands-on proficiency with PyTorch, Scikit-Learn, Pandas, and NumPy.\n• Experience with vector databases, RAG architecture, or LLM fine-tuning.\n• Proficiency in Python and container technologies (Docker, Kubernetes).",
            category="Artificial Intelligence & ML",
            employment_type="Full-time",
            experience_level="Mid-level",
            location="San Francisco, CA",
            is_remote=False,
            salary_min=135000,
            salary_max=175000,
            salary_currency="USD",
            skills_required=json.dumps(["Python", "Machine Learning", "PyTorch", "LLMs", "Docker", "Pandas", "Scikit-Learn"]),
            status="active",
            views_count=98
        )
        db.session.add(job2)
        
        job3 = Job(
            company_id=cloudscale.id,
            title="Lead DevOps & Kubernetes Architect",
            description="CloudScale is looking for a Lead DevOps Architect to manage our multi-region Kubernetes clusters, establish continuous delivery guardrails, and elevate our site reliability standards.",
            responsibilities="• Architect resilient multi-region Kubernetes (EKS/GKE) infrastructure using Terraform.\n• Maintain zero-downtime CI/CD automation pipelines for 50+ microservices.\n• Implement proactive observability, alerting, and incident response playbooks.\n• Ensure SOC2 and ISO compliance across cloud security policies.",
            requirements="• 5+ years supporting production cloud infrastructure at scale.\n• Deep expertise in Kubernetes, Docker, Helm, and Linux kernel fundamentals.\n• Advanced proficiency in Terraform (IaC) and cloud providers (AWS or GCP).\n• Strong scripting skills in Python, Go, or Bash.",
            category="Cloud & DevOps",
            employment_type="Full-time",
            experience_level="Lead",
            location="Remote",
            is_remote=True,
            salary_min=160000,
            salary_max=200000,
            salary_currency="USD",
            skills_required=json.dumps(["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux", "Python"]),
            status="active",
            views_count=185
        )
        db.session.add(job3)
        
        job4 = Job(
            company_id=finwave.id,
            title="Senior React & Frontend Engineer",
            description="Help us build ultra-secure, intuitive financial dashboards and real-time transaction tracking interfaces. You will champion accessibility, micro-interactions, and state performance.",
            responsibilities="• Craft sleek, responsive user interfaces in React.js and Tailwind CSS.\n• Manage complex client state and asynchronous web socket feeds.\n• Collaborate closely with product designers to implement interactive charting modules.\n• Conduct code reviews and enforce frontend test coverage with Jest and Cypress.",
            requirements="• 4+ years dedicated frontend engineering experience.\n• Expert-level JavaScript and TypeScript mastery.\n• Solid understanding of component lifecycles, hooks, and virtualized lists.\n• Experience with financial technology, security best practices, and REST APIs.",
            category="Software Development",
            employment_type="Full-time",
            experience_level="Senior",
            location="New York, NY",
            is_remote=True,
            salary_min=130000,
            salary_max=165000,
            salary_currency="USD",
            skills_required=json.dumps(["React.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML", "CSS", "REST APIs", "Git"]),
            status="active",
            views_count=210
        )
        db.session.add(job4)
        
        job5 = Job(
            company_id=cloudscale.id,
            title="Cloud Security & Compliance Specialist",
            description="We are hiring a security engineer to safeguard our cloud perimeter, conduct continuous vulnerability audits, and guide secure code design across engineering squads.",
            responsibilities="• Audit IAM roles, network topologies, and container image registries.\n• Perform threat modeling and automated static/dynamic code vulnerability scans.\n• Respond to security incidents and engineer automated threat remediation.\n• Guide engineering teams on OWASP Top 10 mitigation.",
            requirements="• 3+ years in cloud security or cybersecurity operations.\n• In-depth knowledge of AWS security groups, VPC peering, and KMS encryption.\n• Familiarity with container security tools and penetration testing.\n• Relevant certifications (CISSP, AWS Security Specialty) are a strong plus.",
            category="Cybersecurity",
            employment_type="Full-time",
            experience_level="Mid-level",
            location="Seattle, WA",
            is_remote=True,
            salary_min=125000,
            salary_max=160000,
            salary_currency="USD",
            skills_required=json.dumps(["Cybersecurity", "AWS", "Linux", "Docker", "Python", "CI/CD"]),
            status="active",
            views_count=77
        )
        db.session.add(job5)
        
        job6 = Job(
            company_id=finwave.id,
            title="Lead Product Designer (UI/UX)",
            description="Shape the visual and interactive identity of our fintech products. You will turn complex transactional workflows into delightful, effortless digital experiences.",
            responsibilities="• Lead end-to-end user research, interactive wireframing, and high-fidelity prototyping.\n• Maintain and scale our unified Design System in Figma.\n• Partner with frontend engineers to ensure design fidelity in production builds.\n• Conduct usability testing sessions and iterate based on metrics.",
            requirements="• 5+ years designing consumer or B2B SaaS products.\n• Outstanding design portfolio demonstrating user-centric problem solving.\n• Mastery of Figma, design systems, and responsive layout standards.\n• Basic understanding of HTML/CSS capabilities and constraints.",
            category="UI/UX & Product Design",
            employment_type="Full-time",
            experience_level="Lead",
            location="New York, NY",
            is_remote=True,
            salary_min=135000,
            salary_max=170000,
            salary_currency="USD",
            skills_required=json.dumps(["UI/UX", "System Design", "Agile", "Project Management"]),
            status="active",
            views_count=114
        )
        db.session.add(job6)
        
        db.session.flush()
        
        print("Seeding Sample Resume and Applications...")
        # Sample Resume for Jane Doe
        sample_resume_text = """
JANE DOE
Senior Full Stack Engineer
San Francisco, CA | (555) 789-0123 | jane@jobconnect.ai | github.com/janedoe-demo | linkedin.com/in/janedoe-demo

PROFESSIONAL SUMMARY
Highly accomplished Senior Full Stack Engineer with 5+ years of experience designing scalable web applications, RESTful microservices, and reactive frontend architectures. Proven track record of reducing latency by 40%, scaling applications to 10M+ users, and leading agile engineering teams.

TECHNICAL SKILLS
• Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3, Bash
• Frameworks & Libraries: React.js, Node.js, Express, Next.js, FastAPI, Flask, Tailwind CSS, Redux
• Databases: PostgreSQL, MongoDB, Redis, SQLite
• Cloud & DevOps: AWS (EC2, S3, RDS), Docker, Kubernetes, CI/CD, Git, GitHub Actions, Linux
• Methodologies: System Design, REST APIs, Agile / Scrum, Unit Testing (Jest, PyTest)

PROFESSIONAL EXPERIENCE
Vanguard Tech | Senior Frontend Developer | San Francisco, CA | 2022 – Present
• Spearheaded the complete overhaul of core SaaS dashboard using React.js and TypeScript, increasing user session engagement by 28%.
• Architected reusable component library adopted across 4 distributed squads, reducing frontend feature delivery cycles by 35%.
• Optimized Webpack build pipelines and code-splitting, cutting initial page load times by 45%.
• Mentored 5 associate software engineers through bi-weekly pair programming and system design reviews.

DevSphere Labs | Full Stack Software Engineer | San Francisco, CA | 2019 – 2022
• Developed and deployed 12 high-throughput REST APIs in Python (FastAPI) and Node.js servicing over 15M daily requests.
• Implemented automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing production deployment rollbacks to under 1%.
• Designed PostgreSQL schema migrations and integrated Redis caching, boosting database query performance by 50%.
• Collaborated in an agile scrum team delivering bi-weekly customer feature releases.

EDUCATION
University of California, Berkeley
Bachelor of Science in Computer Science | Graduated May 2019
"""
        resume_dir = app.config['UPLOAD_FOLDER']
        os.makedirs(resume_dir, exist_ok=True)
        jane_resume_file = os.path.join(resume_dir, f"{seeker_jane.id}_sample_jane_doe_resume.txt")
        with open(jane_resume_file, "w", encoding="utf-8") as f:
            f.write(sample_resume_text)
            
        jane_resume = Resume(
            candidate_id=seeker_jane.id,
            filename=f"{seeker_jane.id}_sample_jane_doe_resume.txt",
            original_name="Jane_Doe_Resume_2026.pdf",
            file_path=jane_resume_file,
            file_size=len(sample_resume_text),
            file_type="txt",
            extracted_text=sample_resume_text,
            extracted_skills=json.dumps(["React.js", "TypeScript", "JavaScript", "Python", "Node.js", "PostgreSQL", "Docker", "AWS", "REST APIs", "Tailwind CSS", "Git", "Redis", "MongoDB", "Linux", "CI/CD"])
        )
        db.session.add(jane_resume)
        db.session.flush()
        
        # Applications
        app1 = Application(
            job_id=job1.id,
            candidate_id=seeker_jane.id,
            resume_id=jane_resume.id,
            cover_letter="I am thrilled to apply for the Senior Full Stack Engineer role at NexusTech Innovations. With over 5 years of experience building modern React interfaces and resilient Python microservices, I am confident I can make an immediate impact on your team.",
            status="Interview Scheduled",
            match_score=94.5,
            match_details=json.dumps({
                "match_percentage": 94.5,
                "matching_skills": ["Docker", "Git", "PostgreSQL", "Python", "React.js", "REST APIs", "TypeScript"],
                "missing_skills": [],
                "total_required_skills": 7,
                "is_strong_match": True,
                "explanation": "Match calculated from 7 out of 7 required technical skills and contextual relevance."
            }),
            recruiter_notes="Outstanding profile and strong culture fit. Technical interview scheduled."
        )
        db.session.add(app1)
        
        app2 = Application(
            job_id=job4.id,
            candidate_id=seeker_jane.id,
            resume_id=jane_resume.id,
            cover_letter="My deep expertise in React, TypeScript, and state management makes me well-suited for FinWave's mission of building intuitive financial interfaces.",
            status="Under Review",
            match_score=91.0,
            match_details=json.dumps({
                "match_percentage": 91.0,
                "matching_skills": ["CSS", "Git", "HTML", "JavaScript", "React.js", "REST APIs", "Tailwind CSS", "TypeScript"],
                "missing_skills": [],
                "total_required_skills": 8,
                "is_strong_match": True
            })
        )
        db.session.add(app2)
        
        app3 = Application(
            job_id=job2.id,
            candidate_id=seeker_kevin.id,
            cover_letter="As an AI researcher focused on LLMs and distributed training pipelines, I am eager to contribute to NexusTech's AI platform.",
            status="Shortlisted",
            match_score=96.0,
            match_details=json.dumps({
                "match_percentage": 96.0,
                "matching_skills": ["Docker", "LLMs", "Machine Learning", "Pandas", "PyTorch", "Python", "Scikit-Learn"],
                "missing_skills": [],
                "total_required_skills": 7,
                "is_strong_match": True
            })
        )
        db.session.add(app3)
        
        app4 = Application(
            job_id=job3.id,
            candidate_id=seeker_maria.id,
            cover_letter="With 6+ years managing large-scale Kubernetes clusters and infrastructure automation, I would love to lead DevOps at CloudScale.",
            status="Hired",
            match_score=95.0,
            match_details=json.dumps({
                "match_percentage": 95.0,
                "matching_skills": ["AWS", "CI/CD", "Docker", "Kubernetes", "Linux", "Python", "Terraform"],
                "missing_skills": [],
                "total_required_skills": 7,
                "is_strong_match": True
            }),
            recruiter_notes="Candidate accepted formal offer! Excellent hire."
        )
        db.session.add(app4)
        
        # Saved Job for Jane
        saved_job = SavedJob(candidate_id=seeker_jane.id, job_id=job3.id)
        db.session.add(saved_job)
        
        db.session.flush()
        
        print("Seeding Interviews & Notifications...")
        interview1 = Interview(
            application_id=app1.id,
            job_id=job1.id,
            candidate_id=seeker_jane.id,
            recruiter_id=recruiter_sarah.id,
            scheduled_date=(datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
            scheduled_time="02:30 PM",
            meeting_link="https://meet.google.com/xyz-jobconnect-demo",
            location_type="Remote",
            notes="Technical architecture walkthrough and React/Python coding discussion with engineering lead.",
            status="Scheduled"
        )
        db.session.add(interview1)
        
        # Notifications
        n1 = Notification(
            user_id=seeker_jane.id,
            title="Interview Scheduled!",
            message=f"Sarah Jenkins scheduled your technical interview for 'Senior Full Stack Engineer' on {(datetime.now() + timedelta(days=2)).strftime('%b %d, %Y')} at 02:30 PM.",
            type="interview_scheduled",
            link="/candidate/applications",
            is_read=False
        )
        db.session.add(n1)
        
        n2 = Notification(
            user_id=seeker_jane.id,
            title="New AI Job Match (94%)",
            message="We found a new job 'Senior Full Stack Engineer' at NexusTech that matches 94% of your skills.",
            type="job_alert",
            link="/jobs/1",
            is_read=True
        )
        db.session.add(n2)
        
        n3 = Notification(
            user_id=recruiter_sarah.id,
            title="High Match Applicant Received",
            message="Jane Doe applied for Senior Full Stack Engineer (94.5% AI match).",
            type="application_status",
            link="/recruiter/jobs/1/applicants",
            is_read=False
        )
        db.session.add(n3)
        
        print("Seeding Audit Logs...")
        logs = [
            AuditLog(actor_id=admin.id, actor_name="Alex Vance", actor_role="admin", action="COMPANY_VERIFIED", target_type="company", target_id=nexustech.id, details="Verified NexusTech Innovations corporate credentials"),
            AuditLog(actor_id=admin.id, actor_name="Alex Vance", actor_role="admin", action="COMPANY_VERIFIED", target_type="company", target_id=cloudscale.id, details="Verified CloudScale Systems corporate credentials"),
            AuditLog(actor_id=recruiter_sarah.id, actor_name="Sarah Jenkins", actor_role="recruiter", action="JOB_CREATED", target_type="job", target_id=job1.id, details="Published vacancy 'Senior Full Stack Engineer'"),
            AuditLog(actor_id=seeker_jane.id, actor_name="Jane Doe", actor_role="job_seeker", action="APPLICATION_SUBMITTED", target_type="application", target_id=app1.id, details="Submitted application with 94.5% AI match score"),
            AuditLog(actor_id=recruiter_sarah.id, actor_name="Sarah Jenkins", actor_role="recruiter", action="INTERVIEW_SCHEDULED", target_type="interview", target_id=interview1.id, details="Scheduled technical round for Jane Doe")
        ]
        for l in logs:
            db.session.add(l)
            
        db.session.commit()
        print("Database seeded successfully with rich demo data!")

if __name__ == '__main__':
    seed_database()
