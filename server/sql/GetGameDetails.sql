-- Returns extended details about the given game and its participants.
-- Only returns data if the given user is in the game.

/*
  SELECT * FROM Users
  SELECT * FROM Participants
  SELECT * FROM Games
*/

--DECLARE @gameId UNIQUEIDENTIFIER = '70039E39-89E7-4746-8DC4-020773C7ACE9';
--DECLARE @userId UNIQUEIDENTIFIER = '91110464-98CB-4438-ADFD-89881545DFA0';

IF ((SELECT COUNT(*) FROM Participants WHERE Game = @gameId AND [User] = @userId) < 1)
  THROW 50001, 'Unable to give game details, user isn''t in the game.', 1;

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