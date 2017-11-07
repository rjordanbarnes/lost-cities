/*
  SELECT * FROM Users
  SELECT * FROM Participants
  SELECT * FROM Games
*/

--DECLARE @gameId UNIQUEIDENTIFIER = '900989FB-9F17-4AF9-8D42-126795622AE5';
--DECLARE @userId UNIQUEIDENTIFIER = '91110464-98CB-4438-ADFD-89881545DFA0';
--DECLARE @password NVARCHAR(128) = 'testerrr';

IF ((SELECT COUNT(*) FROM Participants WHERE [User] = @userId AND Game != @gameId) > 0)
  THROW 50001, 'Unable to join a game, the user is already in another game.', 1;

IF ((SELECT COUNT(*) FROM Participants WHERE Game = @gameId AND Type = 'Player') >= 2)
  THROW 50001, 'Unable to join the game, the game is full.', 1;

-- Fail if the password is incorrect and the user isn't already in the game.
IF ((SELECT Password FROM Games WHERE GameId = @gameId) != @password AND (SELECT COUNT(*) FROM Participants WHERE Game = @gameId AND [User] = @userId) < 1)
  THROW 50001, 'Unable to join the game, wrong password.', 1;

UPDATE Participants
SET Type = 'Player', IsReady = 0
WHERE [User] = @userId

IF @@ROWCOUNT = 0
  INSERT INTO Participants([User], Game, Type)
  VALUES (@userId, @gameId, 'Player');