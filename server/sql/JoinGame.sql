/*
  SELECT * FROM Users
  SELECT * FROM Participants
  SELECT * FROM Games
*/

--DECLARE @gameId UNIQUEIDENTIFIER = '900989FB-9F17-4AF9-8D42-126795622AE5';
--DECLARE @userId UNIQUEIDENTIFIER = '91110464-98CB-4438-ADFD-89881545DFA0';
--DECLARE @password NVARCHAR(128) = 'testerrr';
--DECLARE @userType = 'Player'

DECLARE @gamePassword NVARCHAR(128) = (SELECT Password FROM Games WHERE GameId = @gameId);
-- Whether the supplied user is already in the supplied game.
DECLARE @userInGame BIT = (SELECT COUNT(*) FROM Participants WHERE Game = @gameId AND [User] = @userId)

IF ((SELECT COUNT(*) FROM Participants WHERE [User] = @userId AND Game != @gameId) > 0)
  THROW 50001, 'Unable to join the game, the user is already in another game.', 1;

IF (@userType = 'Player' AND (SELECT COUNT(*) FROM Participants WHERE Game = @gameId AND Type = 'Player') >= 2)
  THROW 50001, 'Unable to join the game as player, the game is full.', 1;

-- Fail if password isn't supplied but the game has a password.
IF (@password IS NULL AND @gamePassword IS NOT NULL AND @userInGame != 1)
  THROW 50001, 'Unable to spectate the game, password not supplied.', 1;

-- Fail if the password is incorrect and the user isn't already in the game.
IF (@gamePassword != @password AND @userInGame != 1)
  THROW 50001, 'Unable to spectate the game, wrong password.', 1;

UPDATE Participants
SET Type = @userType, IsReady = 0
WHERE [User] = @userId

IF @@ROWCOUNT = 0
  INSERT INTO Participants([User], Game, Type)
  VALUES (@userId, @gameId, @userType);