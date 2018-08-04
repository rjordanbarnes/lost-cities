/*

  Returns the hands of the participants for the given game.


  @gameSK
  The game to return the Score piles for.

*/

--DECLARE @gameSK INT = 'B9018601-1305-4B4C-B803-C2FC5DAA997D';

SELECT Hand.HandSK, PlayerSK, Card.CardSK, Card.CardColor, Card.CardValue FROM Hand
INNER JOIN HandCard ON (Hand.HandSK = HandCard.HandSK)
INNER JOIN Card ON (Card.CardSK = HandCard.CardSK)
WHERE Hand.GameSK = @gameSK
ORDER BY HandSK, CardColor, CardValue
