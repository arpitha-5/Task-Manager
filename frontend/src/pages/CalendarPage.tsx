import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, Flag } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

const priorityDots: Record<string, string> = {
  Low: 'bg-slate-400',
  Medium: 'bg-blue-400',
  High: 'bg-orange-400',
  Urgent: 'bg-red-400',
  Critical: 'bg-rose-400',
};

const CalendarPage = () => {
  const { currentWorkspace } = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (currentWorkspace) {
      fetchTasks();
    } else {
      setIsLoading(false);
    }
  }, [currentWorkspace]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/tasks/workspace/${currentWorkspace!._id}`);
      setTasks(res.data.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getTasksForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.dueDate && t.dueDate.substring(0, 10) === dateStr);
  };

  const selectedDateStr = selectedDate;
  const selectedTasks = selectedDate
    ? tasks.filter(t => t.dueDate && t.dueDate.substring(0, 10) === selectedDate)
    : [];

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-16 rounded-2xl" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayTasks = getTasksForDate(day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = new Date().toISOString().substring(0, 10) === dateStr;
    const isSelected = selectedDate === dateStr;

    days.push(
      <motion.button
        key={day}
        whileHover={{ scale: 1.02 }}
        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
        className={`h-16 rounded-xl border transition-all text-left p-2 flex flex-col ${
          isSelected ? 'border-primary-500 bg-primary-500/10' :
          isToday ? 'border-primary-500/30 bg-slate-900/[0.02]' :
          'border-slate-900/5 bg-slate-900/[0.01] hover:bg-slate-900/[0.03]'
        }`}
      >
        <span className={`text-[11px] font-black ${isToday ? 'text-primary-500' : 'text-slate-500'}`}>{day}</span>
        <div className="flex-1 mt-0.5 space-y-0.5 overflow-hidden">
          {dayTasks.slice(0, 1).map(t => (
            <div key={t._id} className="flex items-center gap-1">
              <div className={`w-1 h-1 rounded-full shrink-0 ${priorityDots[t.priority] || 'bg-slate-400'}`}></div>
              <span className="text-[9px] font-bold text-slate-700 truncate leading-none">{t.title}</span>
            </div>
          ))}
          {dayTasks.length > 1 && (
            <span className="text-[8px] font-bold text-slate-500 leading-none">+{dayTasks.length - 1} more</span>
          )}
        </div>
      </motion.button>
    );
  }

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!currentWorkspace) return (
    <div className="h-full flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto">
      <Calendar size={40} className="text-slate-500" />
      <h2 className="text-3xl font-black">No Workspace Selected</h2>
      <p className="text-slate-500 font-medium">Select a workspace to view calendar.</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary-500 font-bold text-xs uppercase tracking-[0.2em] mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
          Schedule Overview
        </div>
        <h1 className="text-4xl font-black tracking-tight">Calendar</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-3 glass-card rounded-[2rem] border border-slate-900/5 p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black">{monthName} <span className="text-slate-500">{year}</span></h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2.5 rounded-xl hover:bg-slate-900/5 border border-slate-900/5 transition-all">
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-all"
              >
                Today
              </button>
              <button onClick={nextMonth} className="p-2.5 rounded-xl hover:bg-slate-900/5 border border-slate-900/5 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[9px] font-black text-slate-500 uppercase tracking-widest py-1">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </div>

        {/* Sidebar — Selected Date Tasks */}
        <div className="space-y-6">
          <div className="glass-card rounded-[2.5rem] border border-slate-900/5 p-6">
            <h3 className="text-lg font-black mb-1">
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : 'Select a date'}
            </h3>
            <p className="text-xs text-slate-500 font-bold mb-6">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} scheduled
            </p>

            {selectedTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">
                  {selectedDate ? 'No tasks on this date' : 'Click a date to see tasks'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedTasks.map(task => (
                  <div key={task._id} className="p-4 bg-slate-900/[0.03] rounded-2xl border border-slate-900/5 space-y-2">
                    <h4 className="font-bold text-sm">{task.title}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                        priorityDots[task.priority] ? `${priorityDots[task.priority].replace('bg-', 'bg-')}/20 text-${priorityDots[task.priority].replace('bg-', '')}` : 'bg-slate-500/20 text-slate-500'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {typeof task.project === 'object' ? task.project.name : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task Stats */}
          <div className="glass-card rounded-[2.5rem] border border-slate-900/5 p-6">
            <h3 className="text-lg font-black mb-4">This Month</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Tasks', value: tasks.filter(t => {
                  const d = new Date(t.dueDate);
                  return d.getMonth() === month && d.getFullYear() === year;
                }).length, color: 'text-blue-400' },
                { label: 'Completed', value: tasks.filter(t => {
                  const d = new Date(t.dueDate);
                  return d.getMonth() === month && d.getFullYear() === year && t.status === 'Completed';
                }).length, color: 'text-emerald-400' },
                { label: 'Overdue', value: tasks.filter(t => {
                  return new Date(t.dueDate) < new Date() && t.status !== 'Completed';
                }).length, color: 'text-red-400' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{stat.label}</span>
                  <span className={`text-lg font-black ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
