-- 기존 데이터베이스 구조 분석 스크립트

-- 1. 데이터베이스 목록 확인
SHOW DATABASES;

-- 2. 각 데이터베이스의 테이블 구조 확인
USE DATA_MART;
SHOW TABLES;
DESCRIBE CROM;
DESCRIBE CROM_img;

USE DATA_WAREHOUSE;
SHOW TABLES;
DESCRIBE CROM;
DESCRIBE CROM_img;

USE MES;
SHOW TABLES;
DESCRIBE CROM;
DESCRIBE CROM_img;

-- 3. 샘플 데이터 확인 (각 테이블의 처음 5개 행)
USE DATA_MART;
SELECT * FROM CROM LIMIT 5;
SELECT * FROM CROM_img LIMIT 5;

USE DATA_WAREHOUSE;
SELECT * FROM CROM LIMIT 5;
SELECT * FROM CROM_img LIMIT 5;

USE MES;
SELECT * FROM CROM LIMIT 5;
SELECT * FROM CROM_img LIMIT 5;

-- 4. 테이블 크기 및 행 수 확인
SELECT 
    table_schema as 'Database',
    table_name as 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows as 'Rows'
FROM information_schema.tables 
WHERE table_schema IN ('DATA_MART', 'DATA_WAREHOUSE', 'MES')
ORDER BY table_schema, table_name; 