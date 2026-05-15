import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: (userId: string) => void;
  disconnect: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  connect: (userId) => {
    if (get().socket) return;

    const socket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket'],
      query: { userId }
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
      console.log('Socket disconnected');
    });

    set({ socket });
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  }
}));

export default useSocketStore;

