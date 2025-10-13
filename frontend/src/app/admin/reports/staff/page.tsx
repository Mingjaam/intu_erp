'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileSpreadsheet } from 'lucide-react';

export default function StaffReportPage() {
  const { user } = useAuth();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">사업참여인력 현황</h1>
        <p className="text-gray-600">사업참여인력 현황을 조회하고 엑셀로 다운로드할 수 있습니다.</p>
      </div>

      {/* 개발 중 메시지 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            사업참여인력 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">개발 중</h3>
              <p className="text-yellow-700">
                사업참여인력 현황 기능은 현재 개발 중입니다.
                <br />
                곧 사용하실 수 있습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
