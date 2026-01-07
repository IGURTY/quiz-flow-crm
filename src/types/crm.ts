// CRM Types

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  whatsappStatus: 'online' | 'offline' | 'connecting';
  avatar?: string;
  dailyLeadLimit: number;
  leadsReceivedToday: number;
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  slug: string;
  isPublished: boolean;
  steps: QuizStep[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizStep {
  id: string;
  order: number;
  title: string;
  questions: QuizQuestion[];
}

export type QuestionType = 'text' | 'number' | 'multiple_choice' | 'yes_no';

export interface QuizQuestion {
  id: string;
  stepId: string;
  order: number;
  type: QuestionType;
  question: string;
  options?: string[];
  required: boolean;
  conditionalLogic?: ConditionalLogic;
}

export interface ConditionalLogic {
  questionId: string;
  operator: 'equals' | 'not_equals' | 'contains';
  value: string;
  action: 'show' | 'skip_to';
  targetStepId?: string;
}

export interface QuizAnswer {
  questionId: string;
  value: string | number | boolean;
}

export type KanbanStatus = 
  | 'novo' 
  | 'em_contato' 
  | 'qualificado' 
  | 'proposta' 
  | 'fechado' 
  | 'perdido';

export interface Lead {
  id: string;
  quizId: string;
  assignedUserId: string;
  name: string;
  phone: string;
  email?: string;
  status: KanbanStatus;
  answers: QuizAnswer[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadHistory {
  id: string;
  leadId: string;
  userId: string;
  action: string;
  fromStatus?: KanbanStatus;
  toStatus?: KanbanStatus;
  note?: string;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  createdAt: string;
}

export interface MessageLog {
  id: string;
  leadId: string;
  templateId?: string;
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
}

export interface RemarketingRule {
  id: string;
  name: string;
  triggerStatus: KanbanStatus;
  daysWithoutActivity: number;
  templateId: string;
  isActive: boolean;
  createdAt: string;
}

export const KANBAN_COLUMNS: { id: KanbanStatus; label: string; color: string }[] = [
  { id: 'novo', label: 'Novo', color: 'bg-info' },
  { id: 'em_contato', label: 'Em Contato', color: 'bg-warning' },
  { id: 'qualificado', label: 'Qualificado', color: 'bg-primary' },
  { id: 'proposta', label: 'Proposta', color: 'bg-chart-5' },
  { id: 'fechado', label: 'Fechado', color: 'bg-success' },
  { id: 'perdido', label: 'Perdido', color: 'bg-destructive' },
];
