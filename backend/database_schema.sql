-- 제조업 대시보드 데이터베이스 스키마

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS manufacturing_db;
USE manufacturing_db;

-- 공장 정보 테이블
CREATE TABLE factories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 생산 데이터 테이블
CREATE TABLE production_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    factory_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    quality_score DECIMAL(5,2) DEFAULT 0.00,
    production_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factory_id) REFERENCES factories(id)
);

-- 품질 검사 데이터 테이블
CREATE TABLE quality_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    factory_id INT NOT NULL,
    defect_type VARCHAR(50) NOT NULL,
    defect_count INT NOT NULL DEFAULT 0,
    total_inspected INT NOT NULL DEFAULT 0,
    inspection_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factory_id) REFERENCES factories(id)
);

-- 사용자 테이블 (기존 인증 시스템과 연동)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    admin_code VARCHAR(10) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    factory_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factory_id) REFERENCES factories(id)
);

-- 샘플 데이터 삽입

-- 공장 데이터
INSERT INTO factories (name, location) VALUES
('서울 제1공장', '서울시 강남구'),
('부산 제2공장', '부산시 해운대구'),
('대구 제3공장', '대구시 수성구'),
('인천 제4공장', '인천시 연수구');

-- 사용자 데이터
INSERT INTO users (name, role, admin_code, email, phone, department, factory_id) VALUES
('관리자', '시스템 관리자', '123456', 'admin@manufacturing.com', '010-0000-0000', 'IT 관리팀', 1);

-- 생산 데이터 샘플 (최근 30일)
INSERT INTO production_data (factory_id, product_name, quantity, quality_score, production_date) VALUES
(1, '제품A', 150, 98.5, NOW() - INTERVAL 1 DAY),
(1, '제품B', 200, 97.2, NOW() - INTERVAL 1 DAY),
(2, '제품A', 180, 99.1, NOW() - INTERVAL 1 DAY),
(2, '제품C', 120, 96.8, NOW() - INTERVAL 1 DAY),
(3, '제품B', 160, 98.9, NOW() - INTERVAL 1 DAY),
(1, '제품A', 140, 97.8, NOW() - INTERVAL 2 DAY),
(2, '제품B', 190, 98.2, NOW() - INTERVAL 2 DAY),
(3, '제품C', 110, 97.5, NOW() - INTERVAL 2 DAY);

-- 품질 검사 데이터 샘플
INSERT INTO quality_data (factory_id, defect_type, defect_count, total_inspected, inspection_date) VALUES
(1, '크랙', 5, 500, NOW() - INTERVAL 1 DAY),
(1, '색상 불량', 3, 500, NOW() - INTERVAL 1 DAY),
(1, '치수 불량', 2, 500, NOW() - INTERVAL 1 DAY),
(2, '크랙', 4, 600, NOW() - INTERVAL 1 DAY),
(2, '색상 불량', 1, 600, NOW() - INTERVAL 1 DAY),
(3, '치수 불량', 3, 400, NOW() - INTERVAL 1 DAY);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_production_date ON production_data(production_date);
CREATE INDEX idx_factory_production ON production_data(factory_id, production_date);
CREATE INDEX idx_quality_date ON quality_data(inspection_date);
CREATE INDEX idx_factory_quality ON quality_data(factory_id, inspection_date); 