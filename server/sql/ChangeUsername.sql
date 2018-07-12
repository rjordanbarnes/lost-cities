--DECLARE @accountSK INT = '1AC302DA-97C4-466A-A585-CF89159D9E65';
--DECLARE @newUsername VARCHAR(25) = 'Jordan';

BEGIN TRANSACTION
BEGIN TRY

  DECLARE @oldUsername VARCHAR(25) = (SELECT Username FROM Account WHERE AccountSK = @accountSK);

  UPDATE Account
  SET Username = @newUsername
  WHERE AccountSK = @accountSK

  -- Return Account info
  SELECT AccountSK AS accountSK,
         Username AS newUsername,
         @oldUsername AS oldUsername
  FROM Account WHERE accountSK = @accountSK

END TRY
BEGIN CATCH
  DECLARE @error int,
          @message varchar(4000),
          @xstate int;

  SELECT
      @error = 50000,
      @message = ERROR_MESSAGE(),
      @xstate = XACT_STATE();

  ROLLBACK TRANSACTION;

  THROW @error, @message, @xstate;

END CATCH

IF @@TRANCOUNT > 0
  COMMIT TRANSACTION;
