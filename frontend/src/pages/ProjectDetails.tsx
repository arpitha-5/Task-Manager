import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MoreVertical, 
  Filter, 
  Search, 
  Users, 
  Calendar,
  ChevronLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Hash
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../services/api';
import useSocketStore from '../store/useSocketStore';
import toast from 'react-hot-toast';

const COLUMNS = ['Backlog', 'To Do', 'In Progress', 'Review', 'Testing', 'Blocked', 'Completed'];

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocketStore();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState('To Do');

  useEffect(() => {
    if (socket && id) {
      socket.emit('join_project', id);
      socket.on('task_updated', (data: any) => {
        if (data.projectId === id) {
          setTasks(prev => prev.map(t => t._id === data.taskId ? { ...t, status: data.newStatus } : t));
        }
      });
    }
    return () => {
      socket?.off('task_updated');
    };
  }, [socket, id]);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      setIsLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      toast.error('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const updatedTasks = Array.from(tasks);
    const movedTask = updatedTasks.find(t => t._id === draggableId);
    if (!movedTask) return;

    // Update status locally
    movedTask.status = destination.droppableId;
    
    // Logic for reordering within the same list would go here
    // For now, we update the status and re-fetch or sync
    setTasks([...updatedTasks]);

    try {
      await api.put(`/tasks/${draggableId}`, { status: destination.droppableId });
      socket?.emit('task_updated', { projectId: id, taskId: draggableId, newStatus: destination.droppableId });
      toast.success('Task updated');
    } catch (err) {
      toast.error('Failed to update task');
      fetchProjectAndTasks(); // Rollback
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        ...taskForm,
        status: newTaskStatus,
        projectId: id
      });
      toast.success('Task created');
      setIsTaskModalOpen(false);
      fetchProjectAndTasks();
      setTaskForm({ title: '', description: '', priority: 'Medium', dueDate: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!project) return (
    <div className="h-full flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto">
      <div className="w-24 h-24 bg-slate-900/5 rounded-[2.5rem] flex items-center justify-center border border-slate-900/10">
        <AlertCircle size={40} className="text-slate-500" />
      </div>
      <h2 className="text-3xl font-black">Project Not Found</h2>
      <p className="text-slate-500 font-medium">The project you are looking for does not exist or has been moved.</p>
      <button onClick={() => navigate('/projects')} className="px-6 py-3 bg-primary-600 text-slate-900 rounded-xl font-black">Back to Projects</button>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Project Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-slate-900/5 rounded-xl transition-all text-slate-500"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest">Active Sprint</span>
              <span className="text-slate-600 font-bold text-xs">/ {project?.category}</span>
            </div>
            <h1 className="text-3xl font-black">{project?.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-100 flex items-center justify-center text-xs font-bold">U</div>
            ))}
            <button className="w-10 h-10 rounded-full border-2 border-dashed border-slate-900/10 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all">
              <Plus size={16} />
            </button>
          </div>
          <button className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-slate-900 rounded-xl font-black text-sm transition-all shadow-lg shadow-primary-500/20">
            Sprint Settings
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-900/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-primary-500 border-b-2 border-primary-500 pb-2 px-1">
            <LayoutGrid size={18} />
            <span className="text-sm font-black uppercase tracking-widest">Board</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-all cursor-pointer pb-2 px-1">
            <Hash size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">Backlog</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-all cursor-pointer pb-2 px-1">
            <Clock size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">Timeline</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-500" size={16} />
            <input type="text" placeholder="Search tasks..." className="bg-transparent border-none outline-none text-sm font-medium pl-9 w-48 placeholder:text-slate-600" />
          </div>
          <div className="h-4 w-px bg-slate-900/10"></div>
          <button className="p-2 text-slate-500 hover:text-slate-900 transition-all"><Filter size={18} /></button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar min-h-0">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full">
            {COLUMNS.map((column) => (
              <div key={column} className="flex flex-col w-80 shrink-0 bg-slate-900/[0.01] rounded-3xl p-4 border border-slate-900/5">
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-black text-sm uppercase tracking-widest text-slate-500">{column}</h3>
                    <span className="w-6 h-6 rounded-lg bg-slate-900/5 flex items-center justify-center text-[10px] font-black text-slate-500">
                      {tasks.filter(t => t.status === column).length}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setNewTaskStatus(column);
                      setIsTaskModalOpen(true);
                    }}
                    className="p-1.5 hover:bg-slate-900/5 rounded-lg text-slate-600 hover:text-primary-500 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <Droppable droppableId={column}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1"
                    >
                      {tasks
                        .filter(t => t.status === column)
                        .map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`glass-card p-5 rounded-2xl border border-slate-900/5 hover:border-primary-500/30 transition-all group ${snapshot.isDragging ? 'shadow-2xl shadow-primary-500/20 border-primary-500/50 rotate-2' : ''}`}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                    task.priority === 'Urgent' || task.priority === 'Critical' ? 'bg-red-500/10 text-red-500' :
                                    task.priority === 'High' ? 'bg-orange-500/10 text-orange-500' :
                                    'bg-slate-500/10 text-slate-500'
                                  }`}>
                                    {task.priority}
                                  </span>
                                  <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-slate-900 transition-all">
                                    <MoreVertical size={14} />
                                  </button>
                                </div>
                                <h4 className="font-bold text-sm mb-2 group-hover:text-primary-400 transition-colors">{task.title}</h4>
                                <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4">{task.description}</p>
                                
                                <div className="flex items-center justify-between pt-3 border-t border-slate-900/5">
                                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase">
                                    <Calendar size={12} />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold">U</div>
                                  </div>
                                </div>
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
      </div>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTaskModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg glass-card p-10 rounded-[2.5rem] border border-slate-900/10 shadow-2xl"
            >
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                <Plus className="text-primary-500" />
                New Task
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-auto">In {newTaskStatus}</span>
              </h2>
              <form onSubmit={handleCreateTask} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Title</label>
                  <input required value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} type="text" placeholder="What needs to be done?" className="w-full px-4 py-4 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                  <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="w-full px-4 py-4 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium h-32 resize-none" placeholder="Add more details..." />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Priority</label>
                    <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className="w-full px-4 py-4 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium appearance-none">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Due Date</label>
                    <input required value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} type="date" className="w-full px-4 py-4 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsTaskModalOpen(false)} className="flex-1 py-4 bg-slate-900/5 hover:bg-slate-900/10 rounded-2xl font-black transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 btn-primary text-slate-900 rounded-2xl font-black shadow-xl shadow-primary-500/20 transition-all">Create Task</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetails;
