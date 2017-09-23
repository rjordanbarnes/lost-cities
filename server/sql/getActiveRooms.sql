-- Room Ids, Room Names, Room Host, UserCount, IsPasswordProtected
SELECT rm1.RoomId AS roomId,
       rm1.RoomName AS roomName,
       Users.UserName AS roomHost,
       (SELECT COUNT(UserName) FROM Users
         INNER JOIN Rooms rm2 ON (Users.CurrentRoom = rm2.RoomId)
         WHERE rm1.RoomId = rm2.RoomId) AS roomUserCount,
       (SELECT CASE WHEN LEN(rm3.Password) > 0 THEN 1 ELSE 0 END FROM Rooms rm3
         WHERE rm3.RoomId = rm1.RoomId) AS isPasswordProtected
FROM Users 
INNER JOIN Rooms rm1 ON (Users.CurrentRoom = rm1.RoomId)
WHERE IsActive = 1 AND IsHost = 1
ORDER BY rm1.CreationDate DESC