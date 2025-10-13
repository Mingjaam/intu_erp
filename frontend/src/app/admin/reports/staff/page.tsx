'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Users } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface StaffReportItem {
  연번: number;
  계약형태: string;
  직책: string;
  성명: string;
  입사일: string;
  퇴사일: string;
  참여율: string;
}

interface StaffReportResponse {
  data: StaffReportItem[];
  total: number;
  year: string;
  month: string;
}

export default function StaffReportPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<StaffReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      console.log('사업참여인력 현황 조회');
      const response = await apiClient.get<StaffReportResponse>(`/reports/staff`);
      console.log('조회 결과:', response);
      console.log('response.data:', response.data);
      setReportData(response.data as unknown as StaffReportItem[]);
      setTotal((response as unknown as { total: number }).total);
    } catch (error) {
      console.error('보고서 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToExcel = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://nuvio.kr/api'}/reports/staff/excel`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('엑셀 다운로드에 실패했습니다.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `사업참여인력현황.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      alert('엑셀 다운로드에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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
        <p className="text-gray-600">조직별 사업참여인력 현황을 조회하고 엑셀로 다운로드할 수 있습니다.</p>
      </div>


      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 인력</p>
                <p className="text-2xl font-bold text-gray-900">{total || 0}명</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileSpreadsheet className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">엑셀 다운로드</p>
                <Button 
                  size="sm" 
                  onClick={exportToExcel}
                  className="mt-2"
                  disabled={!reportData || reportData.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  다운로드
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 사업참여인력 현황 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>사업참여인력 현황</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">연번</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">계약형태</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">직책</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">성명</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">입사일</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">퇴사일</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">참여율</th>
                  </tr>
                </thead>
                <tbody>
                  {!reportData || reportData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                        해당 기간에 사업참여인력이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    reportData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2">{item.연번}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.계약형태}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.직책}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.성명}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.입사일}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.퇴사일}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.참여율}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}