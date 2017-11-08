/*
  SELECT * FROM Users
  SELECT * FROM Participants
  SELECT * FROM Games
*/

--DECLARE @gameId UNIQUEIDENTIFIER = '74E18D50-5AB2-4DCC-8DE1-22F9F956ED18';
--DECLARE @userId UNIQUEIDENTIFIER = '07481CB6-F48C-462F-8EE6-4D05C95E3D23';
--DECLARE @password NVARCHAR(128) = 'testerrr';

IF ((SELECT COUNT(*) FROM Participants WHERE [User] = @userId AND Game != @gameId) > 0)
  THROW 50001, 'Unable to spectate a game, the user is already in another game.', 1;

-- Fail if the password is incorrect and the user isn't already in the game.
IF ((SELECT Password FROM Games WHERE GameId = @gameId) != @password AND (SELECT COUNT(*) FROM Participants WHERE Game = @gameId AND [User] = @userId) < 1)
  THROW 50001, 'Unable to join the game, wrong password.', 1;

UPDATE Participants
SET Type = 'Spectator', IsReady = 0
WHERE [User] = @userId

IF @@ROWCOUNT = 0
  INSERT INTO Participants([User], Game, Type)
  VALUES (@userId, @gameId, 'Spectator');