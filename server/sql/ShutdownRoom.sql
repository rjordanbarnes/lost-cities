UPDATE Users
SET CurrentRoom = NULL
WHERE CurrentRoom = @roomId

UPDATE Rooms
SET IsActive = 0
WHERE RoomId = @roomId