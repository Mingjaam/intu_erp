export interface Application {
  id: string;
  programId: string;
  program: {
    id: string;
    title: string;
    status: string;
    applyStart: string;
    applyEnd: string;
  };
  applicantId: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    organizationId?: string;
    organization?: {
      id: string;
      name: string;
    };
  };
  payload: Record<string, unknown>;
  status: 'submitted' | 'under_review' | 'selected' | 'rejected' | 'withdrawn';
  score?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  selection?: {
    id: string;
    selected: boolean;
    reason?: string;
    reviewerId: string;
    reviewer: {
      id: string;
      name: string;
    };
    reviewedAt: string;
    criteria?: Record<string, unknown>;
  };
}

export interface CreateApplicationData {
  programId: string;
  payload: Record<string, unknown>;
}

export interface UpdateApplicationData {
  payload?: Record<string, unknown>;
  status?: 'submitted' | 'under_review' | 'selected' | 'rejected' | 'withdrawn';
  score?: number;
  notes?: string;
}

export interface ApplicationQuery {
  programId?: string;
  applicantId?: string;
  status?: 'submitted' | 'under_review' | 'selected' | 'rejected' | 'withdrawn';
  page?: number;
  limit?: number;
}

export interface ApplicationStats {
  programId: string;
  programTitle: string;
  totalApplications: number;
  submittedCount: number;
  underReviewCount: number;
  selectedCount: number;
  rejectedCount: number;
  withdrawnCount: number;
  finalSelectedCount: number;
}
