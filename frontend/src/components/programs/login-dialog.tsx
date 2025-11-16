'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface LoginDialogProps {
  isOpen: boolean;
  programTitle: string;
  onClose: () => void;
}

export function LoginDialog({ isOpen, programTitle, onClose }: LoginDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            로그인이 필요한 서비스입니다
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* 프로그램 정보 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {programTitle}
            </h3>
            <p className="text-sm text-gray-600">
              프로그램에 신청하려면 로그인이 필요합니다.
            </p>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700 text-center">
              로그인 후 프로그램 신청이 가능합니다.
            </p>
          </div>

          {/* 버튼 그룹 */}
          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Link href="/auth/login">
                <LogIn className="h-5 w-5 mr-2" />
                로그인하기
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Link href="/auth/register">
                <UserPlus className="h-5 w-5 mr-2" />
                회원가입하기
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
              size="lg"
            >
              취소
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

