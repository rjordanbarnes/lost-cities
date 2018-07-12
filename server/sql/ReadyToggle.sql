-- Toggles the user's ready status

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
    THROW 50001, 'Unable to ready up, the user isn''t in a game.', 1;

  -- Game must be at lobby
  IF ((SELECT GameState FROM Game WHERE GameSK = @gameSK) != 'Lobby')
    THROW 50001, 'Unable to ready up, game isn''t at lobby.', 1;

  -- User must be a player.
  IF ((SELECT COUNT(*) FROM GameMember WHERE AccountSK = @accountSK AND GameSK = @gameSK AND GameMemberType = 'Player') < 1)
    THROW 50001, 'Unable to ready up, user isn''t a player.', 1;

  UPDATE GameMember
  SET IsReady = IsReady ^ 1
  WHERE AccountSK = @accountSK

  SELECT @gameSK AS currentGame
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
