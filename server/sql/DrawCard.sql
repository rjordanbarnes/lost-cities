/*
  
  Contains turn logic to draw a card.

  Turns have two parts:
    1. Play a card to a score pile or discard pile.
    This file--> 2. Draw a card from the deck or a discard pile.


  @accountSK
  The user that's making the turn. An AccountSK

  @drawCardLocationSK
  The location they're drawing from. Either a DeckSK or a DiscardPileSK

*/

--DECLARE @accountSK UNIQUEIDENTIFIER = (SELECT AccountSK FROM Account WHERE Username = 'Jordan');
--DECLARE @drawCardLocationSK UNIQUEIDENTIFIER = '9896A367-AB3C-4A83-97CD-FC9651084A50';

/*

  Computed variables

*/

-- Game that the user is in.
DECLARE @gameSK UNIQUEIDENTIFIER = (SELECT GameSK FROM GameMember WHERE AccountSK = @accountSK);

-- GameMember associated with user.
DECLARE @gameMemberSK UNIQUEIDENTIFIER = (SELECT GameMemberSK FROM GameMember WHERE AccountSK = @accountSK);

-- User's hand
DECLARE @handSK UNIQUEIDENTIFIER = (SELECT HandSK FROM Hand WHERE PlayerSK = @gameMemberSK AND GameSK = @gameSK);

-- Whether the draw card location is the deck or a discardpile.
DECLARE @drawCardLocationType NVARCHAR(128);

IF ((SELECT COUNT(*) FROM Deck WHERE DeckSK = @drawCardLocationSK AND GameSK = @gameSK) > 0)
  SET @drawCardLocationType = 'Deck';
ELSE IF ((SELECT COUNT(*) FROM DiscardPile WHERE DiscardPileSK = @drawCardLocationSK AND GameSK = @gameSK) > 0)
  SET @drawCardLocationType = 'DiscardPile';
ELSE
  THROW 50001, 'Draw card location must be the deck or a discard pile for the user''s game.', 1;

/*

  Validations

*/

-- Inputs must be provided
IF (@accountSK IS NULL OR @drawCardLocationSK IS NULL)
  THROW 50001, 'Unable to draw card: user and draw card location must be supplied.', 1;

-- User must be in a game.
IF (@gameSK IS NULL)
  THROW 50001, 'Unable to draw card, user isn''t in a game.', 1;

-- User must be a player.
IF ((SELECT COUNT(*) FROM GameMember WHERE GameSK = @gameSK AND GameMemberSK = @gameMemberSK AND GameMemberType = 'Player') < 1)
  THROW 50001, 'Unable to draw card, user isn''t a player.', 1;

-- It must be the user's turn.
IF ((SELECT COUNT(*) FROM GameMember WHERE GameSK = @gameSK AND GameMemberSK = @gameMemberSK AND IsTurn = 1) < 1)
  THROW 50001, 'Unable to draw card, it isn''t user''s turn.', 1;

-- Game must be in gameplay state.
IF ((SELECT GameState FROM Game WHERE GameSK = @gameSK) != 'Gameplay')
  THROW 50001, 'Unable to draw card, game isn''t in gameplay state.', 1;

-- If drawing from a discard pile, there must be cards in the pile.
IF (@drawCardLocationType = 'DiscardPile' AND (SELECT COUNT(*) FROM DiscardPileCard WHERE DiscardPileSK = @drawCardLocationSK) < 1)
  THROW 50001, 'Unable to make turn, discard pile is empty.', 1;

/*

  Draw Card

*/

IF (@drawCardLocationType = 'Deck')
BEGIN

  INSERT INTO HandCard(CardSK, HandSK)
  SELECT TOP 1 CardSK, @handSK FROM DeckCard
  WHERE DeckSK = @drawCardLocationSK
  ORDER BY DeckCardOrder DESC

  DELETE FROM DeckCard
  WHERE CardSK IN (SELECT CardSK FROM HandCard WHERE HandSK = @handSK) AND DeckSK = @drawCardLocationSK

END
ELSE IF (@drawCardLocationType = 'DiscardPile')
BEGIN

  INSERT INTO HandCard(CardSK, HandSK)
  SELECT TOP 1 CardSK, @handSK FROM DiscardPileCard
  WHERE DiscardPileSK = @drawCardLocationSK
  ORDER BY DiscardPileCardOrder DESC

  DELETE FROM DiscardPileCard
  WHERE CardSK IN (SELECT CardSK FROM HandCard WHERE HandSK = @handSK) AND DiscardPileSK = @drawCardLocationSK

END

-- Update turn state
UPDATE Game
SET TurnState = 'Placing'
WHERE GameSK = @gameSK

-- Update whose turn it is
UPDATE GameMember
SET IsTurn = 0
WHERE AccountSK = @accountSK AND GameSK = @gameSK

UPDATE GameMember
SET IsTurn = 1
WHERE AccountSK != @accountSK AND GameSK = @gameSK AND GameMemberType = 'Player'

-- Return who drew the card and the game.
SELECT Username, @gameSK AS game
FROM Account
WHERE AccountSK = @accountSK