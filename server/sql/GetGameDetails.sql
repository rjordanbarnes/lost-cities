-- Returns extended details about the given game and its participants.

/*
  SELECT * FROM Users
  SELECT * FROM Participants
  SELECT * FROM Games
*/

-- DECLARE @gameId UNIQUEIDENTIFIER = 'FEE6CCE8-5D42-40D9-A588-4D56C0382CF8';

SELECT Users.UserId AS userId,
       Participants.ParticipantId AS participantId,
       Users.Username AS username,
       Type AS type,
       (SELECT COUNT(Host) FROM Games WHERE Games.Host = Users.UserId) AS isHost,
       IsReady AS isReady,
       Games.Name AS gameName,
       (SELECT CASE WHEN LEN(Games.Password) > 0 THEN 1 ELSE 0 END FROM Games WHERE Games.GameId = @gameId) AS isPasswordProtected
FROM Participants
INNER JOIN Users ON (Users.UserId = Participants.[User])
INNER JOIN Games ON (Games.GameId = Participants.Game)
WHERE Participants.Game = @gameId
ORDER BY isHost DESC