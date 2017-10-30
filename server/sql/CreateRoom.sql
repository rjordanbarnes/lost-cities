-- Creates a new room and returns the new room's Id
DECLARE @newId UNIQUEIDENTIFIER
SET @newId = NEWID()

INSERT INTO Rooms (RoomId, RoomName, Password, IsActive)
VALUES (@newId, @roomName, NULLIF(@roomPassword, 'NULL'), 1)

UPDATE Users
SET CurrentRoom = @newId, IsPlayer = 1, IsHost = 1
WHERE UserId = @roomHostId

SELECT @newId AS roomId