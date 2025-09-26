-- 초기 데이터 생성 SQL 스크립트

-- 조직 데이터 삽입
INSERT INTO organizations (id, name, type, address, contact, description, "isActive", "createdAt", "updatedAt") VALUES
('256221f1-50bc-4758-9054-3087940e2076', '인투 ERP 본사', 'company', '서울시 강남구 테헤란로 123', '02-1234-5678', '인투 ERP 시스템 운영 본사', true, NOW(), NOW()),
('ced0e8ab-531c-4d15-be8f-c73103c811ca', '서울시 마을회관', 'village', '서울시 강서구 마을길 456', '02-2345-6789', '서울시 강서구 마을회관', true, NOW(), NOW());

-- 사용자 데이터 삽입 (비밀번호: password123)
INSERT INTO users (id, email, "passwordHash", name, role, "organizationId", phone, "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@intu.com', '$2b$10$rQZ8K9vL2nF3mP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', '관리자', 'admin', '256221f1-50bc-4758-9054-3087940e2076', NULL, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'operator@intu.com', '$2b$10$rQZ8K9vL2nF3mP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', '운영자', 'operator', '256221f1-50bc-4758-9054-3087940e2076', NULL, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'user@example.com', '$2b$10$rQZ8K9vL2nF3mP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', '홍길동', 'applicant', NULL, '010-1234-5678', true, NOW(), NOW());

-- 프로그램 데이터 삽입
INSERT INTO programs (id, title, description, "organizerId", status, "maxParticipants", "applyStart", "applyEnd", "programStart", "programEnd", location, fee, "applicationForm", metadata, "isActive", "createdAt", "updatedAt") VALUES
('e9028d2d-b29e-4fd3-a19d-69131d07bbef', '2024년 디지털 리터러시 교육 프로그램', '디지털 시대에 필요한 기본적인 컴퓨터 사용법과 인터넷 활용법을 교육하는 프로그램입니다.', '256221f1-50bc-4758-9054-3087940e2076', 'open', 30, '2024-01-01 00:00:00', '2024-12-31 23:59:59', '2024-02-01 00:00:00', '2024-04-30 23:59:59', '인투 ERP 본사 교육실', 50000, '{"fields":[{"name":"name","type":"text","label":"이름","required":true},{"name":"age","type":"number","label":"나이","required":true},{"name":"experience","type":"select","label":"컴퓨터 사용 경험","options":["없음","기초","중급","고급"],"required":true}]}', '{"duration":"3개월","schedule":"주 2회","maxParticipants":30}', true, NOW(), NOW()),
('0ea6a4fc-74e2-4d97-aa7f-c2d1b970970c', '마을 공동체 활성화 프로젝트', '마을 주민들의 소통과 협력을 증진시키기 위한 다양한 활동을 진행하는 프로그램입니다.', 'ced0e8ab-531c-4d15-be8f-c73103c811ca', 'open', 50, '2024-02-01 00:00:00', '2024-11-30 23:59:59', '2024-03-01 00:00:00', '2024-08-31 23:59:59', '서울시 마을회관', 0, '{"fields":[{"name":"name","type":"text","label":"이름","required":true},{"name":"address","type":"text","label":"주소","required":true},{"name":"interests","type":"checkbox","label":"관심 분야","options":["환경","문화","자원봉사","교육"],"required":true}]}', '{"duration":"6개월","schedule":"주 1회","maxParticipants":50}', true, NOW(), NOW());
