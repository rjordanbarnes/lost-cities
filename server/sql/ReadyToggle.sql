-- Toggles the user's ready status

/*
  SELECT * FROM Users
  SELECT * FROM Participants
  SELECT * FROM Games
*/

--DECLARE @userId UNIQUEIDENTIFIER = '06BB6B61-17EC-4384-8ABF-526299C5AB0F';

-- Game that the user is in.
DECLARE @gameId UNIQUEIDENTIFIER = (SELECT Game FROM Participants WHERE [User] = @userId);

-- Game must be at lobby
IF ((SELECT State FROM Games WHERE GameId = @gameId) != 'Lobby')
  THROW 50001, 'Unable to ready up, game isn''t at lobby.', 1;

UPDATE Participants
SET IsReady = IsReady ^ 1
WHERE [User] = @userId

SELECT Username, @gameId AS currentGame
FROM Users
WHERE UserId = @userId