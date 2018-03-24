-- Creates a new game and returns the new game's Id

/*
  SELECT * FROM Account
  SELECT * FROM GameMember
  SELECT * FROM Game
*/

--DECLARE @gameHostSK UNIQUEIDENTIFIER = 'CB0964E8-BBF6-4A2D-934B-2790D81B0EEA';
--DECLARE @gameName NVARCHAR(32) = 'Game From Script';
--DECLARE @gamePassword NVARCHAR(32) = 'PasswordFromScript';

DECLARE @newGameSK UNIQUEIDENTIFIER = NEWID();

IF ((SELECT COUNT(*) FROM GameMember WHERE AccountSK = @gameHostSK) > 0)
  THROW 50001, 'Unable to create a game, the user is already in a game.', 1;

INSERT INTO Game (GameSK, GameName, GamePassword, HostSK, GameState)
VALUES (@newGameSK, @gameName, NULLIF(@gamePassword, 'NULL'), @gameHostSK, 'Lobby')

INSERT INTO GameMember(AccountSK, GameSK, GameMemberType)
VALUES (@gameHostSK, @newGameSK, 'Player');

SELECT @newGameSK AS gameSK
