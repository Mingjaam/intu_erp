import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

// ProgramStatus enum 정의 (사용하지 않음 - 주석 처리)
// enum ProgramStatus {
//   DRAFT = 'draft',
//   OPEN = 'open',
//   CLOSED = 'closed',
//   ONGOING = 'ongoing',
//   COMPLETED = 'completed',
//   ARCHIVED = 'archived',
// }

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [],
  synchronize: false,
  logging: true,
});

async function fixProgramStatus() {
  try {
    await AppDataSource.initialize();
    console.log('데이터베이스 연결 성공');

    // 직접 SQL 쿼리로 프로그램 조회
    const programs = await AppDataSource.query(`
      SELECT id, title, status, "applyStart", "applyEnd", "programStart", "programEnd"
      FROM programs 
      WHERE "isActive" = true
    `);

    console.log(`총 ${programs.length}개의 프로그램을 찾았습니다.`);

    const now = new Date();
    console.log(`현재 시간: ${now.toISOString()}`);

    for (const program of programs) {
      console.log(`\n=== 프로그램: ${program.title} ===`);
      console.log(`현재 상태: ${program.status}`);
      console.log(`신청 시작: ${program.applyStart}`);
      console.log(`신청 종료: ${program.applyEnd}`);
      console.log(`활동 시작: ${program.programStart || 'null'}`);
      console.log(`활동 종료: ${program.programEnd || 'null'}`);

      // 상태 계산 로직
      let newStatus: string;

      // 수동으로 설정된 상태가 'draft' 또는 'archived'인 경우 그대로 유지
      if (program.status === 'draft' || program.status === 'archived') {
        console.log(`수동 설정 상태 유지: ${program.status}`);
        continue;
      }

      const applyStart = new Date(program.applyStart);
      const applyEnd = new Date(program.applyEnd);
      const programStart = program.programStart ? new Date(program.programStart) : null;
      const programEnd = program.programEnd ? new Date(program.programEnd) : null;

      // 신청 기간 전
      if (now < applyStart) {
        newStatus = 'draft';
        console.log('상태: 신청 전 (draft)');
      }
      // 신청 기간 중
      else if (now >= applyStart && now <= applyEnd) {
        newStatus = 'open';
        console.log('상태: 모집중 (open)');
      }
      // 신청 기간 종료 후, 활동 시작 전
      else if (now > applyEnd && programStart && now < programStart) {
        newStatus = 'closed';
        console.log('상태: 신청마감 (closed)');
      }
      // 활동 기간 중
      else if (programStart && programEnd && now >= programStart && now <= programEnd) {
        newStatus = 'ongoing';
        console.log('상태: 진행중 (ongoing)');
      }
      // 활동 종료 후
      else if (programEnd && now > programEnd) {
        newStatus = 'completed';
        console.log('상태: 완료 (completed)');
      }
      // 활동 기간이 설정되지 않은 경우
      else if (!programStart && !programEnd) {
        newStatus = 'closed';
        console.log('상태: 신청마감 (closed) - 활동 기간 미설정');
      }
      else {
        newStatus = 'closed';
        console.log('상태: 신청마감 (closed) - 기본값');
      }

      if (newStatus !== program.status) {
        console.log(`상태 변경: ${program.status} -> ${newStatus}`);
        
        // SQL로 상태 업데이트
        await AppDataSource.query(`
          UPDATE programs 
          SET status = $1, "updatedAt" = NOW()
          WHERE id = $2
        `, [newStatus, program.id]);
        
        console.log(`상태 업데이트 완료: ${newStatus}`);
      } else {
        console.log(`상태 변경 없음: ${program.status}`);
      }
    }

    console.log('\n프로그램 상태 수정 완료!');

  } catch (error) {
    console.error('프로그램 상태 수정 오류:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

fixProgramStatus();