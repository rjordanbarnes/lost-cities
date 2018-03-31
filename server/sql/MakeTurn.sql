/*
  
  Contains all turn logic.

  Turns have two parts:
    1. Play a card to a score pile or discard pile.
    2. Draw a card from the deck or a discard pile.


  @accountSK
  The user that's making the turn. An AccountSK

  @playedCardSK
  The card they're playing. A CardSK

  @playedCardLocationSK
  The location they're playing the card. Either a ScorePileSK or a DiscardPileSK

  @drawCardLocationSK
  The location they're drawing from. Either a DeckSK or a DiscardPileSK

*/

--DECLARE @accountSK UNIQUEIDENTIFIER = 'B6FF9F86-BD01-404F-89A6-9CA3E4051F4E';
--DECLARE @playedCardSK UNIQUEIDENTIFIER = '8739FFE9-83A5-452F-A2CA-A477B71836E2';
--DECLARE @playedCardLocationSK UNIQUEIDENTIFIER = '5DA8AD88-60C4-4D94-B141-ECE609350E05';
--DECLARE @drawCardLocationSK UNIQUEIDENTIFIER = '5DA8AD88-60C4-4D94-B141-ECE609350E05';

/*

  Computed variables

*/

-- Game that the user is in.
DECLARE @gameSK UNIQUEIDENTIFIER = (SELECT GameSK FROM GameMember WHERE AccountSK = @accountSK);

-- GameMember associated with user.
DECLARE @gameMemberSK UNIQUEIDENTIFIER = (SELECT GameMemberSK FROM GameMember WHERE AccountSK = @accountSK);

-- User's hand
DECLARE @handSK UNIQUEIDENTIFIER = (SELECT HandSK FROM Hand WHERE PlayerSK = @gameMemberSK AND GameSK = @gameSK);

-- Whether the played card location is a scorepile or a discardpile.
DECLARE @playedCardLocationType NVARCHAR(128);

IF ((SELECT COUNT(*) FROM ScorePile WHERE ScorePileSK = @playedCardLocationSK AND GameSK = @gameSK AND PlayerSK = @gameMemberSK) > 0)
  SET @playedCardLocationType = 'ScorePile';
ELSE IF ((SELECT COUNT(*) FROM DiscardPile WHERE DiscardPileSK = @playedCardLocationSK AND GameSK = @gameSK) > 0)
  SET @playedCardLocationType = 'DiscardPile';
ELSE
  THROW 50001, 'Played card location must be the player''s own score pile or a discard pile for the user''s game.', 1;

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
IF (@accountSK IS NULL OR @playedCardSK IS NULL OR @playedCardLocationSK IS NULL OR @drawCardLocationSK IS NULL)
  THROW 50001, 'Unable to make turn: user, played card, played card location, and draw card location must be supplied.', 1;

-- Not able to play and draw to the same pile in a turn.
IF (@playedCardLocationSK = @drawCardLocationSK)
  THROW 50001, 'Unable to make turn, unable to play and draw to the same pile in a turn.', 1;

-- User must be in a game.
IF (@gameSK IS NULL)
  THROW 50001, 'Unable to make turn, user isn''t in a game.', 1;

-- User must be a player.
IF ((SELECT COUNT(*) FROM GameMember WHERE GameSK = @gameSK AND GameMemberSK = @gameMemberSK AND GameMemberType = 'Player') < 1)
  THROW 50001, 'Unable to make turn, user isn''t a player.', 1;

-- It must be the user's turn.
IF ((SELECT COUNT(*) FROM GameMember WHERE GameSK = @gameSK AND GameMemberSK = @gameMemberSK AND IsTurn = 1) < 1)
  THROW 50001, 'Unable to make turn, it isn''t user''s turn.', 1;

-- Game must be in gameplay state.
IF ((SELECT GameState FROM Game WHERE GameSK = @gameSK) != 'Gameplay')
  THROW 50001, 'Unable to make turn, game isn''t in gameplay state.', 1;

-- Supplied card must be in the user's hand.
IF ((SELECT COUNT(*) FROM HandCard WHERE HandSK = @handSK AND CardSK = @playedCardSK) < 1)
  THROW 50001, 'Unable to make turn, card isn''t in user''s hand.', 1;

/*

  Play Card

*/

-- If playing card on a score pile.
IF (@playedCardLocationType = 'ScorePile')
BEGIN

  -- Card color must match ScorePile color
  IF ((SELECT CardColor FROM Card WHERE CardSK = @playedCardSK) != (SELECT ScorePileColor FROM ScorePile WHERE ScorePileSK = @playedCardLocationSK))
    THROW 50001, 'Unable to play card, card color must match score pile color.', 1;

  DECLARE @largestScorePileValue INT = (SELECT TOP 1 CardValue FROM ScorePile
                                        INNER JOIN ScorePileCard ON (ScorePile.ScorePileSK = ScorePileCard.ScorePileSK)
                                        INNER JOIN Card ON (ScorePileCard.CardSK = Card.CardSK)
                                        WHERE ScorePile.ScorePileSK = @playedCardLocationSK
                                        ORDER BY CardValue DESC);

  -- Card must be of greater value than the highest value card in the pile.
  IF (@largestScorePileValue IS NOT NULL AND (@largestScorePileValue > (SELECT CardValue FROM Card WHERE CardSK = @playedCardSK)))
    THROW 50001, 'Unable to play card, card value must be greater than largest card on score pile.', 1;

  -- Play the card into the user's score pile
  INSERT INTO ScorePileCard (CardSK, ScorePileSK)
  VALUES
    (@playedCardSK, @playedCardLocationSK)

  DELETE FROM HandCard
  WHERE CardSK = @playedCardSK AND HandSK = @handSK

END

-- If playing card on a discard pile.
ELSE IF (@playedCardLocationType = 'DiscardPile')
BEGIN

  -- Card color must match DiscardPile color
  IF ((SELECT CardColor FROM Card WHERE CardSK = @playedCardSK) != (SELECT DiscardPileColor FROM DiscardPile WHERE DiscardPileSK = @playedCardLocationSK))
    THROW 50001, 'Unable to make turn, card color must match discard pile color.', 1;

  -- Play the card into the discard pile
  INSERT INTO DiscardPileCard (CardSK, DiscardPileSK)
  VALUES
    (@playedCardSK, @playedCardLocationSK)

  DELETE FROM HandCard
  WHERE CardSK = @playedCardSK AND HandSK = @handSK

END


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