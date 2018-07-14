/*

  Contains turn logic to draw a card.

  Turns have two parts:
    1. Play a card to a score pile or discard pile.
    This file--> 2. Draw a card from the deck or a discard pile.


  @accountSK
  The user that's making the turn. An AccountSK

  @drawCardLocationType
  Whether the draw card location is the deck or a discardpile. Either Deck or DiscardPile.

  @drawCardLocationSK
  The draw location SK they're drawing from.

*/

--DECLARE @accountSK INT = (SELECT AccountSK FROM Account WHERE Username = 'Jordan');
--DECLARE @drawCardLocationType NVARCHAR(200) = '';
--DECLARE @drawCardLocationSK INT = '9896A367-AB3C-4A83-97CD-FC9651084A50';

/*

  Computed variables

*/

BEGIN TRANSACTION
BEGIN TRY

  -- Game that the user is in.
  DECLARE @gameSK INT = (SELECT GameSK FROM GameMember WHERE AccountSK = @accountSK);

  -- GameMember associated with user.
  DECLARE @gameMemberSK INT = (SELECT GameMemberSK FROM GameMember WHERE AccountSK = @accountSK);

  -- User's hand
  DECLARE @handSK INT = (SELECT HandSK FROM Hand WHERE PlayerSK = @gameMemberSK AND GameSK = @gameSK);

  /*

    Validations

  */

  -- Inputs must be provided
  IF (@accountSK IS NULL OR @drawCardLocationSK IS NULL)
    THROW 50001, 'Unable to draw card: user and draw card location must be supplied.', 1;

  -- Draw card location type must be valid.
  IF (@drawCardLocationType <> 'Deck' AND @drawCardLocationType <> 'DiscardPile')
    THROW 50001, 'Draw card location type must be Deck or DiscardPile.', 1;

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

  -- If drawing from deck, the deck must be for the user's game.
  IF (@drawCardLocationType = 'Deck' AND (SELECT COUNT(*) FROM Deck WHERE DeckSK = @drawCardLocationSK AND GameSK = @gameSK) < 1)
      THROW 50001, 'Selected deck must be in the player''s game.', 1;

  -- If drawing from a discard pile, the discard pile must be for the user's game.
  IF (@drawCardLocationType = 'DiscardPile' AND (SELECT COUNT(*) FROM DiscardPile WHERE DiscardPileSK = @drawCardLocationSK AND GameSK = @gameSK) = 0)
      THROW 50001, 'Selected discard pile must be in the player''s game.', 1;

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

  -- Find the deck size after drawing and whether this results in a game over.
  DECLARE @deckSize INT = (SELECT COUNT(*) FROM DeckCard INNER JOIN Deck ON (Deck.DeckSK = DeckCard.DeckSK) WHERE Deck.GameSK = @gameSK)
  DECLARE @isGameOver BIT = CASE WHEN @deckSize < 1 THEN 1 ELSE 0 END
  DECLARE @winner NVARCHAR(25)

  -- If the game is over, send the game back to the lobby and determine the winner.
  IF (@isGameOver = 1)
  BEGIN
    DECLARE @accountSK2 INT = (SELECT AccountSK FROM GameMember WHERE GameSK = @gameSK AND AccountSK != @accountSK AND GameMemberType = 'Player');

    -- Determine score for player 1
    IF OBJECT_ID('tempdb..#AccountScores') IS NOT NULL DROP TABLE #AccountScores

    CREATE TABLE #AccountScores(ScorePileColor NVARCHAR(128), CardsPresent BIT, ScorePileScore INT, Investments INT, BonusPoints BIT, TotalScore INT)

    INSERT INTO #AccountScores(ScorePileColor, CardsPresent, ScorePileScore, Investments, BonusPoints, TotalScore)
    SELECT ScorePileColor,
           CASE WHEN COUNT(ScorePileCard.CardSK) != 0 THEN 1 ELSE 0 END AS CardsPresent,
           SUM(CASE WHEN Card.CardValue != 1 THEN Card.CardValue ELSE 0 END) AS ScorePileScore,
           COUNT(CASE WHEN Card.CardValue = 1 THEN 1 END) AS Investments,
           CASE WHEN COUNT(ScorePileCard.CardSK) >= 8 THEN 1 ELSE 0 END AS BonusPoints,
           (-20 * (CASE WHEN COUNT(ScorePileCard.CardSK) != 0 THEN 1 ELSE 0 END) + SUM(CASE WHEN Card.CardValue != 1 THEN Card.CardValue ELSE 0 END)) * (COUNT(CASE WHEN Card.CardValue = 1 THEN 1 END) + 1) + ((CASE WHEN COUNT(ScorePileCard.CardSK) >= 8 THEN 1 ELSE 0 END) * 20) AS TotalScore
    FROM ScorePile
    LEFT OUTER JOIN ScorePileCard ON (ScorePile.ScorePileSK = ScorePileCard.ScorePileSK)
    LEFT OUTER JOIN Card ON (ScorePileCard.CardSK = Card.CardSK)
    INNER JOIN GameMember ON (GameMember.GameMemberSK = ScorePile.PlayerSK)
    INNER JOIN Account ON (Account.AccountSK = GameMember.AccountSK)
    WHERE Account.AccountSK = @accountSK
    GROUP BY ScorePileColor

    DECLARE @accountScore INT = (SELECT SUM(TotalScore) AS TotalScore FROM #AccountScores)


    -- Determine score for player 2
    IF OBJECT_ID('tempdb..#AccountScores2') IS NOT NULL DROP TABLE #AccountScores2

    CREATE TABLE #AccountScores2(ScorePileColor NVARCHAR(128), CardsPresent BIT, ScorePileScore INT, Investments INT, BonusPoints BIT, TotalScore INT)

    INSERT INTO #AccountScores2(ScorePileColor, CardsPresent, ScorePileScore, Investments, BonusPoints, TotalScore)
    SELECT ScorePileColor,
           CASE WHEN COUNT(ScorePileCard.CardSK) != 0 THEN 1 ELSE 0 END AS CardsPresent,
           SUM(CASE WHEN Card.CardValue != 1 THEN Card.CardValue ELSE 0 END) AS ScorePileScore,
           COUNT(CASE WHEN Card.CardValue = 1 THEN 1 END) AS Investments,
           CASE WHEN COUNT(ScorePileCard.CardSK) >= 8 THEN 1 ELSE 0 END AS BonusPoints,
           (-20 * (CASE WHEN COUNT(ScorePileCard.CardSK) != 0 THEN 1 ELSE 0 END) + SUM(CASE WHEN Card.CardValue != 1 THEN Card.CardValue ELSE 0 END)) * (COUNT(CASE WHEN Card.CardValue = 1 THEN 1 END) + 1) + ((CASE WHEN COUNT(ScorePileCard.CardSK) >= 8 THEN 1 ELSE 0 END) * 20) AS TotalScore
    FROM ScorePile
    LEFT OUTER JOIN ScorePileCard ON (ScorePile.ScorePileSK = ScorePileCard.ScorePileSK)
    LEFT OUTER JOIN Card ON (ScorePileCard.CardSK = Card.CardSK)
    INNER JOIN GameMember ON (GameMember.GameMemberSK = ScorePile.PlayerSK)
    INNER JOIN Account ON (Account.AccountSK = GameMember.AccountSK)
    WHERE Account.AccountSK = @accountSK2
    GROUP BY ScorePileColor

    DECLARE @accountScore2 INT = (SELECT SUM(TotalScore) AS TotalScore FROM #AccountScores2)

    -- Sets the winner to the username of the account that has the higher score.
    SET @winner = CASE WHEN @accountScore > @accountScore2 THEN (SELECT Username FROM Account WHERE Account.AccountSK = @accountSK) WHEN @accountScore < @accountScore2 THEN (SELECT Username FROM Account WHERE Account.AccountSK = @accountSK2) ELSE (SELECT 'Tie Game') END


    UPDATE Game SET GameState = 'Lobby' WHERE GameSK = @gameSK

    DELETE DeckCard
    WHERE DeckSK IN (SELECT DeckSK FROM Deck WHERE GameSK = @gameSK)

    DELETE DiscardPileCard
    WHERE DiscardPileSK IN (SELECT DiscardPileSK FROM DiscardPile WHERE GameSK = @gameSK)

    DELETE HandCard
    WHERE HandSK IN (SELECT HandSK FROM Hand WHERE GameSK = @gameSK)

    DELETE ScorePileCard
    WHERE ScorePileSK IN (SELECT ScorePileSK FROM ScorePile WHERE GameSK = @gameSK)

    DELETE FROM Deck
    WHERE GameSK = @gameSK

    DELETE FROM DiscardPile
    WHERE GameSK = @gameSK

    DELETE FROM Hand
    WHERE GameSK = @gameSK

    DELETE FROM ScorePile
    WHERE GameSK = @gameSK
  END

  -- Return who drew the card, the game, and how many cards are left in the deck to check for game over.
  SELECT @gameSK AS game,
         @isGameOver AS isGameOver,
         @winner AS winner
  FROM Account
  WHERE AccountSK = @accountSK

END TRY
BEGIN CATCH
  DECLARE @error int,
          @message varchar(4000),
          @xstate int;

  SELECT
      @error = 50000,
      @message = ERROR_MESSAGE(),
      @xstate = XACT_STATE();

  ROLLBACK TRANSACTION;

  THROW @error, @message, @xstate;

END CATCH

IF @@TRANCOUNT > 0
  COMMIT TRANSACTION;
