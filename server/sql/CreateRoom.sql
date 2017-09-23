DECLARE @newID UNIQUEIDENTIFIER
SET @newID = NEWID()

INSERT INTO Rooms (RoomID, RoomName, Password, IsActive)
VALUES (@newID, @roomName, NULLIF(@roomPassword, 'NULL'), 1)

UPDATE Users
SET CurrentRoom = @newID, IsHost = 1
WHERE UserID = @roomHostID

SELECT @newID AS roomId