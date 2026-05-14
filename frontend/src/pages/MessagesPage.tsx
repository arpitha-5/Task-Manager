import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Plus, Search, User, Users, Hash } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useSocketStore from '../store/useSocketStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { user, currentWorkspace } = useAuthStore();
  const { socket } = useSocketStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typing, setTyping] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<any>(null);

  useEffect(() => {
    if (currentWorkspace) {
      fetchConversations();
      fetchMembers();
    } else {
      setIsLoading(false);
    }
  }, [currentWorkspace]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !activeConv) return;

    socket.emit('join_conversation', activeConv._id);

    const handleNewMessage = (msg: any) => {
      if (msg.conversation === activeConv._id) {
        setMessages(prev => [...prev, msg]);
      }
      // Update conversation list
      setConversations(prev => prev.map(c =>
        c._id === msg.conversation
          ? { ...c, lastMessage: { content: msg.content, sender: msg.sender._id || msg.sender, timestamp: new Date() } }
          : c
      ));
    };

    const handleTyping = (data: any) => {
      if (data.conversationId === activeConv._id) {
        setTyping(data.userName);
      }
    };

    const handleStopTyping = () => setTyping('');

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [socket, activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/messages/conversations/${currentWorkspace!._id}`);
      setConversations(res.data.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/messages/members/${currentWorkspace!._id}`);
      setMembers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch members', err);
    }
  };

  const selectConversation = async (conv: any) => {
    setActiveConv(conv);
    try {
      const res = await api.get(`/messages/${conv._id}`);
      setMessages(res.data.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    try {
      const res = await api.post('/messages/send', {
        conversationId: activeConv._id,
        content: newMessage.trim(),
      });
      setMessages(prev => [...prev, res.data.data]);
      setNewMessage('');

      if (socket) {
        socket.emit('stop_typing', { conversationId: activeConv._id });
      }
    } catch (err: any) {
      toast.error('Failed to send message');
    }
  };

  const handleTypingEmit = () => {
    if (!socket || !activeConv) return;
    socket.emit('typing', { conversationId: activeConv._id, userName: user?.name });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: activeConv._id });
    }, 2000);
  };

  const startChat = async (member: any) => {
    try {
      const res = await api.post('/messages/conversation', {
        participantId: member._id,
        workspaceId: currentWorkspace!._id,
      });
      const conv = res.data.data;
      setConversations(prev => {
        const exists = prev.find(c => c._id === conv._id);
        return exists ? prev : [conv, ...prev];
      });
      selectConversation(conv);
      setShowNewChat(false);
    } catch (err) {
      toast.error('Failed to start conversation');
    }
  };

  const getConvName = (conv: any) => {
    if (conv.isGroup) return conv.name || 'Group Chat';
    const other = conv.participants?.find((p: any) => p._id !== user?._id);
    return other?.name || 'Chat';
  };

  const getConvAvatar = (conv: any) => {
    if (conv.isGroup) return conv.name?.charAt(0) || 'G';
    const other = conv.participants?.find((p: any) => p._id !== user?._id);
    return other?.profilePicture || `https://ui-avatars.com/api/?name=${other?.name || 'U'}&background=random`;
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!currentWorkspace) return (
    <div className="h-full flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto">
      <MessageSquare size={40} className="text-slate-500" />
      <h2 className="text-3xl font-black">No Workspace Selected</h2>
      <p className="text-slate-500 font-medium">Select a workspace to start messaging.</p>
    </div>
  );

  return (
    <div className="h-full flex w-full">
      {/* Sidebar */}
      <div className="w-80 shrink-0 border-r border-slate-900/5 flex flex-col bg-slate-900/[0.01]">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-900/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black">Messages</h2>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="p-2 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/[0.03] border border-slate-900/5 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
        </div>

        {/* New Chat Panel */}
        <AnimatePresence>
          {showNewChat && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-slate-900/5 overflow-hidden"
            >
              <div className="p-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Start new chat</p>
                {members.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No other members in workspace</p>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {members.map((m: any) => (
                      <button
                        key={m._id}
                        onClick={() => startChat(m)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-900/5 transition-all text-left"
                      >
                        <img src={m.profilePicture || `https://ui-avatars.com/api/?name=${m.name}&background=random`} alt="" className="w-8 h-8 rounded-lg" />
                        <div>
                          <p className="text-xs font-bold">{m.name}</p>
                          <p className="text-[10px] text-slate-500">{m.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3 px-4">
              <MessageSquare size={28} className="text-slate-600" />
              <p className="text-sm text-slate-500 font-medium text-center">No conversations yet. Click + to start chatting.</p>
            </div>
          ) : (
            conversations
              .filter(c => getConvName(c).toLowerCase().includes(searchQuery.toLowerCase()))
              .map(conv => (
                <button
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full flex items-center gap-3 p-4 border-b border-slate-900/[0.03] hover:bg-slate-900/[0.03] transition-all text-left ${activeConv?._id === conv._id ? 'bg-primary-500/10 border-l-2 border-l-primary-500' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                    {conv.isGroup ? (
                      <div className="w-full h-full bg-accent-purple/20 flex items-center justify-center text-accent-purple font-black text-sm">
                        <Users size={18} />
                      </div>
                    ) : (
                      <img src={getConvAvatar(conv)} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{getConvName(conv)}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-[2rem] bg-slate-900/5 flex items-center justify-center border border-slate-900/10">
              <MessageSquare size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-black text-slate-500">Select a Conversation</h3>
            <p className="text-sm text-slate-500 font-medium">Choose a chat from the sidebar or start a new one</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-5 border-b border-slate-900/5 flex items-center gap-4 bg-slate-900/[0.01]">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                {activeConv.isGroup ? (
                  <div className="w-full h-full bg-accent-purple/20 flex items-center justify-center text-accent-purple"><Users size={18} /></div>
                ) : (
                  <img src={getConvAvatar(activeConv)} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <h3 className="font-black text-sm">{getConvName(activeConv)}</h3>
                {typing ? (
                  <p className="text-[10px] text-primary-500 font-bold animate-pulse">{typing} is typing...</p>
                ) : (
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {activeConv.isGroup ? `${activeConv.participants?.length} members` : 'Direct Message'}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                  <Hash size={28} className="text-slate-600" />
                  <p className="text-sm text-slate-500 font-medium">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = (msg.sender?._id || msg.sender) === user?._id;
                  const showAvatar = i === 0 || (messages[i - 1].sender?._id || messages[i - 1].sender) !== (msg.sender?._id || msg.sender);
                  return (
                    <div key={msg._id || i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {showAvatar ? (
                        <img
                          src={msg.sender?.profilePicture || `https://ui-avatars.com/api/?name=${msg.sender?.name || 'U'}&background=random`}
                          alt="" className="w-8 h-8 rounded-lg shrink-0 mt-1"
                        />
                      ) : <div className="w-8 shrink-0" />}
                      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                        {showAvatar && (
                          <p className={`text-[10px] font-bold text-slate-500 mb-1 ${isMe ? 'text-right' : ''}`}>
                            {isMe ? 'You' : msg.sender?.name}
                          </p>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium ${
                          isMe
                            ? 'bg-primary-600 text-slate-900 rounded-tr-md'
                            : 'bg-slate-900/[0.05] text-slate-800 rounded-tl-md'
                        }`}>
                          {msg.content}
                        </div>
                        <p className={`text-[9px] text-slate-600 mt-1 ${isMe ? 'text-right' : ''}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-900/5 bg-slate-900/[0.01]">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => { setNewMessage(e.target.value); handleTypingEmit(); }}
                  placeholder="Type a message..."
                  className="flex-1 px-5 py-3 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/50 text-sm font-medium"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-primary-600 text-slate-900 rounded-2xl hover:bg-primary-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
