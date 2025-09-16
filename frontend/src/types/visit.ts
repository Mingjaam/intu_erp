export interface Visit {
  id: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    type: string;
  };
  programId: string;
  program: {
    id: string;
    title: string;
  };
  visitorId: string;
  visitor: {
    id: string;
    name: string;
    email: string;
  };
  scheduledAt: string;
  performedAt?: string;
  notes?: string;
  outcome?: Record<string, unknown>;
  status: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
  followUpNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitData {
  organizationId: string;
  programId: string;
  scheduledAt: string;
  notes?: string;
  outcome?: Record<string, unknown>;
}

export interface UpdateVisitData {
  scheduledAt?: string;
  performedAt?: string;
  notes?: string;
  outcome?: Record<string, unknown>;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
  followUpNotes?: string;
}

export interface VisitQuery {
  organizationId?: string;
  programId?: string;
  visitorId?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface VisitStats {
  programId: string;
  totalVisits: number;
  scheduledCount: number;
  completedCount: number;
  cancelledCount: number;
  postponedCount: number;
}
