-- Room IDs, Room Names, Room Host, UserCount, IsPasswordProtected
SELECT rm1.RoomID AS roomID,
       rm1.RoomName AS roomName,
       Users.UserName AS roomHost,
       (SELECT COUNT(UserName) FROM Users
         INNER JOIN Rooms rm2 ON (Users.CurrentRoom = rm2.RoomID)
         WHERE rm1.RoomID = rm2.RoomID) AS roomUserCount,
       (SELECT CASE WHEN LEN(rm3.Password) > 0 THEN 1 ELSE 0 END FROM Rooms rm3
         WHERE rm3.RoomID = rm1.RoomID) AS isPasswordProtected
FROM Users 
INNER JOIN Rooms rm1 ON (Users.CurrentRoom = rm1.RoomID)
WHERE IsActive = 1 AND IsHost = 1