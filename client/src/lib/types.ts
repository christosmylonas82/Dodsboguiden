export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'USER' | 'ADMIN';
  hasSeenTipsOnboarding: boolean;
  profileImageUrl: string | null;
  createdAt: string;
}

export interface ProjectSummary {
  id: string;
  deceasedName: string;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  deletedAt?: string | null;
  memberCount: number;
  progress: number;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'NOW' | 'SOON' | 'LATER';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  moreInfo: string | null;
  url: string | null;
  phase:
    | 'Direkt efter dödsfall'
    | 'Begravning & ceremoni'
    | 'Inför bouppteckning'
    | 'Under bouppteckning'
    | 'Avslut & arvskifte';
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  timeEstimate: string | null;
  responsibleRole: string | null;
  assignedTo: string | null;
  assignedUser: { id: string; name: string; email: string; profileImageUrl: string | null } | null;
  orderIndex: number;
  notes: string | null;
  dueDate: string | null;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string | null;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  user: { id: string; name: string; email: string; profileImageUrl: string | null } | null;
}

export interface ProjectDetail {
  id: string;
  deceasedName: string;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  tasks: Task[];
  members: ProjectMember[];
  invitations: PendingInvitation[];
}

export interface PendingInvitation {
  id: string;
  projectId: string;
  invitedEmail: string;
  status: InvitationStatus;
  createdAt: string;
  invitedUser: { id: string; name: string; email: string; profileImageUrl: string | null } | null;
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

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface Invitation {
  id: string;
  projectId: string;
  invitedEmail: string;
  status: InvitationStatus;
  createdAt: string;
  project: { id: string; deceasedName: string };
  senderUser: { id: string; name: string; email: string };
}

export interface ActivityEntry {
  id: string;
  action: string;
  timestamp: string;
  user: { id: string; name: string; profileImageUrl: string | null };
  taskId: string | null;
}
