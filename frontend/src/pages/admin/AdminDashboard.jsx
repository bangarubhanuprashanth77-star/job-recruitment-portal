import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Shield, Users, Briefcase, Building, FileText, CheckCircle2,
  AlertTriangle, ArrowRight, Activity, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie
} from 'recharts';

const CATEGORY_COLORS = ['#0284c7', '#0d9488', '#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const catDist = data?.category_distribution || [];
  const statusBreakdown = data?.status_breakdown || [];
  const recentUsers = data?.recent_users || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Administrative Operations Console</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Metrics & Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Monitor candidate activity, moderate active vacancies, verify companies, and maintain platform security audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/jobs"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
            >
              Moderate Jobs
            </Link>
            <Link
              to="/admin/companies"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-colors"
            >
              Verify Companies
            </Link>
            <Link
              to="/admin/audit-logs"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              Audit Trail
            </Link>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Users</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_users || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stats.job_seekers || 0} seekers • {stats.recruiters || 0} recruiters</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Companies</div>
            <div className="text-2xl font-black text-brand-600 mt-1">{stats.total_companies || 0}</div>
            <div className="text-[10px] text-teal-600 font-semibold mt-0.5">{stats.verified_companies || 0} verified</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Jobs</div>
            <div className="text-2xl font-black text-teal-600 mt-1">{stats.active_jobs || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stats.total_jobs || 0} total listings</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Flagged Jobs</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.flagged_jobs || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Awaiting review</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Applications</div>
            <div className="text-2xl font-black text-purple-600 mt-1">{stats.total_applications || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Platform volume</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hires Made</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.hired_count || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stats.interviews_count || 0} interviews</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Vacancies by Category */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Vacancies by Category</h3>
                <p className="text-[11px] text-slate-400">Distribution across tech specializations</p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catDist} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="jobs" radius={[6, 6, 0, 0]}>
                    {catDist.map((_, index) => (
                      <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Application Statuses */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Application Pipeline Volume</h3>
                <p className="text-[11px] text-slate-400">Status counts across all platform candidates</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {statusBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">{item.name}</span>
                  <span className="font-extrabold px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Recent Registrations Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-600" />
                <span>Recently Registered Accounts</span>
              </h2>
              <p className="text-[11px] text-slate-400">Latest candidates, recruiters, and platform administrators</p>
            </div>
            <Link to="/admin/users" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
              Manage All Users
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900">{u.full_name}</td>
                    <td className="py-3 text-slate-500">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'recruiter' ? 'bg-brand-100 text-brand-800' :
                        'bg-teal-100 text-teal-800'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center text-[11px] font-semibold ${
                        u.is_active ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          u.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}></span>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
