<template>
    <div id="game-play" class="container">
        <div v-if="error">Error</div>
        <div v-if="gameDetails">
            <div class="row">
                <div class="col-2">
                    <Scoreboard :game-details="gameDetails" :player="player" :opponent="opponent" />
                    <deck class="m-auto" :sk="gameDetails.deckSK" :deck-size="gameDetails.deckSize" />
                </div>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.color1" :opponent-score-pile="opponent.scorePiles.color1" :discard-pile="gameDetails.discardPiles.color1" color="color1"></BoardColumn>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.color2" :opponent-score-pile="opponent.scorePiles.color2" :discard-pile="gameDetails.discardPiles.color2" color="color2"></BoardColumn>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.color3" :opponent-score-pile="opponent.scorePiles.color3" :discard-pile="gameDetails.discardPiles.color3" color="color3"></BoardColumn>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.color4" :opponent-score-pile="opponent.scorePiles.color4" :discard-pile="gameDetails.discardPiles.color4" color="color4"></BoardColumn>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.color5" :opponent-score-pile="opponent.scorePiles.color5" :discard-pile="gameDetails.discardPiles.color5" color="color5"></BoardColumn>
                <chat-box class="col-3" />
            </div>
            <div class="row my-2">
                <hand class="offset-2" :hand="playerHand" v-if="playerHand.length > 0"></hand>
            </div>

        </div>
    </div>
</template>

<script>
    import { GameplayEventBus } from '../../events/GameplayEventBus.js'
    import ChatBox from '@/components/ChatBox'
    import BoardColumn from '@/components/Gameplay/BoardColumn'
    import Hand from '@/components/Gameplay/Hand'
    import Deck from '@/components/Gameplay/Deck'
    import Scoreboard from '@/components/Gameplay/Scoreboard'

    export default {
        name: "Gameplay",
        props: ['gameDetails', 'player', 'opponent'],
        data() {
            return {
                error: null,
                selectedCard: null,
                selectedPlaceLocation: null,
                selectedDrawLocation: null,
                playerHand: []
            }
        },
        mounted() {
            const self = this;

            // Resets the event bus.
            GameplayEventBus.$off();

            GameplayEventBus.$on('card-clicked', function(card) {
                let cardInHand = false;
                for (let i = 0; i < self.playerHand.length; i++) {
                    if (self.playerHand[i].CardSK === card.card.CardSK) {
                        cardInHand = true;
                        break;
                    }
                }

                if (cardInHand && self.player.isTurn && self.gameDetails.turnState === 'Placing') {
                    // If it's the player's turn and it's the placing phase, select the card in hand.
                    if (self.selectedCard !== null)
                        self.selectedCard.toggleIsSelected();

                    self.selectedCard = card;
                    card.toggleIsSelected();
                }
            });

            GameplayEventBus.$on('score-pile-clicked', function(scorePile) {
                // Handles clicking on a score pile when placing a card.
                if (self.player.isTurn && self.gameDetails.turnState === 'Placing' && self.selectedCard !== null && scorePile.color === self.selectedCard.card.CardColor) {
                    self.selectedPlaceLocation = scorePile.sk;
                    self.$socket.emit('gamePlaceCard', {placedCardSK: self.selectedCard.card.CardSK, placedCardLocationType: 'ScorePile', placedCardLocationSK: self.selectedPlaceLocation});
                    self.selectedCard.toggleIsSelected();

                    // Adds the card to the score pile immediately to reduce perceived latency.
                    const scorePileCards = self.player.scorePiles[scorePile.color][scorePile.sk];
                    if (scorePileCards.length === 0 || scorePileCards[scorePileCards.length - 1].CardValue < self.selectedCard.card.CardValue) {
                        self.player.scorePiles[scorePile.color][scorePile.sk].push(self.selectedCard.card);
                    }
                    self.selectedCard = null;
                }
            });

            GameplayEventBus.$on('discard-pile-clicked', function(discardPile) {
                // Handles clicking on a discard pile when placing a card.
                if (self.player.isTurn && self.gameDetails.turnState === 'Placing' && self.selectedCard !== null && discardPile.color === self.selectedCard.card.CardColor) {
                    self.selectedPlaceLocation = discardPile.sk;
                    self.$socket.emit('gamePlaceCard', {placedCardSK: self.selectedCard.card.CardSK, placedCardLocationType: 'DiscardPile', placedCardLocationSK: self.selectedPlaceLocation});
                    self.selectedCard.toggleIsSelected();
                    // Adds the card to the discard pile immediately to reduce perceived latency.
                    self.gameDetails.discardPiles[discardPile.color][discardPile.sk].push(self.selectedCard.card);
                    self.selectedCard = null;
                }

                // Handles clicking on a discard pile when drawing a card.
                if (self.player.isTurn && self.gameDetails.turnState === 'Drawing' && self.selectedPlaceLocation !== discardPile.sk && discardPile.cards.length > 0) {
                    self.selectedDrawLocation = discardPile.sk;
                    self.$socket.emit('gameDrawCard', {drawCardLocationType: 'DiscardPile', drawCardLocationSK: self.selectedDrawLocation});
                }
            });

            GameplayEventBus.$on('deck-clicked', function(deck) {
                // Handles clicking on the deck when drawing a card.
                if (self.player.isTurn && self.gameDetails.turnState === 'Drawing') {
                    self.selectedDrawLocation = deck.sk;
                    self.$socket.emit('gameDrawCard', {drawCardLocationType: 'Deck', drawCardLocationSK: self.selectedDrawLocation});
                }
            });
        },
        sockets: {
            gameHandUpdate(data) {
                this.playerHand = data;
            }
        },
        components: {
            ChatBox,
            BoardColumn,
            Hand,
            Deck,
            Scoreboard
        }
    }
</script>

<style scoped>
    #chat-box {
        height: 490px;
        margin-top: 69px;
    }
</style>
