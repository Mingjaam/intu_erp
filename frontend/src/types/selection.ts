export interface Selection {
  id: string;
  applicationId: string;
  application: {
    id: string;
    programId: string;
    program: {
      id: string;
      title: string;
    };
    applicantId: string;
    applicant: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  };
  selected: boolean;
  reason?: string;
  reviewerId: string;
  reviewer: {
    id: string;
    name: string;
    email: string;
  };
  reviewedAt: string;
  criteria?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSelectionData {
  applicationId: string;
  selected: boolean;
  reason?: string;
  criteria?: Record<string, any>;
}

export interface UpdateSelectionData {
  selected?: boolean;
  reason?: string;
  criteria?: Record<string, any>;
}

export interface SelectionQuery {
  programId?: string;
  reviewerId?: string;
  selected?: boolean;
  page?: number;
  limit?: number;
}

export interface SelectionStats {
  programId: string;
  totalSelections: number;
  selectedCount: number;
  rejectedCount: number;
  averageScore?: number;
}
