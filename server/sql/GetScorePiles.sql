/*

  Returns the score piles of the given game.


  @gameSK
  The game to return the Score piles for.

*/

--DECLARE @gameSK INT = 'E7B9B09F-F24C-4958-9955-57DFC87C5D6E';

SELECT ScorePile.ScorePileSK, ScorePile.ScorePileColor, GameMember.GameMemberSK, Card.CardSK, Card.CardColor, Card.CardValue FROM ScorePile
INNER JOIN GameMember ON (GameMember.GameMemberSK = ScorePile.PlayerSK)
LEFT OUTER JOIN ScorePileCard ON (ScorePile.ScorePileSK = ScorePileCard.ScorePileSK)
LEFT OUTER JOIN Card ON (ScorePileCard.CardSK = Card.CardSK)
WHERE ScorePile.GameSK = @gameSK
ORDER BY GameMemberSK, ScorePileColor ASC, CardValue ASC
