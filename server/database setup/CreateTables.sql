USE LostCities

-- Drop all existing tables

EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"
EXEC sp_MSforeachtable @command1 = "DROP TABLE ?"

-- Create tables

CREATE TABLE Users
(
  UserId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
  Username NVARCHAR(25) NOT NULL UNIQUE,
  Rating INT NOT NULL DEFAULT 0
);

CREATE TABLE Games
(
  GameId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
  Name NVARCHAR(25) NOT NULL,
  Password NVARCHAR(128) NULL,
  Host UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserId),
  State VARCHAR(128) NOT NULL CONSTRAINT CK_Games_State CHECK (State IN ('Lobby', 'Gameplay')),
  CreationDate DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Participants
(
  ParticipantId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
  [User] UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserId),
  Game UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Games(GameId),
  Type NVARCHAR(128) NOT NULL CONSTRAINT CK_Participants_Type CHECK (Type IN ('Player', 'Spectator')),
  IsReady BIT NOT NULL DEFAULT 0
);

CREATE TABLE Results
(
  ResultId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
  Game UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Games(GameId),
  Winner UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserId),
  Loser UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserId)
);

CREATE TABLE Decks
(
  DeckId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
  Game UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Games(GameId)
);

CREATE TABLE DiscardPiles
(
  DiscardPileId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
  Game UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Games(GameId),
  Color NVARCHAR(128) NOT NULL CONSTRAINT CK_DiscardPiles_Color CHECK (Color IN ('Red', 'Green', 'White', 'Blue', 'Yellow'))
);

CREATE TABLE Hands
(
  HandId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
  Game UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Games(GameId),
  Player UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Participants(ParticipantId)
);

CREATE TABLE ScorePiles
(
  ScorePileId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
  Game UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Games(GameId),
  Color NVARCHAR(128) NOT NULL CONSTRAINT CK_ScorePiles_Color CHECK (Color IN ('Red', 'Green', 'White', 'Blue', 'Yellow')),
  Player UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Participants(ParticipantId),
);

CREATE TABLE Cards
(
  CardId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
  Color NVARCHAR(128) NOT NULL CONSTRAINT CK_Cards_Color CHECK (Color IN ('Red', 'Green', 'White', 'Blue', 'Yellow')),
  Value TINYINT NOT NULL CONSTRAINT CK_Cards_Value CHECK (Value > 0 AND Value < 11)
);

CREATE TABLE DeckCards
(
  Card UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Cards(CardId),
  Deck UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Decks(DeckId),
  [Order] TINYINT CONSTRAINT CK_DeckCards_Order CHECK ([Order] > 0 AND [Order] < 61)
);

CREATE TABLE DiscardPileCards
(
  Card UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Cards(CardId),
  DiscardPile UNIQUEIDENTIFIER FOREIGN KEY REFERENCES DiscardPiles(DiscardPileId)
);

CREATE TABLE HandCards
(
  Card UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Cards(CardId),
  Hand UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Hands(HandId)
);

CREATE TABLE ScorePileCards
(
  Card UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Cards(CardId),
  ScorePile UNIQUEIDENTIFIER FOREIGN KEY REFERENCES ScorePiles(ScorePileId)
);

-- Fill Cards table
INSERT INTO Cards (Color, Value)
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