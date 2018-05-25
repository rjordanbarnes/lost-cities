-- Creates a new game and returns the new game's Id

/*
  SELECT * FROM Account
  SELECT * FROM GameMember
  SELECT * FROM Game
*/

--DECLARE @gameHostSK UNIQUEIDENTIFIER = 'CB0964E8-BBF6-4A2D-934B-2790D81B0EEA';
--DECLARE @gameName NVARCHAR(32) = 'Game From Script';
--DECLARE @gamePassword NVARCHAR(32) = 'PasswordFromScript';

BEGIN TRANSACTION
BEGIN TRY

  DECLARE @newGameSK UNIQUEIDENTIFIER = NEWID();

  IF ((SELECT COUNT(*) FROM GameMember WHERE AccountSK = @gameHostSK) > 0)
    THROW 50001, 'Unable to create a game, the user is already in a game.', 1;

  INSERT INTO Game (GameSK, GameName, GamePassword, HostSK, GameState, TurnState)
  VALUES (@newGameSK, @gameName, NULLIF(@gamePassword, 'NULL'), @gameHostSK, 'Lobby', 'Placing')

  INSERT INTO GameMember(AccountSK, GameSK, GameMemberType)
  VALUES (@gameHostSK, @newGameSK, 'Player');

  SELECT @newGameSK AS gameSK

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