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
  status: 'draft' | 'open' | 'closed' | 'archived';
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
  imageUrls?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramData {
  title: string;
  description?: string;
  summary?: string;
  organizerId: string;
  status: 'draft' | 'open' | 'closed' | 'archived';
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
  imageUrls?: string[];
}

export interface UpdateProgramData {
  title?: string;
  description?: string;
  summary?: string;
  status?: 'draft' | 'open' | 'closed' | 'archived';
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
  imageUrls?: string[];
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
