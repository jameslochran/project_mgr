export type Resource = {
  type: 'Developer' | 'PM' | 'QA' | 'Design' | 'Devops' | 'Content';
  quantity: number;
};

export type Milestone = {
  id: string;
  title: string;
  budget: number;
  dueDate: string;
  resources: Resource[];
  totalStories: number;
  completedStories: number;
  isDone: boolean;
};

export type Project = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  budget: number;
  hourlyRate: number;
  description: string;
  milestones: Milestone[];
  userId: string;
  isOwner?: boolean;
};