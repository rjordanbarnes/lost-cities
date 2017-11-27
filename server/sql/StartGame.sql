-- Starts the game that the specified user is hosting.

/*
  SELECT * FROM Users
  SELECT * FROM Participants
  SELECT * FROM Games
  SELECT * FROM Cards

  SELECT * FROM Decks
  SELECT * FROM DiscardPiles
  SELECT * FROM Hands
  SELECT * FROM ScorePiles ORDER BY Player, Color

  SELECT * FROM DeckCards
  SELECT * FROM DiscardPileCards
  SELECT * FROM HandCards
  SELECT * FROM ScorePileCards
  
  DELETE FROM Decks
  DELETE FROM DiscardPiles
  DELETE FROM Hands
  DELETE FROM ScorePiles
  DELETE FROM DeckCards
  DELETE FROM DiscardPileCards
  DELETE FROM HandCards
  DELETE FROM ScorePileCards
*/

--DECLARE @userId UNIQUEIDENTIFIER = '06BB6B61-17EC-4384-8ABF-526299C5AB0F';

-- Game that the user is in.
DECLARE @gameId UNIQUEIDENTIFIER = (SELECT Game FROM Participants WHERE [User] = @userId);

-- User must be in a game.
IF (@gameId IS NULL)
  THROW 50001, 'Unable to start game, user isn''t in a game.', 1;

-- User must be host of a game.
IF ((SELECT COUNT(*) FROM Games WHERE Host = @userId AND GameId = @gameId) < 1)
  THROW 50001, 'Unable to start game, user isn''t the host.', 1;

-- There must be 2 ready players in the game.
IF ((SELECT COUNT(*) FROM Participants WHERE Game = @gameId AND IsReady = 1) < 2)
  THROW 50001, 'Unable to start game, game doesn''t have at least two players that are ready.', 1;

-- Game must be at lobby
IF ((SELECT State FROM Games WHERE GameId = @gameId) != 'Lobby')
  THROW 50001, 'Unable to start game, game isn''t at lobby.', 1;

-- Updates game state
UPDATE Games
SET State = 'Gameplay'
WHERE GameId = @gameId

-- Reset ready state for players.
UPDATE Participants
SET IsReady = 0
WHERE Game = @gameId

-- Other user in the game.
DECLARE @userId2 UNIQUEIDENTIFIER = (SELECT [User] FROM Participants WHERE Game = @gameId AND [User] != @userId AND Type = 'Player');


------- Creates deck -------
DECLARE @deckId UNIQUEIDENTIFIER = NEWID();

INSERT INTO Decks(DeckId, Game)
VALUES (@deckId, @gameId)

-- Insert one of each card into the deck (60 cards)
INSERT INTO DeckCards(Card, Deck, [Order])
SELECT CardId, @deckId, ROW_NUMBER() OVER(ORDER BY NEWID()) FROM Cards

----------------------------

------- Creates the 5 discard piles -------
INSERT INTO DiscardPiles (Color, Game)
VALUES
  ('Red', @gameId),
  ('Green', @gameId),
  ('White', @gameId),
  ('Blue', @gameId),
  ('Yellow', @gameId)

----------------------------

------- Creates the 10 score piles -------
DECLARE @participantId UNIQUEIDENTIFIER = (SELECT ParticipantId FROM Participants WHERE [User] = @userId);
DECLARE @participantId2 UNIQUEIDENTIFIER = (SELECT ParticipantId FROM Participants WHERE [User] = @userId2);

INSERT INTO ScorePiles (Color, Player, Game)
VALUES
  ('Red', @participantId, @gameId),
  ('Green', @participantId, @gameId),
  ('White', @participantId, @gameId),
  ('Blue', @participantId, @gameId),
  ('Yellow', @participantId, @gameId),
  ('Red', @participantId2, @gameId),
  ('Green', @participantId2, @gameId),
  ('White', @participantId2, @gameId),
  ('Blue', @participantId2, @gameId),
  ('Yellow', @participantId2, @gameId)

----------------------------

------- Creates the player hands -------.
DECLARE @handId UNIQUEIDENTIFIER = NEWID();
DECLARE @handId2 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Hands (HandId, Player, Game)
VALUES
  (@handId, @participantId, @gameId),
  (@handId2, @participantId2, @gameId)
----------------------------

------- Draws 8 cards for each player -------

INSERT INTO HandCards(Card, Hand)
SELECT TOP 8 Card, @handId FROM DeckCards
ORDER BY [Order]

DELETE FROM DeckCards
WHERE Card IN (SELECT Card FROM HandCards WHERE Hand = @handId)

INSERT INTO HandCards(Card, Hand)
SELECT TOP 8 Card, @handId2 FROM DeckCards
ORDER BY [Order]

DELETE FROM DeckCards
WHERE Card IN (SELECT Card FROM HandCards WHERE Hand = @handId2)
----------------------------

SELECT @gameId AS gameId