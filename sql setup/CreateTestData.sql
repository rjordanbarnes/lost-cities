INSERT INTO Rooms (RoomName, Password, CreationDate, IsActive)
VALUES ('The Newest Room', NULL, DEFAULT, 1),
       ('The Oldest', 'secret', '2017-09-21 11:45:37.200', 1),
       ('Middle Room', NULL, '2017-09-21 16:45:37.200', 1),
       ('Inactive Room', NULL, '2017-09-22 12:45:37.200', 0)

INSERT INTO Users (Username, CurrentRoom, IsHost)
VALUES ('Jordan', (SELECT RoomID FROM Rooms WHERE RoomName='The Newest Room'), 0),
       ('Keysi', (SELECT RoomID FROM Rooms WHERE RoomName='The Newest Room'), 1),
       ('Joshua', (SELECT RoomID FROM Rooms WHERE RoomName='The Oldest'), 1),
       ('Timmy', (SELECT RoomID FROM Rooms WHERE RoomName='Middle Room'), 1),
       ('Rini', NULL, 0),
       ('Salem', NULL, 0)

SELECT * FROM Users
SELECT * FROM Rooms