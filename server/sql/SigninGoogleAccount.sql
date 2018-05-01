--DECLARE @googleID VARCHAR(128) = '123';
--DECLARE @avatarURL VARCHAR(2083) = ;
--DECLARE @googleUsername NVARCHAR(25) = ;

-- If GoogleID isn't already in the Account table, create new account.
IF ((SELECT COUNT(*) FROM Account WHERE GoogleID = @googleID) = 0)
  INSERT INTO Account(GoogleID, Username, AvatarURL) VALUES (@googleID, @googleUsername, @avatarURL)

-- Return Account info
SELECT AccountSK AS accountSK, Username AS username FROM Account WHERE GoogleID=@googleID