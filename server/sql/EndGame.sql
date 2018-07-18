/*

  Ends the given game and attributes the win to the given winner. Returns the name of the winner.

  @gameSK
  The game to end.

  @winnerSK
  The SK of the winner.

*/

--DECLARE @gameSK INT = (SELECT GameSK FROM Game);
--DECLARE @winnerSK INT = (SELECT AccountSK FROM Account WHERE Username = 'Jordan');


BEGIN TRANSACTION
BEGIN TRY

    DECLARE @loserSK INT = (SELECT AccountSK FROM GameMember WHERE GameSK = @gameSK AND AccountSK != @winnerSK AND GameMemberType = 'Player');

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

    IF (@winnerSK = 0)
      SELECT 'Tie Game' AS winner
    ELSE
      SELECT Account.Username AS winner
      FROM Account
      WHERE AccountSK = @winnerSK

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
