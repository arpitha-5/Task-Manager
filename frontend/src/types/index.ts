export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  profilePicture: string;
  workspaces: string[];
  currentWorkspace?: string;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  owner: string;
  members: {
    user: string | User;
    role: string;
  }[];
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: 'Active' | 'Archived' | 'Completed';
  category?: string;
  deadline: string;
  workspace: string;
  owner: string;
  members: string[];
  color: string;
  coverImage?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Testing' | 'Blocked' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical';
  dueDate: string;
  project: string;
  createdBy: string;
  assignedTo: User[];
  subtasks: {
    title: string;
    isCompleted: boolean;
  }[];
  labels: string[];
  order: number;
}
