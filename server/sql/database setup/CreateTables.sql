USE LostCities

-- Drop all existing tables

EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"
EXEC sp_MSforeachtable @command1 = "DROP TABLE ?"

-- Create tables

CREATE TABLE Account
(
  AccountSK INT NOT NULL IDENTITY PRIMARY KEY,
  GoogleID VARCHAR(128) NULL UNIQUE,
  Username NVARCHAR(25) NOT NULL,
  AvatarURL VARCHAR(2083) NULL,
  SkillRating INT NOT NULL DEFAULT 1000
);

CREATE TABLE Game
(
  GameSK INT NOT NULL IDENTITY PRIMARY KEY,
  GameName NVARCHAR(25) NOT NULL,
  GamePassword NVARCHAR(128) NULL,
  GameState VARCHAR(128) NOT NULL CONSTRAINT CK_Game_State CHECK (GameState IN ('Lobby', 'Gameplay')),
  TurnState VARCHAR(128) NOT NULL CONSTRAINT CK_Turn_State CHECK (TurnState IN ('Placing', 'Drawing')),
  HostSK INT NOT NULL FOREIGN KEY REFERENCES Account(AccountSK),
  CreationDate DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE GameMember
(
  GameMemberSK INT NOT NULL IDENTITY PRIMARY KEY,
  AccountSK INT NOT NULL FOREIGN KEY REFERENCES Account(AccountSK),
  GameSK INT NOT NULL FOREIGN KEY REFERENCES Game(GameSK),
  GameMemberType NVARCHAR(128) NOT NULL CONSTRAINT CK_GameMember_Type CHECK (GameMemberType IN ('Player', 'Spectator')),
  IsReady BIT NOT NULL DEFAULT 0,
  IsTurn BIT NOT NULL DEFAULT 0
);

CREATE TABLE GameResult
(
  GameResultSK INT NOT NULL IDENTITY PRIMARY KEY,
  WinnerSK INT NOT NULL FOREIGN KEY REFERENCES Account(AccountSK),
  LoserSK INT NOT NULL FOREIGN KEY REFERENCES Account(AccountSK)
);

CREATE TABLE Deck
(
  DeckSK INT NOT NULL IDENTITY PRIMARY KEY,
  GameSK INT NOT NULL FOREIGN KEY REFERENCES Game(GameSK)
);

CREATE TABLE DiscardPile
(
  DiscardPileSK INT NOT NULL IDENTITY PRIMARY KEY,
  GameSK INT NOT NULL FOREIGN KEY REFERENCES Game(GameSK),
  DiscardPileColor NVARCHAR(128) NOT NULL CONSTRAINT CK_DiscardPile_Color CHECK (DiscardPileColor IN ('Color3', 'Color4', 'Color2', 'Color5', 'Color1'))
);

CREATE TABLE Hand
(
  HandSK INT NOT NULL IDENTITY PRIMARY KEY,
  GameSK INT NOT NULL FOREIGN KEY REFERENCES Game(GameSK),
  PlayerSK INT NOT NULL FOREIGN KEY REFERENCES GameMember(GameMemberSK)
);

CREATE TABLE ScorePile
(
  ScorePileSK INT NOT NULL IDENTITY PRIMARY KEY,
  GameSK INT NOT NULL FOREIGN KEY REFERENCES Game(GameSK),
  ScorePileColor VARCHAR(128) NOT NULL CONSTRAINT CK_ScorePile_Color CHECK (ScorePileColor IN ('Color3', 'Color4', 'Color2', 'Color5', 'Color1')),
  PlayerSK INT NOT NULL FOREIGN KEY REFERENCES GameMember(GameMemberSK)
);

CREATE TABLE Card
(
  CardSK INT NOT NULL IDENTITY PRIMARY KEY,
  CardColor VARCHAR(128) NOT NULL CONSTRAINT CK_Card_Color CHECK (CardColor IN ('Color3', 'Color4', 'Color2', 'Color5', 'Color1')),
  CardValue TINYINT NOT NULL CONSTRAINT CK_Card_Value CHECK (CardValue > 0 AND CardValue < 11)
);

CREATE TABLE DeckCard
(
  CardSK INT NOT NULL FOREIGN KEY REFERENCES Card(CardSK),
  DeckSK INT NOT NULL FOREIGN KEY REFERENCES Deck(DeckSK),
  DeckCardOrder BIGINT NOT NULL IDENTITY
);

CREATE TABLE DiscardPileCard
(
  CardSK INT NOT NULL FOREIGN KEY REFERENCES Card(CardSK),
  DiscardPileSK INT NOT NULL FOREIGN KEY REFERENCES DiscardPile(DiscardPileSK),
  DiscardPileCardOrder BIGINT NOT NULL IDENTITY
);

CREATE TABLE HandCard
(
  CardSK INT NOT NULL FOREIGN KEY REFERENCES Card(CardSK),
  HandSK INT NOT NULL FOREIGN KEY REFERENCES Hand(HandSK)
);

CREATE TABLE ScorePileCard
(
  CardSK INT NOT NULL FOREIGN KEY REFERENCES Card(CardSK),
  ScorePileSK INT NOT NULL FOREIGN KEY REFERENCES ScorePile(ScorePileSK)
);

-- Fill Cards table
INSERT INTO Card (CardColor, CardValue)
VALUES
  ('Color3', 1),
  ('Color3', 1),
  ('Color3', 1),
  ('Color3', 2),
  ('Color3', 3),
  ('Color3', 4),
  ('Color3', 5),
  ('Color3', 6),
  ('Color3', 7),
  ('Color3', 8),
  ('Color3', 9),
  ('Color3', 10),
  ('Color4', 1),
  ('Color4', 1),
  ('Color4', 1),
  ('Color4', 2),
  ('Color4', 3),
  ('Color4', 4),
  ('Color4', 5),
  ('Color4', 6),
  ('Color4', 7),
  ('Color4', 8),
  ('Color4', 9),
  ('Color4', 10),
  ('Color2', 1),
  ('Color2', 1),
  ('Color2', 1),
  ('Color2', 2),
  ('Color2', 3),
  ('Color2', 4),
  ('Color2', 5),
  ('Color2', 6),
  ('Color2', 7),
  ('Color2', 8),
  ('Color2', 9),
  ('Color2', 10),
  ('Color5', 1),
  ('Color5', 1),
  ('Color5', 1),
  ('Color5', 2),
  ('Color5', 3),
  ('Color5', 4),
  ('Color5', 5),
  ('Color5', 6),
  ('Color5', 7),
  ('Color5', 8),
  ('Color5', 9),
  ('Color5', 10),
  ('Color1', 1),
  ('Color1', 1),
  ('Color1', 1),
  ('Color1', 2),
  ('Color1', 3),
  ('Color1', 4),
  ('Color1', 5),
  ('Color1', 6),
  ('Color1', 7),
  ('Color1', 8),
  ('Color1', 9),
  ('Color1', 10)
