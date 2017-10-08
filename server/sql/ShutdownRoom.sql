UPDATE Users
SET CurrentRoom = NULL, IsReady = 0
WHERE CurrentRoom = @roomId

UPDATE Rooms
SET IsActive = 0
WHERE RoomId = @roomId