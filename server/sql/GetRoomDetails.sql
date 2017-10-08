SELECT UserId AS userId,
       Username AS username,
       IsHost AS isHost,
       IsReady AS isReady,
       rm1.RoomId AS roomId,
       rm1.RoomName AS roomName,
       (SELECT CASE WHEN LEN(rm2.Password) > 0 THEN 1 ELSE 0 END FROM Rooms rm2
         WHERE rm1.RoomId = rm2.RoomId) AS isPasswordProtected
FROM Users
INNER JOIN Rooms rm1 ON (Users.CurrentRoom = rm1.RoomId)
WHERE Users.CurrentRoom = @roomId
ORDER BY isHost DESC