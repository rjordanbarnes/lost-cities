-- Removes the given participant from the game and returns the game they were in and whether the game is still active.

/*
  SELECT * FROM Users
  SELECT * FROM Participants
  SELECT * FROM Games
*/

--DECLARE @userId UNIQUEIDENTIFIER = '88E1B1EC-30AC-4F30-ADDA-C308930ED519';

-- Game that the user is in.
DECLARE @gameId UNIQUEIDENTIFIER = (SELECT Game FROM Participants WHERE [User] = @userId);

-- User must be in a game.
IF ((SELECT COUNT(*) FROM Participants WHERE [User] = @userId) < 1)
  THROW 50001, 'Unable to leave, the user isn''t in a game.', 1;

-- If user is host, shutdown the game.
IF ((SELECT COUNT(*) FROM Games WHERE Host = @userId AND GameId = @gameId) > 0)
  BEGIN
    DELETE DeckCards
    WHERE Deck IN (SELECT DeckId FROM Decks WHERE Game = @gameId)

    DELETE DiscardPileCards
    WHERE DiscardPile IN (SELECT DiscardPileId FROM DiscardPiles WHERE Game = @gameId)

    DELETE HandCards
    WHERE Hand IN (SELECT HandId FROM Hands WHERE Game = @gameId)

    DELETE ScorePileCards
    WHERE ScorePile IN (SELECT ScorePileId FROM ScorePiles WHERE Game = @gameId)

    DELETE FROM Decks
    WHERE Game = @gameId

    DELETE FROM DiscardPiles
    WHERE Game = @gameId

    DELETE FROM Hands
    WHERE Game = @gameId

    DELETE FROM ScorePiles
    WHERE Game = @gameId

    DELETE FROM Participants
    WHERE Game = @gameId

    DELETE FROM Games
    WHERE GameId = @gameId

    SELECT 1 AS [shutdown], @gameId AS currentGame
  END
-- If user is a player and the game isn't at the lobby, remove the player and return to lobby.
ELSE IF ((SELECT COUNT(*) FROM Participants WHERE [User] = @userId AND Type = 'Player') > 0 AND (SELECT State FROM Games WHERE GameId = @gameId) != 'Lobby')
  BEGIN
    UPDATE Games SET State = 'Lobby' WHERE GameId = @gameId

    DELETE DeckCards
    WHERE Deck IN (SELECT DeckId FROM Decks WHERE Game = @gameId)

    DELETE DiscardPileCards
    WHERE DiscardPile IN (SELECT DiscardPileId FROM DiscardPiles WHERE Game = @gameId)

    DELETE HandCards
    WHERE Hand IN (SELECT HandId FROM Hands WHERE Game = @gameId)

    DELETE ScorePileCards
    WHERE ScorePile IN (SELECT ScorePileId FROM ScorePiles WHERE Game = @gameId)

    DELETE FROM Decks
    WHERE Game = @gameId

    DELETE FROM DiscardPiles
    WHERE Game = @gameId

    DELETE FROM Hands
    WHERE Game = @gameId

    DELETE FROM ScorePiles
    WHERE Game = @gameId

    DELETE FROM Participants
    WHERE [User] = @userId

    SELECT @gameId AS currentGame
  END
-- Otherwise just remove player.
ELSE
  BEGIN
    DELETE FROM Participants
    WHERE [User] = @userId

    SELECT @gameId AS currentGame
  END
