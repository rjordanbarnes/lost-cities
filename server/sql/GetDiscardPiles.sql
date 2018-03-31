/*
  
  Returns the discard piles of the given game.


  @gameSK
  The game to return the discard piles for.

*/

--DECLARE @gameSK UNIQUEIDENTIFIER = 'B9018601-1305-4B4C-B803-C2FC5DAA997D';

SELECT DiscardPile.DiscardPileSK, DiscardPileColor, DiscardPileCardOrder, Card.CardSK, Card.CardColor, Card.CardValue FROM DiscardPile
LEFT OUTER JOIN DiscardPileCard ON (DiscardPile.DiscardPileSK = DiscardPileCard.DiscardPileSK)
LEFT OUTER JOIN Card ON (DiscardPileCard.CardSK = Card.CardSK)
WHERE DiscardPile.GameSK = @gameSK
ORDER BY DiscardPileColor ASC, DiscardPileCardOrder ASC