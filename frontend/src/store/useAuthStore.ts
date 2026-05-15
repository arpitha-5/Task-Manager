import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Project } from '../types';

interface AuthState {
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  setAccessToken: (token: string) => void;
  setUser: (user: User | null) => void;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      projects: [],
      currentProject: null,
      accessToken: null,
      loading: false,
      error: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      setProjects: (projects) => set({ projects }),
      setCurrentProject: (project) => set({ currentProject: project }),
      logout: () => set({ user: null, accessToken: null, projects: [], currentProject: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
