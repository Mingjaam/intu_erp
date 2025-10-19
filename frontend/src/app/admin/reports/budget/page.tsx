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

export default function BudgetReportPage() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');
  const [selectedOrganizationName, setSelectedOrganizationName] = useState<string>('');

  // 권한 확인
  if (!user || (user.role !== 'admin' && user.role !== 'operator' && user.role !== 'staff')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자, 운영자, 직원 권한이 필요한 페이지입니다.</p>
        </div>
      </div>
    );
  }

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
