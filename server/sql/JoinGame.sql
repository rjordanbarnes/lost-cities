/*
  SELECT * FROM Users
  SELECT * FROM Participants
  SELECT * FROM Games
*/

--DECLARE @gameId UNIQUEIDENTIFIER = 'FEE6CCE8-5D42-40D9-A588-4D56C0382CF8';
--DECLARE @userId UNIQUEIDENTIFIER = '91110464-98CB-4438-ADFD-89881545DFA0';

IF ((SELECT COUNT(*) FROM Participants WHERE [User] = @userId AND Game != @gameId) > 0)
  THROW 50001, 'Unable to join a game, the user is already in another game.', 1;

IF ((SELECT COUNT(*) FROM Participants WHERE Game = @gameId AND Type = 'Player') >= 2)
  THROW 50001, 'Unable to join the game, the game is full.', 1;

UPDATE Participants
SET Type = 'Player', IsReady = 0
WHERE [User] = @userId

IF @@ROWCOUNT = 0
  INSERT INTO Participants([User], Game, Type)
  VALUES (@userId, @gameId, 'Player');