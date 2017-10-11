-- Toggles the user's ready status
UPDATE Users
SET IsReady = IsReady ^ 1
WHERE UserId = @userId

SELECT Username, CurrentRoom FROM Users
WHERE UserId = @userId