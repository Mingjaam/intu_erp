export interface Program {
  id: string;
  title: string;
  description?: string;
  organizerId: string;
  organizer: {
    id: string;
    name: string;
    type: string;
  };
  status: 'draft' | 'open' | 'closed' | 'archived';
  applyStart: string;
  applyEnd: string;
  applicationForm?: Record<string, any>;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramData {
  title: string;
  description?: string;
  organizerId: string;
  status: 'draft' | 'open' | 'closed' | 'archived';
  applyStart: string;
  applyEnd: string;
  applicationForm?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateProgramData {
  title?: string;
  description?: string;
  status?: 'draft' | 'open' | 'closed' | 'archived';
  applyStart?: string;
  applyEnd?: string;
  applicationForm?: Record<string, any>;
  metadata?: Record<string, any>;
  isActive?: boolean;
}

export interface ProgramQuery {
  status?: 'draft' | 'open' | 'closed' | 'archived';
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
