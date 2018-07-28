select Username, GameMemberType, Card.CardColor, Card.CardValue, Card.CardSK, Account.AccountSK
from GameMember
inner join Account on (GameMember.AccountSK = Account.AccountSK)
inner join Game on (Game.GameSK = GameMember.GameSK)
inner join Hand on (Hand.GameSK = Game.GameSK)
inner join HandCard on (HandCard.HandSK = Hand.HandSK)
inner join Card on (Card.CardSK = HandCard.CardSK)
WHERE (Hand.PlayerSK = GameMember.GameMemberSK)
ORDER BY Account.Username, CardColor, CardValue

select CardValue, CardColor, DeckCardOrder, Deck.DeckSK
from Deck
inner join DeckCard ON (Deck.DeckSK = DeckCard.DeckSK)
inner join Card ON (DeckCard.CardSK = Card.CardSK)
ORDER BY DeckCardOrder DESC

SELECT Username, Card.CardValue, ScorePileColor, ScorePile.ScorePileSK
FROM ScorePile
inner join GameMember ON (ScorePile.PlayerSK = GameMember.GameMemberSK)
inner join Account ON (Account.AccountSK = GameMember.AccountSK)
left outer JOIN ScorePileCard ON (ScorePile.ScorePileSK = ScorePileCard.ScorePileSK)
left outer join Card ON (Card.CardSK = ScorePileCard.CardSK)
ORDER BY Username, ScorePileColor, CardValue

SELECT DiscardPileColor, DiscardPile.DiscardPileSK, Card.CardValue, DiscardPileCard.DiscardPileCardOrder
FROM DiscardPile
inner join Game ON (DiscardPile.GameSK = Game.GameSK)
left outer JOIN DiscardPileCard ON (DiscardPile.DiscardPileSK = DiscardPileCard.DiscardPileSK)
left outer join Card ON (Card.CardSK = DiscardPileCard.CardSK)
ORDER BY DiscardPileColor, DiscardPileCardOrder DESC