import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import useSocketStore from '../store/useSocketStore';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join_notifications', user._id);
      
      socket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.success(notification.title);
      });

      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.data.filter((n: any) => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 btn-ghost rounded-xl text-slate-500 hover:text-slate-900 relative transition-all"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse border border-[#0f172a]"></div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 glass-card rounded-3xl border border-slate-900/10 shadow-2xl z-[100] overflow-hidden"
          >
            <div className="p-4 border-b border-slate-900/5 flex items-center justify-between bg-slate-900/[0.02]">
              <h3 className="font-black text-sm uppercase tracking-widest">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-[10px] font-black text-primary-500 hover:text-primary-400 uppercase tracking-widest"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell size={40} className="mx-auto text-slate-900/10 mb-3" />
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">All caught up!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n._id}
                    onClick={() => !n.read && markAsRead(n._id)}
                    className={`p-4 border-b border-slate-900/5 hover:bg-slate-900/[0.03] transition-all cursor-pointer relative ${!n.read ? 'bg-primary-500/[0.02]' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900/5 flex items-center justify-center shrink-0 border border-slate-900/5">
                        {n.type === 'task_assigned' ? <Check size={14} className="text-emerald-500" /> :
                         n.type === 'task_updated' ? <Clock size={14} className="text-amber-500" /> :
                         <AlertTriangle size={14} className="text-primary-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black truncate">{n.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{n.message}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-tighter">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
