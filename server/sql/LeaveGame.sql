-- Removes the given participant from the game and returns the game they were in and whether the game is still active.

/*
  SELECT * FROM Account
  SELECT * FROM GameMember
  SELECT * FROM Game
*/

--DECLARE @accountSK INT = '6A432575-6530-4A91-A7E8-5305C4730255';

BEGIN TRANSACTION
BEGIN TRY

  -- Game that the user is in.
  DECLARE @gameSK INT = (SELECT GameSK FROM GameMember WHERE AccountSK = @accountSK);

  -- User must be in a game.
  IF (@gameSK IS NULL)
    THROW 50001, 'Unable to leave, the user isn''t in a game.', 1;

  -- If user is host, shutdown the game.
  IF ((SELECT COUNT(*) FROM Game WHERE HostSK = @accountSK AND GameSK = @gameSK) > 0)
    BEGIN
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

      DELETE FROM GameMember
      WHERE GameSK = @gameSK

      DELETE FROM Game
      WHERE GameSK = @gameSK

      SELECT 1 AS [gameShutdown], @gameSK AS currentGame
    END

  -- If user is a player and the game isn't at the lobby, remove the player and return to lobby.
  ELSE IF ((SELECT COUNT(*) FROM GameMember WHERE AccountSK = @accountSK AND GameMemberType = 'Player') > 0 AND (SELECT GameState FROM Game WHERE GameSK = @gameSK) != 'Lobby')
    BEGIN
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

      DELETE FROM GameMember
      WHERE AccountSK = @accountSK

      SELECT @gameSK AS currentGame
    END

  -- Otherwise just remove player.
  ELSE
    BEGIN
      DELETE FROM GameMember
      WHERE AccountSK = @accountSK

      SELECT @gameSK AS currentGame
    END

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
