'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  className?: string;
  maxImages?: number;
}

export function MultiImageUpload({ 
  value = [], 
  onChange, 
  disabled, 
  className,
  maxImages = 2 
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // 최대 이미지 수 체크
    if (value.length + files.length > maxImages) {
      toast.error(`최대 ${maxImages}장까지만 업로드할 수 있습니다.`);
      return;
    }

    // 파일 크기 체크 (5MB)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 체크
    const invalidFiles = files.filter(file => !file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/));
    if (invalidFiles.length > 0) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvio.kr/api'}/upload/image`, {
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
        // 클라우드 환경에서 전체 URL로 변환
        return url.startsWith('http') ? url : `https://nuvio.kr${url}`;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newUrls = [...value, ...uploadedUrls];
      onChange(newUrls);
      toast.success(`${uploadedUrls.length}장의 이미지가 업로드되었습니다.`);
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleClick = () => {
    if (!disabled && value.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="grid grid-cols-2 gap-4">
        {value.map((url, index) => (
          <Card key={index} className="relative group">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={url}
                  alt={`프로그램 이미지 ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {value.length < maxImages && (
          <Card
            className={`border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleClick}
          >
            <CardContent className="flex flex-col items-center justify-center h-32">
              <div className="text-center">
                <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {isUploading ? '업로드 중...' : '이미지 추가'}
                </p>
                <p className="text-xs text-gray-500">
                  {value.length}/{maxImages}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        최대 {maxImages}장까지 업로드 가능합니다. (각 5MB 이하)
      </p>
    </div>
  );
}
