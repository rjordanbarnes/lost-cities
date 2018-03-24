-- Starts the game that the specified user is hosting.

/*
  SELECT * FROM Account
  SELECT * FROM GameMember
  SELECT * FROM Game
  SELECT * FROM Card

  SELECT * FROM Deck
  SELECT * FROM DiscardPile
  SELECT * FROM Hand
  SELECT * FROM ScorePile ORDER BY PlayerSK, ScorePileColor

  SELECT * FROM DeckCard
  SELECT * FROM DiscardPileCard
  SELECT * FROM HandCard
  SELECT * FROM ScorePileCard
  
  DELETE FROM Deck
  DELETE FROM DiscardPile
  DELETE FROM Hand
  DELETE FROM ScorePile
  DELETE FROM DeckCard
  DELETE FROM DiscardPileCard
  DELETE FROM HandCard
  DELETE FROM ScorePileCard
*/

--DECLARE @accountSK UNIQUEIDENTIFIER = 'CB0964E8-BBF6-4A2D-934B-2790D81B0EEA';

-- Game that the user is in.
DECLARE @gameSK UNIQUEIDENTIFIER = (SELECT GameSK FROM GameMember WHERE AccountSK = @accountSK);

-- User must be in a game.
IF (@gameSK IS NULL)
  THROW 50001, 'Unable to start game, user isn''t in a game.', 1;

-- User must be host of a game.
IF ((SELECT COUNT(*) FROM Game WHERE HostSK = @accountSK AND GameSK = @gameSK) < 1)
  THROW 50001, 'Unable to start game, user isn''t the host.', 1;

-- There must be 2 ready players in the game.
IF ((SELECT COUNT(*) FROM GameMember WHERE GameSK = @gameSK AND IsReady = 1) < 2)
  THROW 50001, 'Unable to start game, game doesn''t have at least two players that are ready.', 1;

-- Game must be at lobby
IF ((SELECT GameState FROM Game WHERE GameSK = @gameSK) != 'Lobby')
  THROW 50001, 'Unable to start game, game isn''t at lobby.', 1;

-- Updates game state
UPDATE Game
SET GameState = 'Gameplay'
WHERE GameSK = @gameSK

-- Reset ready state for players.
UPDATE GameMember
SET IsReady = 0
WHERE GameSK = @gameSK

-- Other user in the game.
DECLARE @accountSK2 UNIQUEIDENTIFIER = (SELECT AccountSK FROM GameMember WHERE GameSK = @gameSK AND AccountSK != @accountSK AND GameMemberType = 'Player');


------- Creates deck -------
DECLARE @deckSK UNIQUEIDENTIFIER = NEWID();

INSERT INTO Deck(DeckSK, GameSK)
VALUES (@deckSK, @gameSK)

-- Insert one of each card into the deck (60 cards)
INSERT INTO DeckCard(CardSK, DeckSK, DeckCardOrder)
SELECT CardSK, @deckSK, ROW_NUMBER() OVER(ORDER BY NEWID()) FROM Card

----------------------------

------- Creates the 5 discard piles -------
INSERT INTO DiscardPile (DiscardPileColor, GameSK)
VALUES
  ('Red', @gameSK),
  ('Green', @gameSK),
  ('White', @gameSK),
  ('Blue', @gameSK),
  ('Yellow', @gameSK)

----------------------------

------- Creates the 10 score piles -------
DECLARE @gameMemberSK UNIQUEIDENTIFIER = (SELECT GameMemberSK FROM GameMember WHERE AccountSK = @accountSK);
DECLARE @gameMemberSK2 UNIQUEIDENTIFIER = (SELECT GameMemberSK FROM GameMember WHERE AccountSK = @accountSK2);

INSERT INTO ScorePile (ScorePileColor, PlayerSK, GameSK)
VALUES
  ('Red', @gameMemberSK, @gameSK),
  ('Green', @gameMemberSK, @gameSK),
  ('White', @gameMemberSK, @gameSK),
  ('Blue', @gameMemberSK, @gameSK),
  ('Yellow', @gameMemberSK, @gameSK),
  ('Red', @gameMemberSK2, @gameSK),
  ('Green', @gameMemberSK2, @gameSK),
  ('White', @gameMemberSK2, @gameSK),
  ('Blue', @gameMemberSK2, @gameSK),
  ('Yellow', @gameMemberSK2, @gameSK)

----------------------------

------- Creates the player hands -------
DECLARE @handSK UNIQUEIDENTIFIER = NEWID();
DECLARE @handSK2 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Hand (HandSK, PlayerSK, GameSK)
VALUES
  (@handSK, @gameMemberSK, @gameSK),
  (@handSK2, @gameMemberSK2, @gameSK)
----------------------------

------- Draws 8 cards for each player -------

INSERT INTO HandCard(CardSK, HandSK)
SELECT TOP 8 CardSK, @handSK FROM DeckCard
ORDER BY DeckCardOrder ASC

DELETE FROM DeckCard
WHERE CardSK IN (SELECT CardSK FROM HandCard WHERE HandSK = @handSK)

INSERT INTO HandCard(CardSK, HandSK)
SELECT TOP 8 CardSK, @handSK2 FROM DeckCard
ORDER BY DeckCardOrder ASC

DELETE FROM DeckCard
WHERE CardSK IN (SELECT CardSK FROM HandCard WHERE HandSK = @handSK2)
----------------------------

SELECT @gameSK AS gameSK