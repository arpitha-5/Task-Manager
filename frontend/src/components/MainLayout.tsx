import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useSocketStore from '../store/useSocketStore';
import Sidebar from './Sidebar';
import AIAssistant from './AIAssistant';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
  const { user, currentProject } = useAuthStore();
  const { connect, socket } = useSocketStore();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      connect(user._id);
    }
  }, [user]);

  useEffect(() => {
    if (socket && currentProject) {
      socket.emit('join', currentProject._id);
    }
  }, [socket, currentProject]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Messages page needs full height without padding
  const isMessagesPage = location.pathname === '/messages';

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-['Inter']">
      <Sidebar />
      <AIAssistant />
      
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
        <div className={isMessagesPage ? 'h-full' : 'p-8 max-w-[1600px] mx-auto min-h-full'}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={isMessagesPage ? 'h-full' : ''}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
