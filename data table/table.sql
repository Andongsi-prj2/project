-- mes의 CROM 테이블 만들기
CREATE TABLE `CROM` (
  `INDEX` int NOT NULL AUTO_INCREMENT,
  `LOT` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TIME` datetime DEFAULT NULL,
  `PH` decimal(4,2) DEFAULT NULL,
  `TEMP` float DEFAULT NULL,
  `VOLTAGE` float DEFAULT NULL,
  `IMAGE_FILE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IMG` longblob,
  `DATE` date DEFAULT NULL,
  PRIMARY KEY (`INDEX`)
) ENGINE=InnoDB AUTO_INCREMENT=50125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- mes의 CROM_img 테이블 만들기

CREATE TABLE `CROM_img` (
  `IMAGE_FILE` varchar(50) DEFAULT NULL,
  `IMG` longblob
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 데이터 웨어하우스의 CROM 테이블 만들기

CREATE TABLE `CROM` (
  `INDEX` bigint unsigned DEFAULT NULL,
  `LOT` varchar(50) DEFAULT NULL,
  `TIME` datetime DEFAULT NULL,
  `PH` decimal(4,2) DEFAULT NULL,
  `TEMP` float DEFAULT NULL,
  `VOLTAGE` float DEFAULT NULL,
  `IMAGE_FILE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IMG` longblob,
  `DATE` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 데이터 웨어하우스의 CROM_img 테이블 만들기

CREATE TABLE `CROM_img` (
  `IMAGE_FILE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IMG` longblob
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 데이터 마트의 CROM 테이블 만들기

CREATE TABLE `CROM` (
  `INDEX` bigint unsigned DEFAULT NULL,
  `LOT` varchar(50) DEFAULT NULL,
  `TIME` datetime DEFAULT NULL,
  `PH` decimal(4,2) DEFAULT NULL,
  `TEMP` float DEFAULT NULL,
  `VOLTAGE` float DEFAULT NULL,
  `IMAGE_FILE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DETECTION` tinyint(1) DEFAULT NULL,
  `DEFEVTIVE_TYPE` tinyint DEFAULT NULL,
  `IMG` longblob,
  `DATE` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 데이터 마트의 CROM_img 테이블 만들기

CREATE TABLE `CROM_img` (
  `IMAGE_FILE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IMG` longblob
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;