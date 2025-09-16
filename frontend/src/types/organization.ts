export interface Organization {
  id: string;
  name: string;
  type: 'village' | 'institution' | 'company' | 'ngo';
  address?: string;
  contact?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
  programs?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  visits?: Array<{
    id: string;
    scheduledAt: string;
    status: string;
  }>;
}

export interface CreateOrganizationData {
  name: string;
  type: 'village' | 'institution' | 'company' | 'ngo';
  address?: string;
  contact?: string;
  description?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  type?: 'village' | 'institution' | 'company' | 'ngo';
  address?: string;
  contact?: string;
  description?: string;
  isActive?: boolean;
}

export interface OrganizationQuery {
  type?: 'village' | 'institution' | 'company' | 'ngo';
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrganizationStats {
  organizationId: string;
  organizationName: string;
  totalUsers: number;
  totalPrograms: number;
  totalVisits: number;
  activePrograms: number;
  completedVisits: number;
}

export interface OrganizationTypeStats {
  type: string;
  label: string;
  count: number;
}
