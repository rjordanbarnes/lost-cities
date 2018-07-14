/*

  Returns the score piles of the given game.


  @gameSK
  The game to return the Score piles for.

*/

--DECLARE @gameSK INT = (SELECT GameSK FROM Game);

SELECT ScorePile.ScorePileSK, ScorePile.ScorePileColor, GameMember.GameMemberSK, Card.CardSK, Card.CardColor, Card.CardValue FROM ScorePile
INNER JOIN GameMember ON (GameMember.GameMemberSK = ScorePile.PlayerSK)
LEFT OUTER JOIN ScorePileCard ON (ScorePile.ScorePileSK = ScorePileCard.ScorePileSK)
LEFT OUTER JOIN Card ON (ScorePileCard.CardSK = Card.CardSK)
WHERE ScorePile.GameSK = @gameSK
ORDER BY GameMemberSK, ScorePileColor ASC, CardValue ASC
