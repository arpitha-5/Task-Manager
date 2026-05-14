import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, MessageSquare, Zap } from 'lucide-react';
import api from '../services/api';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your TaskFlow AI assistant. How can I help you optimize your workspace today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Simulating AI response logic
      setTimeout(() => {
        let response = "I've analyzed your request. I can help you breakdown tasks or prioritize your backlog. What would you like to do first?";
        if (input.toLowerCase().includes('task')) {
          response = "I can definitely help with that! I've drafted a breakdown for your current objectives. Would you like to see it?";
        }
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setIsTyping(false);
      }, 1500);
    } catch (err) {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-purple rounded-2xl flex items-center justify-center text-slate-900 shadow-2xl shadow-primary-500/40 hover:scale-110 transition-all z-[60] group"
      >
        <Bot size={28} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#020617] animate-pulse"></div>
      </button>

      {/* AI Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className="fixed top-8 bottom-8 right-8 w-[400px] glass-card rounded-[2.5rem] border border-slate-900/10 shadow-2xl z-[100] flex flex-col overflow-hidden backdrop-blur-3xl"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary-600/20 to-accent-purple/20 border-b border-slate-900/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-slate-900">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest">TaskFlow AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase">System Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-900/5 rounded-lg text-slate-500 transition-all"><X size={20} /></button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${
                    msg.role === 'user' 
                    ? 'bg-primary-600 text-slate-900 rounded-tr-none shadow-lg shadow-primary-600/20' 
                    : 'bg-slate-900/5 text-slate-700 rounded-tl-none border border-slate-900/5'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/5 p-4 rounded-2xl rounded-tl-none border border-slate-900/5 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-2 flex flex-wrap gap-2">
              <button className="px-3 py-1.5 bg-slate-900/5 hover:bg-slate-900/10 border border-slate-900/5 rounded-lg text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5 transition-all">
                <Sparkles size={12} className="text-primary-500" />
                Breakdown Task
              </button>
              <button className="px-3 py-1.5 bg-slate-900/5 hover:bg-slate-900/10 border border-slate-900/5 rounded-lg text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5 transition-all">
                <Zap size={12} className="text-orange-500" />
                Prioritize
              </button>
            </div>

            {/* Input */}
            <div className="p-6 pt-2">
              <div className="relative group">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  type="text" 
                  placeholder="Ask AI anything..." 
                  className="w-full pl-4 pr-12 py-4 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium text-sm"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary-500 rounded-xl text-slate-900 shadow-lg shadow-primary-500/20 hover:scale-105 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
