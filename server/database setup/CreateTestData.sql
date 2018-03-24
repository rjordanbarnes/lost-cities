USE LostCities

INSERT INTO Game (GameName, GamePassword, GameState, CreationDate)
VALUES ('The Newest Game', NULL, 'Lobby', DEFAULT),
       ('The Oldest', 'secret', 'Lobby', '2017-09-21 11:45:37.200'),
       ('Middle Game', NULL, 'Lobby', '2017-09-21 16:45:37.200'),
       ('Inactive Game', NULL, 'Lobby', '2017-09-22 12:45:37.200')

INSERT INTO Users (Username, CurrentRoom, IsPlayer, IsHost)
VALUES ('Jordan', (SELECT RoomID FROM Rooms WHERE RoomName='The Newest Game'), 1, 0),
       ('Keysi', (SELECT RoomID FROM Rooms WHERE RoomName='The Newest Game'), 1, 1),
       ('Joshua', (SELECT RoomID FROM Rooms WHERE RoomName='The Oldest'), 1, 1),
       ('Timmy', (SELECT RoomID FROM Rooms WHERE RoomName='Middle Game'), 1, 1),
       ('Rini', NULL, 0, 0),
       ('Salem', NULL, 0, 0)

SELECT * FROM Users
SELECT * FROM Rooms ORDER BY CreationDate DESC
