import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Briefcase, Sparkles, User, Bell, LogOut, ChevronDown,
  Menu, X, Check, Building, FileText, Bookmark, LayoutDashboard, Shield, PlusCircle
} from 'lucide-react';

const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000); // Polling every 25s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const markNotificationRead = async (id, link) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifDropdownOpen(false);
      if (link) navigate(link);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">Job<span className="text-brand-600">Connect</span></span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5 text-teal-600" /> AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium -mt-1">Smart Recruitment Portal</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/jobs"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/jobs') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Browse Jobs
            </Link>

            <Link
              to="/companies"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/companies') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Companies
            </Link>

            <Link
              to="/resume-analyzer"
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                isActive('/resume-analyzer') ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span>AI Resume Studio</span>
            </Link>

            {/* Quick role link */}
            {isAuthenticated && role === 'recruiter' && (
              <Link
                to="/recruiter/jobs/new"
                className="ml-2 inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post a Vacancy</span>
              </Link>
            )}

            {isAuthenticated && role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="ml-2 inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setProfileDropdownOpen(false);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative focus:outline-none transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-4 h-4 text-brand-600" />
                          <span className="font-semibold text-sm text-slate-800">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-100 text-brand-700">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => markNotificationRead(notif.id, notif.link)}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                                !notif.is_read ? 'bg-brand-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                                {!notif.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-teal-500 mt-1"></span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1.5 block">
                                {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center space-x-2 p-1.5 pl-2 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-xs font-semibold text-slate-800 leading-tight">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-[10px] capitalize text-slate-400 font-medium">
                        {role === 'job_seeker' ? 'Job Seeker' : role}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900">{user.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 capitalize">
                          Role: {role.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Role-specific dashboard links */}
                      {role === 'job_seeker' && (
                        <>
                          <Link
                            to="/candidate/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            <span>Candidate Dashboard</span>
                          </Link>
                          <Link
                            to="/candidate/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/candidate/resumes"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span>Resumes & AI Analysis</span>
                          </Link>
                          <Link
                            to="/candidate/applications"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span>Track Applications</span>
                          </Link>
                          <Link
                            to="/candidate/saved-jobs"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <Bookmark className="w-4 h-4 text-slate-400" />
                            <span>Saved Jobs</span>
                          </Link>
                        </>
                      )}

                      {role === 'recruiter' && (
                        <>
                          <Link
                            to="/recruiter/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            <span>Recruiter Dashboard</span>
                          </Link>
                          <Link
                            to="/recruiter/jobs/new"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <PlusCircle className="w-4 h-4 text-slate-400" />
                            <span>Post New Vacancy</span>
                          </Link>
                          <Link
                            to="/recruiter/jobs"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span>Manage Job Postings</span>
                          </Link>
                          <Link
                            to="/recruiter/company"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <Building className="w-4 h-4 text-slate-400" />
                            <span>Company Profile</span>
                          </Link>
                        </>
                      )}

                      {role === 'admin' && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            <span>Admin Dashboard</span>
                          </Link>
                          <Link
                            to="/admin/users"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            <span>Manage Users</span>
                          </Link>
                          <Link
                            to="/admin/jobs"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span>Moderate Jobs</span>
                          </Link>
                          <Link
                            to="/admin/companies"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <Building className="w-4 h-4 text-slate-400" />
                            <span>Verify Companies</span>
                          </Link>
                          <Link
                            to="/admin/audit-logs"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <Shield className="w-4 h-4 text-slate-400" />
                            <span>Audit Logs</span>
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && (
              <Link to="/candidate/dashboard" className="p-2 text-slate-600">
                <Bell className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1">
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Browse Jobs
            </Link>
            <Link
              to="/companies"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Companies
            </Link>
            <Link
              to="/resume-analyzer"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-teal-700 hover:bg-teal-50 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span>AI Resume Studio</span>
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <div className="px-3 text-xs font-semibold text-slate-400 uppercase">
                {role.replace('_', ' ')} Dashboard
              </div>
              {role === 'job_seeker' && (
                <>
                  <Link to="/candidate/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Dashboard Overview</Link>
                  <Link to="/candidate/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">My Profile</Link>
                  <Link to="/candidate/resumes" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Resumes & AI Analysis</Link>
                  <Link to="/candidate/applications" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Track Applications</Link>
                </>
              )}
              {role === 'recruiter' && (
                <>
                  <Link to="/recruiter/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Recruiter Dashboard</Link>
                  <Link to="/recruiter/jobs/new" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Post Vacancy</Link>
                  <Link to="/recruiter/jobs" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Manage Jobs</Link>
                </>
              )}
              {role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Admin Analytics</Link>
                  <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Manage Users</Link>
                  <Link to="/admin/jobs" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Moderate Jobs</Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-primary"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
