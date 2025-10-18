'use client';

import React, { useState, useEffect } from 'react';
import { BudgetPage } from '@/components/budget/budget-page';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  type: string;
}

export default function AdminBudgetsPage() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');
  const [selectedOrganizationName, setSelectedOrganizationName] = useState<string>('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
        
        // 사용자의 조직이 있으면 기본 선택
        if (user?.organizationId) {
          const userOrg = data.find((org: Organization) => org.id === user.organizationId);
          if (userOrg) {
            setSelectedOrganizationId(userOrg.id);
            setSelectedOrganizationName(userOrg.name);
          }
        }
      }
    } catch (error) {
      console.error('조직 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const handleOrganizationChange = (organizationId: string) => {
    const organization = organizations.find(org => org.id === organizationId);
    if (organization) {
      setSelectedOrganizationId(organizationId);
      setSelectedOrganizationName(organization.name);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 조직 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            조직 선택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedOrganizationId} onValueChange={handleOrganizationChange}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="조직을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name} ({org.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 예산 관리 페이지 */}
      {selectedOrganizationId && (
        <BudgetPage
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
        />
      )}
    </div>
  );
}