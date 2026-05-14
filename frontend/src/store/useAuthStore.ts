import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Workspace } from '../types';

interface AuthState {
  user: User | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  setAccessToken: (token: string) => void;
  setUser: (user: User | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      workspaces: [],
      currentWorkspace: null,
      accessToken: null,
      loading: false,
      error: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      setWorkspaces: (workspaces) => set({ workspaces }),
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      logout: () => set({ user: null, accessToken: null, workspaces: [], currentWorkspace: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
