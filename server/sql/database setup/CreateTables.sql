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
  DiscardPileColor NVARCHAR(128) NOT NULL CONSTRAINT CK_DiscardPile_Color CHECK (DiscardPileColor IN ('Red', 'Green', 'White', 'Blue', 'Yellow'))
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
  ScorePileColor VARCHAR(128) NOT NULL CONSTRAINT CK_ScorePile_Color CHECK (ScorePileColor IN ('Red', 'Green', 'White', 'Blue', 'Yellow')),
  PlayerSK INT NOT NULL FOREIGN KEY REFERENCES GameMember(GameMemberSK)
);

CREATE TABLE Card
(
  CardSK INT NOT NULL IDENTITY PRIMARY KEY,
  CardColor VARCHAR(128) NOT NULL CONSTRAINT CK_Card_Color CHECK (CardColor IN ('Red', 'Green', 'White', 'Blue', 'Yellow')),
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
  ('Red', 1),
  ('Red', 1),
  ('Red', 1),
  ('Red', 2),
  ('Red', 3),
  ('Red', 4),
  ('Red', 5),
  ('Red', 6),
  ('Red', 7),
  ('Red', 8),
  ('Red', 9),
  ('Red', 10),
  ('Green', 1),
  ('Green', 1),
  ('Green', 1),
  ('Green', 2),
  ('Green', 3),
  ('Green', 4),
  ('Green', 5),
  ('Green', 6),
  ('Green', 7),
  ('Green', 8),
  ('Green', 9),
  ('Green', 10),
  ('White', 1),
  ('White', 1),
  ('White', 1),
  ('White', 2),
  ('White', 3),
  ('White', 4),
  ('White', 5),
  ('White', 6),
  ('White', 7),
  ('White', 8),
  ('White', 9),
  ('White', 10),
  ('Blue', 1),
  ('Blue', 1),
  ('Blue', 1),
  ('Blue', 2),
  ('Blue', 3),
  ('Blue', 4),
  ('Blue', 5),
  ('Blue', 6),
  ('Blue', 7),
  ('Blue', 8),
  ('Blue', 9),
  ('Blue', 10),
  ('Yellow', 1),
  ('Yellow', 1),
  ('Yellow', 1),
  ('Yellow', 2),
  ('Yellow', 3),
  ('Yellow', 4),
  ('Yellow', 5),
  ('Yellow', 6),
  ('Yellow', 7),
  ('Yellow', 8),
  ('Yellow', 9),
  ('Yellow', 10)