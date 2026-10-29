# JobConnect — AI-Powered Job Recruitment Portal

[![Full-Stack](https://img.shields.io/badge/Stack-React%20%7C%20Flask%20%7C%20TailwindCSS-0284c7.svg)](#)
[![Python](https://img.shields.io/badge/Backend-Python%203.11%20%2F%20Flask-0d9488.svg)](#)
[![Frontend](https://img.shields.io/badge/Frontend-Vite%20%2F%20React%2018-38bdf8.svg)](#)
[![Database](https://img.shields.io/badge/Database-SQLite%20%2F%20PostgreSQL%20Ready-6366f1.svg)](#)
[![AI-Engine](https://img.shields.io/badge/AI%20Engine-NLP%20%26%20Transparent%20Matcher-10b981.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](#)

**JobConnect** is an enterprise-grade, full-stack recruitment platform connecting job seekers with hiring companies through transparent AI skill matching, automated resume diagnostics, and role-based recruitment pipelines.

Built with a modern **blue, white, and teal** design language, the platform features dedicated, end-to-end workflows for **Job Seekers**, **Recruiters**, and **Administrators**.

---

## 🌟 Key Capabilities & Features

### 1. Modern Design & User Experience
* **Palette:** Built with a premium Blue (`#0284c7`), White (`#ffffff`), and Teal (`#0d9488`) color scheme.
* **Responsive Layouts:** Optimized for desktop monitors, laptops, tablets, and mobile smartphones.
* **Data Visualizations:** Interactive charts powered by **Recharts** displaying recruitment pipelines, category distributions, and applicant volumes.
* **Landing Page:** Engaging hero section with live multi-filter search, dynamic platform metrics counter, AI spotlight comparison, top hiring companies, and category discovery.

### 2. Multi-Role Authentication & Security
* **Three Dedicated Roles:**
  * **Job Seekers:** Profile builder, resume manager, application tracker, saved jobs, notifications.
  * **Recruiters:** Company branding, vacancy publishing, ATS candidate evaluation, interview scheduling, recruitment analytics.
  * **Administrators:** Platform governance, user status toggles, job moderation, company badge verification, immutable audit logs.
* **Security:** Secure password hashing with Werkzeug, JWT token authentication with expiration, role-based access decorators (`@token_required`, `@role_required`).

### 3. AI-Powered Intelligence Suite
* **Resume Text Extraction:** Extracts structured text from uploaded **PDF**, **DOCX**, and **TXT** files.
* **Technical Skill Ontology:** Curated dictionary covering hundreds of canonical programming languages, cloud platforms, DevOps tools, databases, and AI/ML frameworks.
* **Transparent Skill Matching:**
  * Compares candidate profiles and resumes against job requirements.
  * Calculates exact match percentages without black-box auto-rejections.
  * Displays explicit **Matching Skills** (in teal) and **Missing Skills** (in rose).
* **Resume Quality Diagnostics (ATS Scanner):**
  * Evaluates section completeness, impact action verbs, and quantifiable metrics.
  * Generates prioritized improvement suggestions (High, Medium, Low).
* **AI Job Description Generator:**
  * Recruiter assistant that auto-generates professional responsibilities, requirements, and required skills in one click.
* **AI Fallback Assurance:**
  * High-accuracy heuristic rule-based engine built-in.
  * Clearly tags results as `rule_based` analysis, ensuring compliance with ethical AI hiring standards.

### 4. Recruiter Applicant Tracking System (ATS)
* View candidate resumes and match breakdowns side-by-side.
* Update application lifecycle statuses: `Applied` ➔ `Under Review` ➔ `Shortlisted` ➔ `Interview Scheduled` ➔ `Hired` / `Rejected`.
* Built-in **Interview Scheduler** with meeting links (Google Meet/Zoom), time slots, location types, and automatic candidate notifications.

### 5. Administrative Governance & Audit Trail
* Moderation queue to approve, flag, or permanently delete fraudulent job postings.
* Company verification badge management (`is_verified`).
* Complete **Platform Audit Trail** capturing timestamps, actor IDs, actions, target IDs, and IP addresses.

---

## 🏗️ Architecture & Technology Stack

```mermaid
flowchart TD
    Client["React 18 + Vite + Tailwind CSS\n(Port 5173)"]
    Proxy["Vite Dev Proxy (/api, /uploads)"]
    Flask["Python Flask REST Backend\n(Port 5000)"]
    Auth["JWT Auth & Role Guards"]
    AI["AI Engine (NLP, PyPDF, Docx, Ontologies)"]
    DB[(SQLite / PostgreSQL Database)]
    Storage["Upload Storage (PDF / DOCX)"]

    Client -->|HTTP / JSON| Proxy
    Proxy -->|REST Endpoints| Flask
    Flask --> Auth
    Flask --> AI
    Flask --> DB
    Flask --> Storage
```

* **Frontend:** React 18, Vite 6, Tailwind CSS 3, Lucide React Icons, Recharts, Axios, React Router 6.
* **Backend:** Python 3.11, Flask 3, Flask-SQLAlchemy 3, Flask-CORS, PyJWT, Werkzeug.
* **Document Processing:** PyPDF, Python-docx, Pure-Python regex & heuristic NLP text analyzer.
* **Database:** SQLite (development) / PostgreSQL (production ready via `DATABASE_URL`).

---

## 🚀 Quickstart Guide (Run Locally)

### Prerequisites
* **Python 3.10+** (Tested on Python 3.11)
* **Node.js 18+** & **npm 9+**

---

### Step 1: Backend Setup & Database Seeding

Open a terminal and navigate to the `backend` folder:

```powershell
cd jobconnect/backend
```

1. **Install Python dependencies:**
   ```powershell
   pip install flask flask-cors flask-sqlalchemy pyjwt pypdf python-docx werkzeug
   ```

2. **Seed the database with demonstration data:**
   ```powershell
   python seed_data.py
   ```
   *This initializes the database (`jobconnect.db`), generates tables, seeds verified companies (NexusTech, CloudScale, FinWave), jobs, candidate profiles, sample applications, and audit logs.*

3. **Start the Flask backend server:**
   ```powershell
   python run.py
   ```
   *The backend will run on `http://127.0.0.1:5000`.*

---

### Step 2: Frontend Setup

Open a second terminal window and navigate to the `frontend` directory:

```powershell
cd jobconnect/frontend
```

1. **Install npm dependencies:**
   ```powershell
   npm install
   ```

2. **Start the Vite development server:**
   ```powershell
   npm run dev
   ```
   *The frontend application will start on `http://localhost:5173`.*

Open **http://localhost:5173** in your web browser!

---

## 🔑 Preconfigured Demo Accounts

For convenient evaluation and demonstration, the login page (`/login`) includes **1-Click Quick Demo Login buttons**:

| Role | Email | Password | Name & Organization |
| :--- | :--- | :--- | :--- |
| **Job Seeker** | `seeker@jobconnect.ai` | `Seeker123!` | Jane Doe (Senior Full Stack Developer) |
| **Recruiter** | `recruiter@techcorp.com` | `Recruiter123!` | Sarah Jenkins (NexusTech Innovations) |
| **Administrator** | `admin@jobconnect.ai` | `AdminPass123!` | Alex Vance (Platform Administrator) |

*You can also create fresh accounts anytime via the `/register` page.*

---

## 📁 Project Directory Structure

```text
jobconnect/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory, CORS, static file router
│   │   ├── config.py            # SQLite/PostgreSQL, JWT, and upload configuration
│   │   ├── models.py            # SQLAlchemy models (User, Job, Application, Resume, etc.)
│   │   ├── auth.py              # JWT decorators (@token_required, @role_required)
│   │   ├── routes/
│   │   │   ├── auth_routes.py         # Login, register, profile fetch
│   │   │   ├── jobs_routes.py         # Search, filters, recommendations, details
│   │   │   ├── candidate_routes.py    # Resumes, applications, saved jobs, profile
│   │   │   ├── recruiter_routes.py    # Job posting, ATS applicants, interviews
│   │   │   ├── admin_routes.py        # User management, job moderation, audit logs
│   │   │   ├── ai_routes.py           # Resume analysis, job matching, AI job description
│   │   │   ├── notification_routes.py # In-app notification center
│   │   │   └── company_routes.py      # Company directory and active vacancies
│   │   └── services/
│   │       ├── ai_engine.py     # PDF/DOCX parser, skills ontology, match algorithm
│   │       └── audit_service.py # Administrative activity logger
│   ├── seed_data.py             # Realistic demonstration data seeder
│   ├── run.py                   # Backend entrypoint (Port 5000)
│   ├── requirements.txt         # Python package list
│   └── uploads/resumes/         # Storage for candidate resumes
│
├── frontend/
│   ├── index.html               # Web root with Inter typography & favicon
│   ├── vite.config.js           # Vite dev server with /api proxy to Flask
│   ├── tailwind.config.js       # Custom blue & teal theme configuration
│   ├── src/
│   │   ├── api/client.js        # Axios instance with JWT bearer token interceptor
│   │   ├── context/AuthContext.jsx # Global auth provider & session state
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Responsive header with role menus & notifications
│   │   │   ├── Footer.jsx       # Platform footer & tech stack details
│   │   │   ├── JobCard.jsx      # Interactive card with AI match score pill & save
│   │   │   ├── SkillBadge.jsx   # Matching (teal) & missing (rose) skill badges
│   │   │   └── ProtectedRoute.jsx # Role-based route guard
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Landing page with hero search & featured jobs
│   │   │   ├── Login.jsx        # Login page with 1-click demo logins
│   │   │   ├── Register.jsx     # Dual-role signup (Job Seeker / Recruiter)
│   │   │   ├── JobsList.jsx     # Search & filter page (category, salary, remote)
│   │   │   ├── JobDetail.jsx    # Vacancy view, AI match breakdown & apply modal
│   │   │   ├── ResumeAnalyzer.jsx # Standalone AI Resume Diagnostics Studio
│   │   │   ├── CompaniesList.jsx & CompanyDetail.jsx
│   │   │   ├── candidate/       # Seeker dashboard, profile, resumes, applications
│   │   │   ├── recruiter/       # Recruiter analytics, job form, ATS applicants
│   │   │   ├── admin/           # Platform stats, users, moderation, audit logs
│   │   │   └── NotFound.jsx
└── README.md
```

---

## 📡 REST API Reference

### Public & Authentication
* `POST /api/auth/register` — Register new candidate or recruiter account.
* `POST /api/auth/login` — Authenticate and receive JWT token.
* `GET  /api/auth/me` — Retrieve current user profile and role details.
* `GET  /api/jobs` — Browse jobs with keyword, category, salary, and remote filters.
* `GET  /api/jobs/:id` — View full job details with real-time AI match breakdown.
* `GET  /api/companies` — Browse hiring companies and active job openings.

### Candidate APIs (`@role_required('job_seeker')`)
* `GET  /api/candidate/dashboard` — Metric counts, upcoming interviews, and recent applications.
* `GET  /api/candidate/profile` & `PUT /api/candidate/profile` — Manage skills, education, and experience.
* `POST /api/candidate/resumes/upload` — Upload PDF/DOCX resume for text & skill extraction.
* `POST /api/candidate/applications` — Submit job application with resume & cover letter.
* `GET  /api/candidate/applications` — Track application lifecycle statuses.
* `POST /api/candidate/saved-jobs/:id` — Bookmark a job.

### Recruiter APIs (`@role_required('recruiter')`)
* `GET  /api/recruiter/dashboard` — Analytics pipeline metrics for Recharts.
* `POST /api/recruiter/jobs` — Publish a new vacancy with required skills and salary.
* `GET  /api/recruiter/jobs/:id/applicants` — ATS candidate review with match score breakdown.
* `PUT  /api/recruiter/applications/:id/status` — Update candidate status and send notification.
* `POST /api/recruiter/interviews` — Schedule interview with Google Meet link and notes.

### Administrator APIs (`@role_required('admin')`)
* `GET  /api/admin/stats` — Platform-wide statistics and category metrics.
* `GET  /api/admin/users` & `PUT /api/admin/users/:id/status` — Manage user accounts.
* `PUT  /api/admin/jobs/:id/moderate` — Approve, flag, or remove fraudulent listings.
* `PUT  /api/admin/companies/:id/verify` — Toggle verified corporate badge.
* `GET  /api/admin/audit-logs` — Immutable platform audit trail.

---

## 🌐 Production Build & Deployment

### Production Frontend Build
```powershell
cd jobconnect/frontend
npm run build
```
This generates the optimized production bundle inside `frontend/dist/` (`index.html`, minified CSS, bundled JS).

### Production WSGI Backend
For production Linux servers (Ubuntu/Debian), run Flask with Gunicorn:
```bash
pip install gunicorn psycopg2-binary
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

### PostgreSQL Migration
To use PostgreSQL in production instead of SQLite, set the environment variable:
```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/jobconnect_db"
```
SQLAlchemy handles table schema creation automatically.

---

## 🎓 College Project & Portfolio Demonstration Highlights

1. **Real Full-Stack Architecture:** Persistent database storage, real JWT authentication, RESTful API client with axios interceptors, and complete server-side validation.
2. **Deterministic & Transparent AI:** Skill matching calculates exact overlap from an extensive knowledge base rather than a random score generator.
3. **Multi-Role Workflows:** Demonstrates real-world software engineering with role-based permissions for Seekers, Recruiters, and Admins.
4. **Clean Code & Modern Stack:** React 18 with hooks and context, Tailwind CSS utility classes, Python Flask factory pattern, and SQLAlchemy ORM models.
