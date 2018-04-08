-- Returns extended details about the given game and its participants.
-- Only returns data if the given game member is in the game.

/*
  SELECT * FROM Account
  SELECT * FROM GameMember
  SELECT * FROM Game
*/

--DECLARE @gameSK UNIQUEIDENTIFIER = '487549E8-5CD6-44AB-8B57-DCD290FA72E6';

SELECT Account.AccountSK AS accountSK,
       GameMember.GameMemberSK AS gameMemberSK,
       Account.Username AS username,
       Account.SkillRating AS skillRating,
       GameMember.GameMemberType AS gameMemberType,
       (SELECT COUNT(HostSK) FROM Game WHERE Game.HostSK = Account.AccountSK) AS isHost,
       GameMember.IsReady AS isReady,
       GameMember.IsTurn AS isTurn,
       Game.GameName AS gameName,
       Game.GameState AS gameState,
       Game.TurnState AS turnState,
       (SELECT CASE WHEN LEN(Game.GamePassword) > 0 THEN 1 ELSE 0 END FROM Game WHERE Game.GameSK = @gameSK) AS isPasswordProtected,
       (SELECT COUNT(*) FROM DeckCard INNER JOIN Deck ON (Deck.DeckSK = DeckCard.DeckSK) WHERE Deck.GameSK = @gameSK) AS deckSize,
       Deck.DeckSK AS deckSK
FROM GameMember
INNER JOIN Account ON (Account.AccountSK = GameMember.AccountSK)
INNER JOIN Game ON (Game.GameSK = GameMember.GameSK)
LEFT OUTER JOIN Deck ON (Game.GameSK = Deck.GameSK)
WHERE GameMember.GameSK = @gameSK
ORDER BY isHost DESC