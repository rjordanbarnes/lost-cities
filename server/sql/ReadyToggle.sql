-- Toggles the user's ready status

/*
  SELECT * FROM Users
  SELECT * FROM Participants
  SELECT * FROM Games
*/

-- DECLARE @userId UNIQUEIDENTIFIER = 'DFC21267-E8CC-47B3-AED5-E0065731E293';

UPDATE Participants
SET IsReady = IsReady ^ 1
WHERE [User] = @userId

SELECT Username, Participants.Game AS CurrentGame
FROM Users
INNER JOIN Participants ON (Users.UserId = Participants.[User])
WHERE UserId = @userId