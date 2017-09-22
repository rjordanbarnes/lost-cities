INSERT INTO Rooms (RoomName, Password, IsActive)
VALUES ('The Best Room!', NULL, 1),
       ('Second is Good', 'secret', 1)

INSERT INTO Users (UserName, CurrentRoom, IsHost)
VALUES ('Jordan', (SELECT RoomID FROM Rooms WHERE RoomName='The Best Room!'), 0),
       ('Keysi', (SELECT RoomID FROM Rooms WHERE RoomName='The Best Room!'), 1),
       ('Joshua', (SELECT RoomID FROM Rooms WHERE RoomName='Second Is Good'), 1)

SELECT * FROM Users
SELECT * FROM Rooms