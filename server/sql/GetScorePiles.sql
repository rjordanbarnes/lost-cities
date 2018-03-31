/*
  
  Returns the score piles of the given game.


  @gameSK
  The game to return the Score piles for.

*/

--DECLARE @gameSK UNIQUEIDENTIFIER = 'B9018601-1305-4B4C-B803-C2FC5DAA997D';

SELECT ScorePile.ScorePileSK, ScorePile.ScorePileColor, GameMember.GameMemberSK, Card.CardSK, Card.CardColor, Card.CardValue FROM ScorePile
INNER JOIN GameMember ON (GameMember.GameMemberSK = ScorePile.PlayerSK)
LEFT OUTER JOIN ScorePileCard ON (ScorePile.ScorePileSK = ScorePileCard.ScorePileSK)
LEFT OUTER JOIN Card ON (ScorePileCard.CardSK = Card.CardSK)
WHERE ScorePile.GameSK = @gameSK
ORDER BY GameMemberSK, ScorePileColor ASC, CardValue ASC