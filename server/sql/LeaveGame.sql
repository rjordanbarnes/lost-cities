-- Removes the given participant from the game and returns the game they were in and whether they were the host.

/*
  SELECT * FROM Users
  SELECT * FROM Participants
  SELECT * FROM Games
*/

-- DECLARE @userId UNIQUEIDENTIFIER = '07481CB6-F48C-462F-8EE6-4D05C95E3D23';

IF ((SELECT COUNT(*) FROM Participants WHERE [User] = @userId) < 1)
  THROW 50001, 'Unable to leave, the user isn''t in a game.', 1;

SELECT Game AS currentGame,
       (SELECT COUNT(*) FROM Games WHERE Host = @userId) AS isHost
FROM Participants
WHERE [User] = @userId

DELETE FROM Participants
WHERE [User] = @userId