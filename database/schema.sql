CREATE DATABASE IF NOT EXISTS journey_game;
USE journey_game;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    characterId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS characters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(100) UNIQUE NOT NULL,
    completedStage INT DEFAULT 0,
    dexterity INT DEFAULT 0,
    intelligence INT DEFAULT 0,
    strength INT DEFAULT 0,
    level INT DEFAULT 1,
    exp INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enemies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dexterityPerLvl INT DEFAULT 0,
    intelligencePerLvl INT DEFAULT 0,
    strengthPerLvl INT DEFAULT 0,
    baseSpeed INT DEFAULT 10
);

CREATE TABLE IF NOT EXISTS stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enemyId INT NOT NULL,
    enemyLvl INT NOT NULL,
    FOREIGN KEY (enemyId) REFERENCES enemies(id)
);

CREATE TABLE IF NOT EXISTS combats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stage INT NOT NULL,
    characterId INT NOT NULL,
    enemyId INT NOT NULL,
    enemyLvl INT NOT NULL,
    isWin BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (characterId) REFERENCES characters(id),
    FOREIGN KEY (enemyId) REFERENCES enemies(id)
);

CREATE TABLE IF NOT EXISTS combatLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combatId INT NOT NULL,
    characterId INT,
    enemyId INT,
    attacker VARCHAR(50) NOT NULL,
    damage INT NOT NULL,
    hpBefore INT NOT NULL,
    hpAfter INT NOT NULL,
    shieldBefore INT DEFAULT 0,
    shieldAfter INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (combatId) REFERENCES combats(id)
);

CREATE TABLE IF NOT EXISTS training (
    id INT AUTO_INCREMENT PRIMARY KEY,
    characterId INT UNIQUE NOT NULL,
    stat VARCHAR(20) NOT NULL,
    startTime TIMESTAMP NOT NULL,
    lastClaimTime TIMESTAMP NOT NULL,
    FOREIGN KEY (characterId) REFERENCES characters(id)
);

CREATE TABLE IF NOT EXISTS stageCompletions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    characterId INT NOT NULL,
    stage INT NOT NULL,
    completions INT DEFAULT 0,
    FOREIGN KEY (characterId) REFERENCES characters(id),
    UNIQUE KEY unique_character_stage (characterId, stage)
);

ALTER TABLE users ADD FOREIGN KEY (characterId) REFERENCES characters(id);

INSERT INTO enemies (name, dexterityPerLvl, intelligencePerLvl, strengthPerLvl, baseSpeed) VALUES
('Goblin', 1, 0, 2, 8),
('Orc', 0, 1, 3, 6),
('Skeleton', 2, 0, 1, 12),
('Dark Mage', 1, 3, 0, 9),
('Dragon', 2, 2, 5, 7);

INSERT INTO stages (id, enemyId, enemyLvl) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 3),
(4, 3, 4),
(5, 1, 5),
(10, 2, 10),
(15, 3, 15),
(20, 4, 20),
(50, 4, 50),
(100, 5, 100);
