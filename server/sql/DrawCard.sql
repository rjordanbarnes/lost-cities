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
  
  -- Score Pile information used by the Socket Server to determine who won
  SELECT
    @gameSK AS game,
    @isGameOver AS isGameOver,
    AccountSK,
    ScorePileColor,
    CardValue
  FROM ScorePile
  LEFT OUTER JOIN ScorePileCard ON (ScorePile.ScorePileSK = ScorePileCard.ScorePileSK)
  LEFT OUTER JOIN Card ON (ScorePileCard.CardSK = Card.CardSK)
  INNER JOIN GameMember ON (GameMember.GameMemberSK = ScorePile.PlayerSK)
  WHERE ScorePile.GameSK = @gameSK
  ORDER BY AccountSK

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
