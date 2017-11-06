-- Game Ids, Game Names, Game Host Name, UserCount, IsPasswordProtected
SELECT gm1.GameId AS gameId,
       gm1.Name AS gameName,
       (SELECT Username FROM Users WHERE UserId = gm1.Host) AS gameHost,
       (SELECT COUNT(*) FROM Participants
         INNER JOIN Games gm2 ON (Participants.Game = gm2.GameId)
         WHERE gm1.GameId = gm2.GameId AND Participants.Type = 'Player') AS gamePlayerCount,
       (SELECT CASE WHEN LEN(gm3.Password) > 0 THEN 1 ELSE 0 END FROM Games gm3
         WHERE gm3.GameId = gm1.GameId) AS isPasswordProtected
FROM Participants
INNER JOIN Games gm1 ON (Participants.Game = gm1.GameId)
WHERE gm1.Host = Participants.[User]
ORDER BY gm1.CreationDate DESC
