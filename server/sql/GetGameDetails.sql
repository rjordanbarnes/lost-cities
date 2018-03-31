-- Returns extended details about the given game and its participants.
-- Only returns data if the given game member is in the game.

/*
  SELECT * FROM Account
  SELECT * FROM GameMember
  SELECT * FROM Game
*/

--DECLARE @gameSK UNIQUEIDENTIFIER = '532F6203-9F70-48FF-886F-4FC8D6E5A08E';

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