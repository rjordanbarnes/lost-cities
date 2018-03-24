--DECLARE @username NVARCHAR(128) = 'Jordan';

SELECT AccountSK AS accountSK, Username AS username FROM Account WHERE Username=@username