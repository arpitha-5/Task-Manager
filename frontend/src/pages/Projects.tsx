import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Users, 
  Briefcase,
  ChevronRight,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const { currentWorkspace } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    category: 'Engineering',
    color: '#3b82f6'
  });

  useEffect(() => {
    if (currentWorkspace) {
      fetchProjects();
    }
  }, [currentWorkspace]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/projects/workspace/${currentWorkspace._id}`);
      setProjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', {
        ...formData,
        workspaceId: currentWorkspace._id
      });
      toast.success('Project created successfully');
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight">Projects</h1>
          <p className="text-slate-500 font-medium">Manage and track your team's strategic initiatives.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 btn-primary text-slate-900 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-primary-500/20"
        >
          <Plus size={20} />
          Create New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-slate-900/[0.03] p-1.5 rounded-2xl border border-slate-900/5">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900/10 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-900/10 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ListIcon size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="pl-12 pr-4 py-3 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium text-sm w-64"
            />
          </div>
          <button className="p-3 glass-card rounded-2xl text-slate-500 hover:text-slate-900 transition-all border border-slate-900/5">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-[2.5rem] bg-slate-900/5 animate-pulse"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-slate-900/5 flex items-center justify-center text-slate-600">
            <Briefcase size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black">No projects yet</h3>
            <p className="text-slate-500 font-medium">Create your first project to start tracking tasks.</p>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
          {projects.map((project: any) => (
            <motion.div
              layout
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(`/projects/${project._id}`)}
              className={`glass-card p-8 rounded-[2.5rem] border border-slate-900/5 hover:border-primary-500/30 transition-all group cursor-pointer relative overflow-hidden ${viewMode === 'list' ? 'flex items-center justify-between py-4' : ''}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl -mr-10 -mt-10 rounded-full group-hover:bg-primary-500/10 transition-colors"></div>
              
              <div className={viewMode === 'list' ? "flex items-center gap-6 flex-1" : "space-y-6"}>
                <div className="flex justify-between items-start">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg`} style={{ backgroundColor: project.color || '#3b82f6' }}>
                    <Briefcase size={28} />
                  </div>
                  {viewMode === 'grid' && (
                    <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{project.category}</span>
                  </div>
                  <h3 className="text-2xl font-black group-hover:text-primary-400 transition-colors">{project.name}</h3>
                  <p className="text-slate-500 font-medium line-clamp-2 mt-2">{project.description || 'No description provided.'}</p>
                </div>
              </div>

              {viewMode === 'grid' && (
                <div className="pt-8 mt-8 border-t border-slate-900/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#020617] bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                          U
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-500">+12 more</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} />
                    <span className="text-xs font-black">{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
              
              {viewMode === 'list' && (
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} />
                    <span className="text-xs font-black">{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl glass-card p-10 rounded-[2.5rem] border border-slate-900/10 shadow-2xl"
            >
              <h2 className="text-3xl font-black mb-8">Launch Initiative</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Project Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    type="text" 
                    placeholder="e.g. Infrastructure Overhaul"
                    className="w-full px-4 py-4 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Briefly describe the objective..."
                    className="w-full px-4 py-4 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium h-32 resize-none"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Deadline</label>
                    <input 
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      type="date" 
                      className="w-full px-4 py-4 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-4 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium appearance-none"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-900/5 hover:bg-slate-900/10 rounded-2xl font-black transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 btn-primary text-slate-900 rounded-2xl font-black shadow-xl shadow-primary-500/20 transition-all"
                  >
                    Launch Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
