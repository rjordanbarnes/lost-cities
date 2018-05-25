--DECLARE @googleID VARCHAR(128) = '123';
--DECLARE @avatarURL VARCHAR(2083) = ;
--DECLARE @googleUsername NVARCHAR(25) = ;

BEGIN TRANSACTION
BEGIN TRY

  -- If GoogleID isn't already in the Account table, create new account. Otherwise update the avatar.
  IF ((SELECT COUNT(*) FROM Account WHERE GoogleID = @googleID) = 0)
    INSERT INTO Account(GoogleID, Username, AvatarURL) VALUES (@googleID, @googleUsername, @avatarURL)
  ELSE
    UPDATE Account SET AvatarURL = @avatarURL WHERE GoogleID = @googleID

  -- Return Account info
  SELECT AccountSK AS accountSK,
         Username AS username,
         AvatarURL AS avatarURL
  FROM Account WHERE GoogleID=@googleID

END TRY
BEGIN CATCH
  DECLARE @error int,
          @message varchar(4000),
          @xstate int;
  
  SELECT
      @error = ERROR_NUMBER(),
      @message = ERROR_MESSAGE(),
      @xstate = XACT_STATE();

  ROLLBACK TRANSACTION;

  THROW @error, @message, @xstate;

END CATCH

IF @@TRANCOUNT > 0
  COMMIT TRANSACTION;