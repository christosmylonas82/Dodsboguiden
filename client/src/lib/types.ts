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
  hasStarted: boolean;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'SKIPPED';
export type TaskPriority = 'NOW' | 'SOON' | 'LATER';
export type DueDateStatus = 'overdue' | 'due_soon' | 'on_time' | 'no_date';

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
  dueDateStatus?: DueDateStatus;
  isCustom: boolean;
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
  deceasedDate: string | null;
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

export type InventoryStatus = 'NOT_INVENTORIED' | 'INVENTORIED' | 'VALUED' | 'SOLD';

export interface InventoryItem {
  id: string;
  projectId: string;
  type: string;
  value: number;
  comments: string | null;
  status: InventoryStatus;
  createdAt: string;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export type TransactionType = 'COST' | 'INCOME';
export type TransactionCategory = 'BEGRAVNING' | 'JURIDIK' | 'MYNDIGHETER' | 'FORSALJNING' | 'OVRIGT';

export interface Transaction {
  id: string;
  projectId: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string;
  notes: string | null;
  createdAt: string;
}

export type DocumentType = 'DODSFALLSINTYG' | 'TESTAMENTE' | 'FULLMAKT' | 'FORSAKRING' | 'OVRIGT';

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  type: DocumentType;
  description: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  uploadedByUser: { id: string; name: string };
}

export type PensionType = 'BARNPENSION' | 'OMSTALLNINGSPENSION';

export interface SurvivingPensionNote {
  id: string;
  projectId: string;
  pensionType: PensionType;
  childAge: number | null;
  studyingGymnasium: boolean | null;
  survivorAge: number | null;
  hasChildren: boolean | null;
  notes: string | null;
  createdAt: string;
}

export interface HousingBenefitNote {
  id: string;
  projectId: string;
  age: number;
  incomeBeforeTax: number;
  assets: number;
  housingCost: number;
  meetsAgeRequirement: boolean;
  notes: string | null;
  createdAt: string;
}

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
