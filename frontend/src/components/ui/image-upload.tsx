'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({ value, onChange, disabled, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 체크
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }
      
      const data = await response.json();
      const { url } = data;
      setPreview(url);
      onChange(url);
      toast.success('이미지가 업로드되었습니다.');
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      {preview ? (
        <Card className="relative group">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={preview}
                alt="프로그램 이미지"
                className="w-full h-48 object-cover rounded-lg"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleClick}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                {isUploading ? '업로드 중...' : '이미지를 업로드하세요'}
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, GIF, WebP (최대 5MB)
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={disabled || isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? '업로드 중...' : '파일 선택'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
