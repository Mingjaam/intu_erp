'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface UserReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
  onSuccess?: () => void;
}

const reportReasons = [
  '스팸 또는 부적절한 행동',
  '욕설 또는 비방',
  '사기 또는 허위 정보',
  '개인정보 침해',
  '기타',
];

export function UserReportDialog({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  onSuccess,
}: UserReportDialogProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('신고 사유를 선택해주세요.');
      return;
    }

    if (!description.trim()) {
      toast.error('신고 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post('/user-reports', {
        reportedUserId,
        reason,
        description,
      });

      toast.success('신고가 접수되었습니다.');
      setReason('');
      setDescription('');
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('신고 접수 오류:', error);
      toast.error('신고 접수에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>회원 신고</DialogTitle>
          <DialogDescription>
            <strong>{reportedUserName}</strong>님을 신고합니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">신고 사유</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">사유를 선택해주세요</option>
              {reportReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">신고 내용</label>
            <Textarea
              placeholder="구체적인 신고 내용을 작성해주세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '신고 접수 중...' : '신고하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
