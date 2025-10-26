export interface Program {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  organizerId: string;
  organizer: {
    id: string;
    name: string;
    type: string;
  };
  status: 'before_application' | 'application_open' | 'in_progress' | 'completed' | 'archived';
  applyStart: string;
  applyEnd: string;
  programStart: string;
  programEnd: string;
  location: string;
  fee: number;
  maxParticipants: number;
  applicationForm?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // 추가된 필드들
  applicationCount?: number;
  selectedCount?: number;
  revenue?: number;
  daysUntilDeadline?: number; // 모집 마감까지 남은 일수
}

export interface CreateProgramData {
  title: string;
  description?: string;
  summary?: string;
  organizerId: string;
  status: 'before_application' | 'application_open' | 'in_progress' | 'completed' | 'archived';
  applyStart: string;
  applyEnd: string;
  programStart: string;
  programEnd: string;
  location: string;
  fee: number;
  maxParticipants: number;
  applicationForm?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  imageUrl?: string;
}

export interface UpdateProgramData {
  title?: string;
  description?: string;
  summary?: string;
  status?: 'before_application' | 'application_open' | 'in_progress' | 'completed' | 'archived';
  applyStart?: string;
  applyEnd?: string;
  programStart?: string;
  programEnd?: string;
  location?: string;
  fee?: number;
  maxParticipants?: number;
  applicationForm?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  imageUrl?: string;
  isActive?: boolean;
}

export interface ProgramQuery {
  status?: 'before_application' | 'application_open' | 'in_progress' | 'completed' | 'archived';
  organizerId?: string;
  page?: number;
  limit?: number;
}

export interface ProgramStats {
  programId: string;
  programTitle: string;
  totalApplications: number;
  selectedCount: number;
  submittedCount: number;
  underReviewCount: number;
}
