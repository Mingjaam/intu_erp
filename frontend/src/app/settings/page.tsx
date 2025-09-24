'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    programUpdates: true,
    applicationUpdates: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrivacyChange = (field: string, value: string | boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      setIsLoading(true);
      // TODO: 비밀번호 변경 API 호출
      toast.success('비밀번호가 변경되었습니다.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      toast.error('비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    try {
      setIsLoading(true);
      // TODO: 알림 설정 저장 API 호출
      toast.success('알림 설정이 저장되었습니다.');
    } catch (error) {
      console.error('알림 설정 저장 오류:', error);
      toast.error('알림 설정 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacySave = async () => {
    try {
      setIsLoading(true);
      // TODO: 개인정보 설정 저장 API 호출
      toast.success('개인정보 설정이 저장되었습니다.');
    } catch (error) {
      console.error('개인정보 설정 저장 오류:', error);
      toast.error('개인정보 설정 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600">설정을 보려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
        <p className="text-gray-600">계정 및 개인정보 설정을 관리할 수 있습니다.</p>
      </div>

      <div className="space-y-6">
        {/* 비밀번호 변경 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              비밀번호 변경
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="현재 비밀번호를 입력하세요"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="새 비밀번호를 입력하세요"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                비밀번호 변경
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              알림 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">이메일 알림</Label>
                  <p className="text-sm text-gray-600">이메일로 알림을 받습니다</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">푸시 알림</Label>
                  <p className="text-sm text-gray-600">브라우저 푸시 알림을 받습니다</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">프로그램 업데이트</Label>
                  <p className="text-sm text-gray-600">새로운 프로그램에 대한 알림</p>
                </div>
                <Switch
                  checked={notificationSettings.programUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('programUpdates', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">신청서 업데이트</Label>
                  <p className="text-sm text-gray-600">신청서 상태 변경 알림</p>
                </div>
                <Switch
                  checked={notificationSettings.applicationUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('applicationUpdates', checked)}
                />
              </div>

              <Button onClick={handleNotificationSave} disabled={isLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                알림 설정 저장
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 개인정보 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              개인정보 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-medium">프로필 공개 설정</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="public"
                      name="profileVisibility"
                      value="public"
                      checked={privacySettings.profileVisibility === 'public'}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    />
                    <Label htmlFor="public">공개</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="private"
                      name="profileVisibility"
                      value="private"
                      checked={privacySettings.profileVisibility === 'private'}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    />
                    <Label htmlFor="private">비공개</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">이메일 공개</Label>
                  <p className="text-sm text-gray-600">다른 사용자에게 이메일을 공개합니다</p>
                </div>
                <Switch
                  checked={privacySettings.showEmail}
                  onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">전화번호 공개</Label>
                  <p className="text-sm text-gray-600">다른 사용자에게 전화번호를 공개합니다</p>
                </div>
                <Switch
                  checked={privacySettings.showPhone}
                  onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                />
              </div>

              <Button onClick={handlePrivacySave} disabled={isLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                개인정보 설정 저장
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
