-- Room IDs, Room Names, Room Host, UserCount, IsPasswordProtected
SELECT rm1.RoomID,
       rm1.RoomName,
       Users.UserName AS Host,
       (SELECT COUNT(UserName) FROM Users
         INNER JOIN Rooms rm2 ON (Users.CurrentRoom = rm2.RoomID)
         WHERE rm1.RoomID = rm2.RoomID) AS UserCount,
       (SELECT CASE WHEN LEN(rm3.Password) > 0 THEN 'true' ELSE 'false' END FROM Rooms rm3
         WHERE rm3.RoomID = rm1.RoomID) AS IsPasswordProtected
FROM Users 
INNER JOIN Rooms rm1 ON (Users.CurrentRoom = rm1.RoomID)
WHERE IsActive = 1 AND IsHost = 1