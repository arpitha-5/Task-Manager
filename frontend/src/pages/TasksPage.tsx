import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus, Search, X, Calendar, Flag, CheckSquare, MoreHorizontal,
  Trash2, GripVertical, Clock, AlertTriangle,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'Backlog', label: 'Backlog', dot: 'bg-slate-400' },
  { id: 'To Do', label: 'To Do', dot: 'bg-blue-400' },
  { id: 'In Progress', label: 'In Progress', dot: 'bg-amber-400' },
  { id: 'Review', label: 'Review', dot: 'bg-purple-400' },
  { id: 'Completed', label: 'Done', dot: 'bg-emerald-400' },
];

const priorityConfig: Record<string, { color: string; bg: string }> = {
  Low: { color: 'text-slate-500', bg: 'bg-slate-400/10' },
  Medium: { color: 'text-blue-400', bg: 'bg-blue-400/10' },
  High: { color: 'text-orange-400', bg: 'bg-orange-400/10' },
  Urgent: { color: 'text-red-400', bg: 'bg-red-400/10' },
  Critical: { color: 'text-rose-300', bg: 'bg-rose-400/10' },
};

const TasksPage = () => {
  const { currentWorkspace } = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const [newTask, setNewTask] = useState({
    title: '', description: '', status: 'To Do', priority: 'Medium',
    dueDate: '', projectId: '',
  });

  useEffect(() => {
    if (currentWorkspace) { fetchTasks(); fetchProjects(); }
    else setIsLoading(false);
  }, [currentWorkspace]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/tasks/workspace/${currentWorkspace!._id}`);
      setTasks(res.data.data);
    } catch { /* empty */ } finally { setIsLoading(false); }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get(`/projects/workspace/${currentWorkspace!._id}`);
      setProjects(res.data.data);
    } catch { /* empty */ }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.projectId || !newTask.dueDate) {
      toast.error('Fill in title, project, and due date'); return;
    }
    try {
      await api.post('/tasks', newTask);
      toast.success('Task created');
      setShowModal(false);
      setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', dueDate: '', projectId: '' });
      fetchTasks();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/tasks/${id}`); fetchTasks(); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    // Optimistic update
    setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t));

    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus });
    } catch {
      fetchTasks(); // rollback
      toast.error('Failed to update');
    }
  };

  const filtered = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const getColumnTasks = (status: string) => filtered.filter(t => t.status === status);

  const isOverdue = (d: string) => new Date(d) < new Date();

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!currentWorkspace) return (
    <div className="h-full flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto">
      <CheckSquare size={40} className="text-slate-500" />
      <h2 className="text-3xl font-black">No Workspace Selected</h2>
      <p className="text-slate-500 font-medium">Select a workspace to manage tasks.</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-500 font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
            Task Management
          </div>
          <h1 className="text-4xl font-black tracking-tight">Board</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="text" placeholder="Search..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-900/[0.03] border border-slate-900/5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50 text-sm font-medium w-48" />
          </div>
          <div className="flex bg-slate-900/[0.03] rounded-xl border border-slate-900/5 p-0.5">
            <button onClick={() => setViewMode('board')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'board' ? 'bg-slate-900/10 text-slate-900' : 'text-slate-500'}`}>Board</button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-slate-900/10 text-slate-900' : 'text-slate-500'}`}>List</button>
          </div>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2.5 btn-primary text-slate-900 rounded-xl font-bold text-sm flex items-center gap-2">
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === 'board' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
            {COLUMNS.map(col => (
              <div key={col.id} className="w-72 shrink-0 flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`}></div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">{col.label}</span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-900/5 px-2 py-0.5 rounded-md">{getColumnTasks(col.id).length}</span>
                  </div>
                  <button onClick={() => { setNewTask({ ...newTask, status: col.id }); setShowModal(true); }}
                    className="p-1 hover:bg-slate-900/5 rounded-lg text-slate-600 hover:text-slate-500 transition-all">
                    <Plus size={14} />
                  </button>
                </div>

                {/* Droppable Column */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-2.5 p-2 rounded-2xl transition-colors min-h-[200px] ${snapshot.isDraggingOver ? 'bg-primary-500/5 ring-1 ring-primary-500/20' : 'bg-slate-900/[0.01]'}`}
                    >
                      {getColumnTasks(col.id).map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`p-4 rounded-xl border transition-all group ${
                                snap.isDragging
                                  ? 'bg-slate-100/90 border-primary-500/40 shadow-xl shadow-primary-500/10 rotate-1 scale-[1.02]'
                                  : 'bg-slate-900/[0.025] border-slate-900/5 hover:border-slate-900/10'
                              }`}
                            >
                              {/* Priority + Project */}
                              <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${priorityConfig[task.priority]?.bg} ${priorityConfig[task.priority]?.color}`}>
                                    {task.priority}
                                  </span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }}
                                  className="p-1 text-slate-700 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 size={12} />
                                </button>
                              </div>

                              {/* Title */}
                              <h4 className={`font-bold text-sm leading-snug mb-2 ${task.status === 'Completed' ? 'line-through text-slate-500' : ''}`}>
                                {task.title}
                              </h4>

                              {/* Meta */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                  {task.dueDate && (
                                    <span className={`flex items-center gap-1 text-[10px] font-bold ${isOverdue(task.dueDate) && task.status !== 'Completed' ? 'text-red-400' : 'text-slate-500'}`}>
                                      {isOverdue(task.dueDate) && task.status !== 'Completed' ? <AlertTriangle size={10} /> : <Clock size={10} />}
                                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                                {typeof task.project === 'object' && task.project?.name && (
                                  <span className="text-[9px] font-bold text-slate-600 bg-slate-900/5 px-2 py-0.5 rounded-md truncate max-w-[80px]">
                                    {task.project.name}
                                  </span>
                                )}
                              </div>

                              {/* Assignees */}
                              {task.assignedTo?.length > 0 && (
                                <div className="flex -space-x-2 mt-3">
                                  {task.assignedTo.slice(0, 3).map((u: any) => (
                                    <img key={u._id} src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.name}&background=random&size=24`}
                                      alt="" className="w-6 h-6 rounded-full border-2 border-[#0f172a]" />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <CheckSquare size={40} className="text-slate-600" />
              <p className="text-lg font-black text-slate-500">No tasks found</p>
            </div>
          ) : filtered.map((task, i) => (
            <motion.div key={task._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-4 p-4 bg-slate-900/[0.02] border border-slate-900/5 rounded-xl hover:border-slate-900/10 transition-all group"
            >
              <button onClick={() => api.put(`/tasks/${task._id}`, { status: task.status === 'Completed' ? 'To Do' : 'Completed' }).then(fetchTasks)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 hover:border-primary-500'}`}>
                {task.status === 'Completed' && <CheckSquare size={12} className="text-slate-900" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${task.status === 'Completed' ? 'line-through text-slate-500' : ''}`}>{task.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  {typeof task.project === 'object' && <span className="text-[10px] font-bold text-slate-500">{task.project.name}</span>}
                  {task.dueDate && <span className="text-[10px] text-slate-500 font-bold">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${priorityConfig[task.priority]?.bg} ${priorityConfig[task.priority]?.color}`}>{task.priority}</span>
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-slate-900/5 text-slate-500`}>{task.status}</span>
              <button onClick={() => handleDelete(task._id)} className="p-1.5 text-slate-600 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg glass-card rounded-3xl border border-slate-900/10 p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">Create Task</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-900/5 rounded-xl"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Title</label>
                  <input type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-3 bg-slate-900/[0.03] border border-slate-900/5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Add details..." rows={2}
                    className="w-full px-4 py-3 bg-slate-900/[0.03] border border-slate-900/5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50 text-sm font-medium resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Project</label>
                    <select value={newTask.projectId} onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })} required
                      className="w-full px-4 py-3 bg-slate-900/[0.03] border border-slate-900/5 rounded-xl outline-none text-sm font-bold">
                      <option value="">Select</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Due Date</label>
                    <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} required
                      className="w-full px-4 py-3 bg-slate-900/[0.03] border border-slate-900/5 rounded-xl outline-none text-sm font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                    <select value={newTask.status} onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/[0.03] border border-slate-900/5 rounded-xl outline-none text-sm font-bold">
                      {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Priority</label>
                    <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/[0.03] border border-slate-900/5 rounded-xl outline-none text-sm font-bold">
                      {['Low', 'Medium', 'High', 'Urgent', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-3.5 btn-primary text-slate-900 rounded-xl font-black text-sm shadow-lg shadow-primary-500/20 mt-2">
                  Create Task
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;
