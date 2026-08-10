export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'USER' | 'ADMIN';
}

export interface ProjectSummary {
  id: string;
  deceasedName: string;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  memberCount: number;
  progress: number;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  moreInfo: string | null;
  url: string | null;
  phase: 'Förberedelser' | 'Förrättningen' | 'Efter förrättningen';
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
  status: TaskStatus;
  assignedTo: string | null;
  assignedUser: { id: string; name: string; email: string } | null;
  orderIndex: number;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string | null;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  user: { id: string; name: string; email: string } | null;
}

export interface ProjectDetail {
  id: string;
  deceasedName: string;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  tasks: Task[];
  members: ProjectMember[];
}

export interface Contact {
  id: string;
  projectId: string;
  name: string;
  relation: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  projectId: string;
  type: string;
  value: number;
  comments: string | null;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  action: string;
  timestamp: string;
  user: { id: string; name: string };
  taskId: string | null;
}
