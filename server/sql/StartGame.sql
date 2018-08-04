/*

  Starts the game that the specified user is hosting.

  @accountSK
  The user that's starting the game. An AccountSK

*/

--DECLARE @accountSK INT = 'CB0964E8-BBF6-4A2D-934B-2790D81B0EEA';

BEGIN TRANSACTION
BEGIN TRY

  -- Game that the user is in.
  DECLARE @gameSK INT = (SELECT GameSK FROM GameMember WHERE AccountSK = @accountSK);

  -- Other user in the game.
  DECLARE @accountSK2 INT = (SELECT AccountSK FROM GameMember WHERE GameSK = @gameSK AND AccountSK <> @accountSK AND GameMemberType = 'Player');

  /*

    Validations

  */

  -- User must be in a game.
  IF (@gameSK IS NULL)
    THROW 50001, 'Unable to start game, user isn''t in a game.', 1;

  -- User must be host of a game.
  IF ((SELECT COUNT(*) FROM Game WHERE HostSK = @accountSK AND GameSK = @gameSK) < 1)
    THROW 50001, 'Unable to start game, user isn''t the host.', 1;

  -- There must be 2 ready players in the game.
  IF ((SELECT COUNT(*) FROM GameMember WHERE GameSK = @gameSK AND IsReady = 1) < 2)
    THROW 50001, 'Unable to start game, game doesn''t have at least two players that are ready.', 1;

  -- Game must be at lobby
  IF ((SELECT GameState FROM Game WHERE GameSK = @gameSK) != 'Lobby')
    THROW 50001, 'Unable to start game, game isn''t at lobby.', 1;

  -- Updates game and turn state
  UPDATE Game
  SET GameState = 'Gameplay', TurnState = 'Placing'
  WHERE GameSK = @gameSK

  -- Reset ready state for players.
  UPDATE GameMember
  SET IsReady = 0
  WHERE GameSK = @gameSK

  -- Host goes first.
  UPDATE GameMember
  SET IsTurn = 0
  WHERE GameSK = @gameSK

  UPDATE GameMember
  SET IsTurn = 1
  WHERE AccountSK = @accountSK AND GameSK = @gameSK



  ------- Creates deck -------
  INSERT INTO Deck(GameSK)
  VALUES (@gameSK)

  DECLARE @deckSK INT = SCOPE_IDENTITY();

  -- Randomly insert one of each card into the deck (60 cards)
  INSERT INTO DeckCard(CardSK, DeckSK)
  SELECT CardSK, @deckSK FROM Card
  ORDER BY NEWID()

  ----------------------------

  ------- Creates the 5 discard piles -------
  INSERT INTO DiscardPile (DiscardPileColor, GameSK)
  VALUES
    ('Color1', @gameSK),
    ('Color2', @gameSK),
    ('Color3', @gameSK),
    ('Color4', @gameSK),
    ('Color5', @gameSK)

  ----------------------------

  ------- Creates the 10 score piles -------
  DECLARE @gameMemberSK INT = (SELECT GameMemberSK FROM GameMember WHERE AccountSK = @accountSK);
  DECLARE @gameMemberSK2 INT = (SELECT GameMemberSK FROM GameMember WHERE AccountSK = @accountSK2);

  INSERT INTO ScorePile (ScorePileColor, PlayerSK, GameSK)
  VALUES
    ('Color1', @gameMemberSK, @gameSK),
    ('Color2', @gameMemberSK, @gameSK),
    ('Color3', @gameMemberSK, @gameSK),
    ('Color4', @gameMemberSK, @gameSK),
    ('Color5', @gameMemberSK, @gameSK),
    ('Color1', @gameMemberSK2, @gameSK),
    ('Color2', @gameMemberSK2, @gameSK),
    ('Color3', @gameMemberSK2, @gameSK),
    ('Color4', @gameMemberSK2, @gameSK),
    ('Color5', @gameMemberSK2, @gameSK)

  ----------------------------

  ------- Creates the player hands -------

  INSERT INTO Hand (PlayerSK, GameSK)
  VALUES (@gameMemberSK, @gameSK)

  DECLARE @handSK INT = SCOPE_IDENTITY();

  INSERT INTO Hand (PlayerSK, GameSK)
  VALUES (@gameMemberSK2, @gameSK)

  DECLARE @handSK2 INT = SCOPE_IDENTITY();
  ----------------------------

  ------- Draws 8 cards for each player -------

  INSERT INTO HandCard(CardSK, HandSK)
  SELECT TOP 8 CardSK, @handSK FROM DeckCard
  WHERE DeckSK = @deckSK
  ORDER BY DeckCardOrder DESC

  DELETE FROM DeckCard
  WHERE CardSK IN (SELECT CardSK FROM HandCard WHERE HandSK = @handSK) AND DeckSK = @deckSK

  INSERT INTO HandCard(CardSK, HandSK)
  SELECT TOP 8 CardSK, @handSK2 FROM DeckCard
  WHERE DeckSK = @deckSK
  ORDER BY DeckCardOrder DESC

  DELETE FROM DeckCard
  WHERE CardSK IN (SELECT CardSK FROM HandCard WHERE HandSK = @handSK2) AND DeckSK = @deckSK
  ----------------------------

  SELECT @gameSK AS gameSK

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
