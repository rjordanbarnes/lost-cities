SELECT Username, CurrentRoom, IsHost FROM Users
WHERE UserId = @userId

UPDATE Users
SET CurrentRoom = NULL, IsHost = 0, IsReady = 0
WHERE UserId = @userId