UPDATE Users
SET CurrentRoom = @roomId, IsPlayer = 0
WHERE UserId = @userId