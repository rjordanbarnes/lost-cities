UPDATE Users
SET CurrentRoom = @roomId, IsPlayer = 1
WHERE UserId = @userId