SELECT Username, CurrentRoom, IsHost FROM Users
WHERE UserId = @userId

UPDATE Users
SET CurrentRoom = NULL, IsPlayer = 0, IsHost = 0, IsReady = 0
WHERE UserId = @userId