-- SELECT * FROM Participants
-- SELECT * FROM Games

--DECLARE @gameId UNIQUEIDENTIFIER = '195C06CA-DC62-4683-8CDC-F8466C93D7AE';

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