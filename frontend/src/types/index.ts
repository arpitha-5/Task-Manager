export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  profilePicture: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  admin: string | User;
  members: (string | User)[];
  tasks: (string | Task)[];
  status: 'Active' | 'Archived' | 'Completed';
  category?: string;
  deadline: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Testing' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: string;
  project: string | Project;
  createdBy: string | User;
  assignedTo?: string | User;
  subtasks: {
    title: string;
    isCompleted: boolean;
  }[];
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}
