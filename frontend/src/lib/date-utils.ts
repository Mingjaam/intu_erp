// 한국 시간대 기준 날짜 유틸리티 함수들

/**
 * 한국 시간대 기준으로 현재 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getKoreanDateString(date?: Date): string {
  const now = date || new Date();
  const koreanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
  return koreanTime.toISOString().split('T')[0];
}

/**
 * 한국 시간대 기준으로 현재 날짜시간을 YYYY-MM-DDTHH:mm 형식으로 반환
 */
export function getKoreanDateTimeString(date?: Date): string {
  const now = date || new Date();
  const koreanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
  return koreanTime.toISOString().slice(0, 16);
}

/**
 * 한국 날짜 문자열을 UTC Date 객체로 변환
 */
export function koreanDateStringToUTC(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  const koreanDate = new Date(year, month - 1, day);
  return new Date(koreanDate.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
}

/**
 * 한국 날짜시간 문자열을 UTC Date 객체로 변환
 */
export function koreanDateTimeStringToUTC(dateTimeString: string): Date {
  const koreanDate = new Date(dateTimeString);
  return new Date(koreanDate.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
}

/**
 * 프로그램 상태를 날짜 기반으로 계산
 */
export function calculateProgramStatus(
  applyStart: string,
  applyEnd: string,
  programStart: string,
  programEnd: string
): 'draft' | 'open' | 'closed' | 'ongoing' | 'completed' {
  // 한국 시간 기준 현재 시간
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const applyStartDate = new Date(applyStart);
  const applyEndDate = new Date(applyEnd);
  const programStartDate = new Date(programStart);
  const programEndDate = new Date(programEnd);

  // 신청 기간 전
  if (now < applyStartDate) {
    return 'draft';
  }
  
  // 신청 기간 중
  if (now >= applyStartDate && now <= applyEndDate) {
    return 'open';
  }
  
  // 신청 기간 종료 후, 활동 시작 전
  if (now > applyEndDate && programStartDate && now < programStartDate) {
    return 'closed';
  }
  
  // 활동 기간 중
  if (programStartDate && programEndDate && now >= programStartDate && now <= programEndDate) {
    return 'ongoing';
  }
  
  // 활동 종료 후
  if (programEndDate && now > programEndDate) {
    return 'completed';
  }
  
  // 활동 기간이 설정되지 않은 경우
  if (!programStartDate && !programEndDate) {
    return 'closed';
  }
  
  return 'closed';
}
