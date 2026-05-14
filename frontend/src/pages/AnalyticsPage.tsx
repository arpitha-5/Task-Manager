import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, CheckSquare, Clock, AlertTriangle, Users, FolderOpen, TrendingUp, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

const AnalyticsPage = () => {
  const { currentWorkspace } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentWorkspace) {
      fetchAnalytics();
    } else {
      setIsLoading(false);
    }
  }, [currentWorkspace]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/analytics/${currentWorkspace!._id}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!currentWorkspace) return (
    <div className="h-full flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto">
      <BarChart3 size={40} className="text-slate-500" />
      <h2 className="text-3xl font-black">No Workspace Selected</h2>
      <p className="text-slate-500 font-medium">Select a workspace to view analytics.</p>
    </div>
  );

  const ov = data?.overview || {};
  const statCards = [
    { label: 'Total Tasks', value: ov.totalTasks || 0, icon: <CheckSquare size={20} />, gradient: 'from-blue-500/20 to-cyan-500/20', text: 'text-cyan-400' },
    { label: 'Completed', value: ov.completedTasks || 0, icon: <TrendingUp size={20} />, gradient: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-400' },
    { label: 'In Progress', value: ov.inProgressTasks || 0, icon: <Clock size={20} />, gradient: 'from-amber-500/20 to-orange-500/20', text: 'text-amber-400' },
    { label: 'Overdue', value: ov.overdueTasks || 0, icon: <AlertTriangle size={20} />, gradient: 'from-red-500/20 to-rose-500/20', text: 'text-red-400' },
    { label: 'Projects', value: ov.totalProjects || 0, icon: <FolderOpen size={20} />, gradient: 'from-violet-500/20 to-purple-500/20', text: 'text-purple-400' },
    { label: 'Completion Rate', value: `${ov.completionRate || 0}%`, icon: <Zap size={20} />, gradient: 'from-pink-500/20 to-fuchsia-500/20', text: 'text-pink-400' },
  ];

  const COLORS = ['#64748b', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
          Workspace Intelligence
        </div>
        <h1 className="text-5xl font-black tracking-tight">Analytics</h1>
        <p className="text-slate-500 text-lg font-medium mt-1">Real-time performance metrics for <span className="text-slate-900 font-black">{currentWorkspace?.name}</span></p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 rounded-2xl border border-slate-900/5 hover:border-primary-500/20 transition-all"
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${s.gradient} ${s.text} w-fit mb-3`}>{s.icon}</div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Activity */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border border-slate-900/5">
          <h2 className="text-2xl font-black mb-1">Weekly Activity</h2>
          <p className="text-sm text-slate-500 font-medium mb-8">Tasks created vs completed over the last 7 days</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.weeklyActivity || []}>
                <defs>
                  <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                <Area type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#gn)" name="Created" />
                <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#gc)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie */}
        <div className="glass-card p-8 rounded-[2.5rem] border border-slate-900/5">
          <h2 className="text-2xl font-black mb-1">Status Mix</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">Current task distribution</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.statusDistribution || []} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {(data?.statusDistribution || []).map((e: any, i: number) => (
                    <Cell key={i} fill={e.color || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {(data?.statusDistribution || []).map((e: any) => (
              <div key={e.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }}></div>
                  <span className="text-xs font-bold text-slate-500">{e.name}</span>
                </div>
                <span className="text-xs font-black">{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Distribution */}
        <div className="glass-card p-8 rounded-[2.5rem] border border-slate-900/5">
          <h2 className="text-2xl font-black mb-1">Priority Breakdown</h2>
          <p className="text-sm text-slate-500 font-medium mb-8">Tasks grouped by urgency level</p>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.priorityDistribution || []} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {(data?.priorityDistribution || []).map((e: any, i: number) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Progress */}
        <div className="glass-card p-8 rounded-[2.5rem] border border-slate-900/5">
          <h2 className="text-2xl font-black mb-1">Project Progress</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">Completion rate by project</p>
          {(data?.projectBreakdown || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[250px]">
              <FolderOpen size={36} className="text-slate-600 mb-3" />
              <p className="text-sm text-slate-500 font-medium">No projects yet</p>
            </div>
          ) : (
            <div className="space-y-5 mt-4">
              {(data?.projectBreakdown || []).map((p: any) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">{p.name}</span>
                    <span className="text-xs font-black text-slate-500">{p.completed}/{p.total} tasks</span>
                  </div>
                  <div className="h-3 bg-slate-900/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: p.color }}
                    ></motion.div>
                  </div>
                  <p className="text-right text-xs font-black mt-1" style={{ color: p.color }}>{p.progress}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
