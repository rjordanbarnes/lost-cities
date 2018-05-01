SELECT AccountSK AS accountSK,
       Username AS username,
       AvatarURL AS avatarURL
FROM Account WHERE AccountSK = @accountSK