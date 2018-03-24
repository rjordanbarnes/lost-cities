-- Toggles the user's ready status

/*
  SELECT * FROM Account
  SELECT * FROM GameMember
  SELECT * FROM Game
*/

--DECLARE @accountSK UNIQUEIDENTIFIER = '6A432575-6530-4A91-A7E8-5305C4730255';

-- Game that the user is in.
DECLARE @gameSK UNIQUEIDENTIFIER = (SELECT GameSK FROM GameMember WHERE AccountSK = @accountSK);

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

SELECT Username, @gameSK AS currentGame
FROM Account
WHERE AccountSK = @accountSK