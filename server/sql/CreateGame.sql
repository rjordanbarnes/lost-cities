-- Creates a new game and returns the new game's Id

/*
  SELECT * FROM Users
  SELECT * FROM Participants
  SELECT * FROM Games
*/

--DECLARE @gameHostId UNIQUEIDENTIFIER = 'DFC21267-E8CC-47B3-AED5-E0065731E293';
--DECLARE @gameName NVARCHAR(32) = 'Game From Script';
--DECLARE @gamePassword NVARCHAR(32) = 'PasswordFromScript';

DECLARE @newGameId UNIQUEIDENTIFIER = NEWID();

IF ((SELECT COUNT(*) FROM Participants WHERE [User] = @gameHostId) > 0)
  THROW 50001, 'Unable to create a game, the user is already in a game.', 1;

INSERT INTO Games (GameId, Name, Password, Host, State)
VALUES (@newGameId, @gameName, NULLIF(@gamePassword, 'NULL'), @gameHostId, 'Lobby')

INSERT INTO Participants([User], Game, Type)
VALUES (@gameHostId, @newGameId, 'Player');

SELECT @newGameId AS gameId
