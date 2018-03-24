-- Returns extended details about the given game and its participants.
-- Only returns data if the given game member is in the game.

/*
  SELECT * FROM Account
  SELECT * FROM GameMember
  SELECT * FROM Game
*/

--DECLARE @gameSK UNIQUEIDENTIFIER =    'EA054501-82BC-41B6-8D8C-55463954390E';
--DECLARE @accountSK UNIQUEIDENTIFIER = '0';
--DECLARE @isServer BIT = 0;

IF (@isServer = 0 AND (SELECT COUNT(*) FROM GameMember WHERE GameSK = @gameSK AND AccountSK = @accountSK) < 1)
  THROW 50001, 'Unable to give game details, user isn''t in the game.', 1;

SELECT Account.AccountSK AS accountSK,
       GameMember.GameMemberSK AS gameMemberSK,
       Account.Username AS username,
       GameMember.GameMemberType AS gameMemberType,
       (SELECT COUNT(HostSK) FROM Game WHERE Game.HostSK = Account.AccountSK) AS isHost,
       GameMember.IsReady AS isReady,
       Game.GameName AS gameName,
       Game.GameState AS gameState,
       (SELECT CASE WHEN LEN(Game.GamePassword) > 0 THEN 1 ELSE 0 END FROM Game WHERE Game.GameSK = @gameSK) AS isPasswordProtected
FROM GameMember
INNER JOIN Account ON (Account.AccountSK = GameMember.AccountSK)
INNER JOIN Game ON (Game.GameSK = GameMember.GameSK)
WHERE GameMember.GameSK = @gameSK
ORDER BY isHost DESC