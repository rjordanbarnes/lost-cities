-- Game Ids, Game Names, Game Host Name, UserCount, IsPasswordProtected
SELECT gm1.GameSK AS gameSK,
       gm1.GameName AS gameName,
       (SELECT Username FROM Account WHERE AccountSK = gm1.HostSK) AS gameHost,
       (SELECT COUNT(*) FROM GameMember
         INNER JOIN Game gm2 ON (GameMember.GameSK = gm2.GameSK)
         WHERE gm1.GameSK = gm2.GameSK AND GameMember.GameMemberType = 'Player') AS gamePlayerCount,
       (SELECT CASE WHEN LEN(gm3.GamePassword) > 0 THEN 1 ELSE 0 END FROM Game gm3
         WHERE gm3.GameSK = gm1.GameSK) AS isPasswordProtected
FROM GameMember
INNER JOIN Game gm1 ON (GameMember.GameSK = gm1.GameSK)
WHERE gm1.HostSK = GameMember.AccountSK
ORDER BY gm1.CreationDate DESC
