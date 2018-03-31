/*
  
  Returns the discard piles of the given game.


  @gameSK
  The game to return the discard piles for.

*/

--DECLARE @gameSK UNIQUEIDENTIFIER = 'A57BBADF-0D62-4630-8752-5FCD8521E1E6';

SELECT DiscardPile.DiscardPileSK, DiscardPileColor, DiscardPileCardOrder, Card.CardSK, Card.CardColor, Card.CardValue FROM DiscardPile
LEFT OUTER JOIN DiscardPileCard ON (DiscardPile.DiscardPileSK = DiscardPileCard.DiscardPileSK)
LEFT OUTER JOIN Card ON (DiscardPileCard.CardSK = Card.CardSK)
ORDER BY DiscardPileColor ASC, DiscardPileCardOrder DESC