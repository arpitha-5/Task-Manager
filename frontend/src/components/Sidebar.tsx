import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Calendar, 
  Settings, 
  LogOut, 
  ChevronRight,
  Plus,
  Compass,
  MessageSquare,
  BarChart3,
  Bell,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

const Sidebar = () => {
  const { user, logout, workspaces, currentWorkspace, setWorkspaces, setCurrentWorkspace } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await api.get('/workspaces');
        setWorkspaces(res.data.data);
        if (!currentWorkspace && res.data.data.length > 0) {
          // Set current workspace from user data or first one
          const current = res.data.data.find((w: any) => w._id === user?.currentWorkspace) || res.data.data[0];
          setCurrentWorkspace(current);
        }
      } catch (err) {
        console.error('Failed to fetch workspaces', err);
      }
    };
    fetchWorkspaces();
  }, [user]);

  const handleSwitchWorkspace = async (workspace: any) => {
    try {
      await api.put(`/workspaces/switch/${workspace._id}`);
      setCurrentWorkspace(workspace);
      setIsWorkspaceOpen(false);
      window.location.reload(); // Refresh to update all project/task contexts
    } catch (err) {
      console.error('Failed to switch workspace', err);
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Projects', icon: <Briefcase size={20} />, path: '/projects' },
    { name: 'Tasks', icon: <CheckSquare size={20} />, path: '/tasks' },
    { name: 'Calendar', icon: <Calendar size={20} />, path: '/calendar' },
    { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
    { name: 'Messages', icon: <MessageSquare size={20} />, path: '/messages' },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 88 : 280 }}
      className="h-screen glass-morphism border-r border-slate-900/5 flex flex-col z-50 sticky top-0 backdrop-blur-2xl"
    >
      {/* Brand & Workspace Switcher Section */}
      <div className="p-4 border-b border-slate-900/5 relative">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Compass className="text-slate-900" size={18} />
              </div>
              <span className="text-sm font-black tracking-tight uppercase">TaskFlow <span className="text-primary-500"></span></span>
            </motion.div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-slate-900/5 rounded-lg transition-all border border-transparent hover:border-slate-900/10"
          >
            <ChevronRight className={`text-slate-500 transition-transform duration-500 ${isCollapsed ? '' : 'rotate-180'}`} size={18} />
          </button>
        </div>

        {/* Workspace Dropdown */}
        <div className="relative">
          <button 
            onClick={() => !isCollapsed && setIsWorkspaceOpen(!isWorkspaceOpen)}
            className={`w-full p-3 rounded-2xl bg-slate-900/[0.03] border border-slate-900/5 flex items-center gap-3 transition-all hover:bg-slate-900/10 group ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-slate-900 font-black text-sm shrink-0 shadow-lg shadow-primary-600/20">
              {currentWorkspace?.name?.charAt(0) || 'W'}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 overflow-hidden text-left">
                  <p className="text-xs font-black truncate">{currentWorkspace?.name || 'Loading...'}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest"></p>
                </div>
                <div className={`transition-transform duration-300 ${isWorkspaceOpen ? 'rotate-180' : ''}`}>
                   <ChevronRight className="rotate-90 text-slate-500" size={14} />
                </div>
              </>
            )}
          </button>

          {/* Workspace Menu */}
          <AnimatePresence>
            {isWorkspaceOpen && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 p-2 glass-card rounded-[2rem] border border-slate-900/10 shadow-2xl z-[100] max-h-64 overflow-y-auto custom-scrollbar"
              >
                {workspaces.map((ws) => (
                  <button
                    key={ws._id}
                    onClick={() => handleSwitchWorkspace(ws)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-slate-900/5 ${ws._id === currentWorkspace?._id ? 'bg-slate-900/5' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-900/5">
                      {ws.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-xs font-black truncate">{ws.name}</p>
                      {ws._id === currentWorkspace?._id && <p className="text-[9px] text-primary-500 font-bold uppercase tracking-widest">Active</p>}
                    </div>
                  </button>
                ))}
                <div className="h-px bg-slate-900/5 my-2"></div>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl text-primary-500 hover:bg-primary-500/10 transition-all font-black text-xs">
                  <Plus size={16} />
                  New Workspace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {!isCollapsed && <p className="px-4 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Navigation</p>}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all relative group overflow-hidden ${
                isActive 
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-slate-900 shadow-lg shadow-primary-500/25' 
                : 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900'
              }`}
            >
              <span className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-bold text-sm"
                >
                  {item.name}
                </motion.span>
              )}
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-slate-900/20"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-900/5 bg-slate-900/[0.01]">
        <div className={`flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-900/5 transition-all cursor-pointer group ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-slate-900 font-black text-sm border border-slate-900/10 group-hover:border-primary-500/50 transition-all uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#020617] rounded-full"></div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black truncate">{user?.name}</p>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={logout}
            className="mt-4 flex items-center gap-3 w-full p-4 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all font-bold text-sm"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
