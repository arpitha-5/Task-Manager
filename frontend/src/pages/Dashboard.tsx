import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, CheckSquare, Clock, Zap, Search, Activity, Plus, Compass,
  ArrowUpRight, AlertTriangle, FolderOpen, TrendingUp, Calendar,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import NotificationBell from '../components/NotificationBell';

const Dashboard = () => {
  const { user, currentProject } = useAuthStore();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentProject) { fetchAll(); }
    else if (user) { fetchAll(); } // Fetch all if no current project selected
    else setIsLoading(false);
  }, [currentProject, user]);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [tasksRes, projectsRes] = await Promise.all([
        api.get(currentProject ? `/tasks?projectId=${currentProject._id}` : '/tasks'),
        api.get('/projects'),
      ]);
      setTasks(tasksRes.data.data);
      setProjects(projectsRes.data.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const COLORS = ['#64748b', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'];

  const now = new Date();
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done');
  const upcomingTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d >= now && d <= new Date(now.getTime() + 7 * 86400000) && t.status !== 'Done';
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5);
  
  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100) : 0;

  // Mock data for productivity trend since we don't have a backend endpoint yet
  const productivityData = [
    { day: 'Mon', completed: 2 },
    { day: 'Tue', completed: 5 },
    { day: 'Wed', completed: 3 },
    { day: 'Thu', completed: 8 },
    { day: 'Fri', completed: 6 },
    { day: 'Sat', completed: 4 },
    { day: 'Sun', completed: 7 },
  ];

  const statusDistribution = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'To Do').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length },
    { name: 'Review', value: tasks.filter(t => t.status === 'Review').length },
    { name: 'Testing', value: tasks.filter(t => t.status === 'Testing').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'Done').length },
  ].filter(s => s.value > 0);

  const cardStats = [
    { name: 'Total Tasks', value: tasks.length, icon: <CheckSquare size={18} />, grad: 'from-blue-500/15 to-cyan-500/15', text: 'text-cyan-400', change: '+' + tasks.filter(t => { const c = new Date(t.createdAt); return now.getTime() - c.getTime() < 7 * 86400000; }).length + ' this week' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'Done').length, icon: <TrendingUp size={18} />, grad: 'from-emerald-500/15 to-teal-500/15', text: 'text-emerald-400', change: `${completionRate}% rate` },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, icon: <Clock size={18} />, grad: 'from-amber-500/15 to-orange-500/15', text: 'text-amber-400', change: 'Active now' },
    { name: 'Overdue', value: overdueTasks.length, icon: <AlertTriangle size={18} />, grad: 'from-red-500/15 to-rose-500/15', text: 'text-red-400', change: overdueTasks.length > 0 ? 'Needs attention' : 'All clear' },
    { name: 'Projects', value: projects.length, icon: <FolderOpen size={18} />, grad: 'from-violet-500/15 to-purple-500/15', text: 'text-purple-400', change: `${projects.filter(p => p.status === 'Active').length} active` },
    { name: 'Efficiency', value: `${completionRate}%`, icon: <Zap size={18} />, grad: 'from-pink-500/15 to-fuchsia-500/15', text: 'text-pink-400', change: 'Overall score' },
  ];

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 animate-pulse">Loading dashboard data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tight">
            Welcome, <span className="text-primary-500">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            {currentProject ? `Here's what's happening in ${currentProject.name}` : "Overview of all your projects"}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="text" placeholder="Search..." className="w-full pl-11 pr-4 py-2.5 bg-slate-900/[0.03] border border-slate-900/5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50 text-sm font-medium" />
          </div>
          <NotificationBell />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cardStats.map((s, i) => (
          <motion.div key={s.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 rounded-2xl border border-slate-900/5 group cursor-default">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.grad} ${s.text} w-fit mb-3`}>{s.icon}</div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.name}</p>
            <p className="text-2xl font-black mt-0.5">{s.value}</p>
            <p className="text-[10px] font-bold text-slate-600 mt-1">{s.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-900/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black">Productivity</h2>
              <p className="text-xs text-slate-500 font-medium">Weekly completion velocity</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/5 rounded-xl border border-slate-900/5">
              <Activity size={12} className="text-primary-500" />
              <span className="text-[10px] font-black uppercase text-slate-500">Live</span>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="completed" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-900/5">
            <h2 className="text-lg font-black mb-1">Workload</h2>
            <div className="h-[140px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={42} outerRadius={60} paddingAngle={4} dataKey="value">
                    {statusDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-black">{completionRate}%</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Done</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {statusDistribution.map((e, i) => (
                <div key={e.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[9px] font-bold text-slate-500 truncate">{e.name}</span>
                  <span className="text-[9px] font-black ml-auto">{e.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-900/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">Upcoming</h2>
              <Calendar size={14} className="text-slate-500" />
            </div>
            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium py-4 text-center">No upcoming deadlines</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingTasks.map(t => (
                  <div key={t._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-900/[0.03] transition-all">
                    <div className="w-1.5 h-8 rounded-full bg-primary-500/40"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{t.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card p-6 rounded-3xl border border-slate-900/5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black">Recent Tasks</h2>
            <button onClick={() => navigate('/tasks')} className="text-xs font-bold text-primary-500 hover:text-primary-400 flex items-center gap-1">
              View All <ArrowUpRight size={12} />
            </button>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-slate-500 font-medium py-8 text-center">No tasks yet — create your first one!</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map(t => (
                <div key={t._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-900/[0.03] transition-all group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${t.status === 'Done' ? 'bg-emerald-500/15 text-emerald-400' :
                      t.status === 'In Progress' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-blue-500/15 text-blue-400'
                    }`}>
                    <CheckSquare size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${t.status === 'Done' ? 'text-slate-500 line-through' : ''}`}>{t.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {t.project?.name || ''} • {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${t.priority === 'High' || t.priority === 'Urgent'
                      ? 'bg-red-500/10 text-red-400' : 'bg-slate-900/5 text-slate-500'
                    }`}>{t.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button onClick={() => navigate('/tasks')} className="w-full flex items-center gap-4 p-5 glass-card rounded-2xl border border-slate-900/5 hover:border-primary-500/30 transition-all group text-left">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-slate-900 transition-all">
              <Plus size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">New Task</h4>
              <p className="text-[10px] text-slate-500 font-medium">Add to backlog</p>
            </div>
          </button>
          <button onClick={() => navigate('/projects')} className="w-full flex items-center gap-4 p-5 glass-card rounded-2xl border border-slate-900/5 hover:border-accent-purple/30 transition-all group text-left">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center group-hover:bg-accent-purple group-hover:text-slate-900 transition-all">
              <FolderOpen size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Manage Projects</h4>
              <p className="text-[10px] text-slate-500 font-medium">Launch an initiative</p>
            </div>
          </button>
          
          {projects.length > 0 && (
            <div className="glass-card p-5 rounded-2xl border border-slate-900/5">
              <h3 className="text-sm font-black mb-3">All Projects</h3>
              <div className="space-y-2">
                {projects.slice(0, 5).map(p => (
                  <div key={p._id} onClick={() => { useAuthStore.getState().setCurrentProject(p); navigate('/'); }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900/[0.03] cursor-pointer transition-all">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: p.color || '#3b82f6' }}></div>
                    <span className="text-xs font-bold truncate flex-1">{p.name}</span>
                    <ArrowUpRight size={12} className="text-slate-600" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
