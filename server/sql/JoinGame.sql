/*
  SELECT * FROM Account
  SELECT * FROM GameMember
  SELECT * FROM Game
*/

--DECLARE @gameSK UNIQUEIDENTIFIER = '331F0821-CA22-4049-A644-ED5489F8E8D9';
--DECLARE @accountSK UNIQUEIDENTIFIER = '6A432575-6530-4A91-A7E8-5305C4730255';
--DECLARE @password NVARCHAR(128) = 'PasswordFromScript';
--DECLARE @gameMemberType NVARCHAR(128) = 'Player';

BEGIN TRANSACTION
BEGIN TRY

  DECLARE @gamePassword NVARCHAR(128) = (SELECT GamePassword FROM Game WHERE GameSK = @gameSK);
  -- Whether the supplied user is already in the supplied game.
  DECLARE @userInGame BIT = (SELECT COUNT(*) FROM GameMember WHERE GameSK = @gameSK AND AccountSK = @accountSK)

  -- User must not already be in another game.
  IF ((SELECT COUNT(*) FROM GameMember WHERE AccountSK = @accountSK AND GameSK != @gameSK) > 0)
    THROW 50001, 'Unable to join the game, the user is already in another game.', 1;

  -- Game must not be full if joining as player.
  IF (@gameMemberType = 'Player' AND (SELECT COUNT(*) FROM GameMember WHERE GameSK = @gameSK AND GameMemberType = 'Player') >= 2)
    THROW 50001, 'Unable to join the game as player, the game is full.', 1;

  -- Password must be supplied if the user isn't in the game yet.
  IF (@password IS NULL AND @gamePassword IS NOT NULL AND @userInGame != 1)
    THROW 50001, 'Unable to join the game, password not supplied.', 1;

  -- Password must be correct if the user isn't in the game yet.
  IF (@gamePassword != @password AND @userInGame != 1)
    THROW 50001, 'Unable to join the game, wrong password.', 1;

  -- Game must be at lobby if user is already in the game.
  IF (@userInGame = 1 AND (SELECT GameState FROM Game WHERE GameSK = @gameSK) != 'Lobby')
    THROW 50001, 'Unable to change game member type while game isn''t at lobby.', 1;

  UPDATE GameMember
  SET GameMemberType = @gameMemberType, IsReady = 0
  WHERE AccountSK = @accountSK

  IF @@ROWCOUNT = 0
    INSERT INTO GameMember(AccountSK, GameSK, GameMemberType)
    VALUES (@accountSK, @gameSK, @gameMemberType);

END TRY
BEGIN CATCH
  DECLARE @error int,
          @message varchar(4000),
          @xstate int;
  
  SELECT
      @error = ERROR_NUMBER(),
      @message = ERROR_MESSAGE(),
      @xstate = XACT_STATE();

  ROLLBACK TRANSACTION;

  THROW @error, @message, @xstate;

END CATCH

IF @@TRANCOUNT > 0
  COMMIT TRANSACTION;