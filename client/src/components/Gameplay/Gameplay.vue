<template>
    <div id="game-play" class="container">
        <div v-if="error">Error</div>
        <div v-if="gameDetails">
            <div class="row">
                <BoardColumn class="col" :player-score-pile="player.scorePiles.yellow" :opponent-score-pile="opponent.scorePiles.yellow" :discard-pile="gameDetails.discardPiles.yellow" color="yellow"></BoardColumn>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.white" :opponent-score-pile="opponent.scorePiles.white" :discard-pile="gameDetails.discardPiles.white" color="white"></BoardColumn>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.red" :opponent-score-pile="opponent.scorePiles.red" :discard-pile="gameDetails.discardPiles.red" color="red"></BoardColumn>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.green" :opponent-score-pile="opponent.scorePiles.green" :discard-pile="gameDetails.discardPiles.green" color="green"></BoardColumn>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.blue" :opponent-score-pile="opponent.scorePiles.blue" :discard-pile="gameDetails.discardPiles.blue" color="blue"></BoardColumn>
                <Scoreboard class="col-2" :game-details="gameDetails" :player="player" :opponent="opponent"></Scoreboard>
            </div>
            <div class="row  m-4">
                <hand class="col-4" :hand="playerHand" v-if="playerHand.length > 0"></hand>
                <deck class="col-1" :sk="gameDetails.deckSK" :deck-size="gameDetails.deckSize"></deck>
                <div class="col-5 offset-2">
                    <chat-box></chat-box>
                </div>
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
                    self.$socket.emit('gamePlaceCard', {placedCardSK: self.selectedCard.card.CardSK, placedCardLocationSK: self.selectedPlaceLocation});
                    self.selectedCard.toggleIsSelected();
                    // Adds the card to the score pile immediately to reduce perceived latency.
                    self.player.scorePiles[scorePile.color][scorePile.sk].push(self.selectedCard.card);
                    self.selectedCard = null;
                }
            });

            GameplayEventBus.$on('discard-pile-clicked', function(discardPile) {
                // Handles clicking on a discard pile when placing a card.
                if (self.player.isTurn && self.gameDetails.turnState === 'Placing' && self.selectedCard !== null && discardPile.color === self.selectedCard.card.CardColor) {
                    self.selectedPlaceLocation = discardPile.sk;
                    self.$socket.emit('gamePlaceCard', {placedCardSK: self.selectedCard.card.CardSK, placedCardLocationSK: self.selectedPlaceLocation});
                    self.selectedCard.toggleIsSelected();
                    console.log(discardPile);
                    console.log(self.selectedCard.card);
                    // Adds the card to the discard pile immediately to reduce perceived latency.
                    self.gameDetails.discardPiles[discardPile.color][discardPile.sk].push(self.selectedCard.card);
                    self.selectedCard = null;
                }

                // Handles clicking on a discard pile when drawing a card.
                if (self.player.isTurn && self.gameDetails.turnState === 'Drawing' && self.selectedPlaceLocation !== discardPile.sk && discardPile.cards.length > 0) {
                    self.selectedDrawLocation = discardPile.sk;
                    self.$socket.emit('gameDrawCard', {drawCardLocationSK: self.selectedDrawLocation});
                }
            });

            GameplayEventBus.$on('deck-clicked', function(deck) {
                // Handles clicking on the deck when drawing a card.
                if (self.player.isTurn && self.gameDetails.turnState === 'Drawing') {
                    self.selectedDrawLocation = deck.sk;
                    self.$socket.emit('gameDrawCard', {drawCardLocationSK: self.selectedDrawLocation});
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
        height: 175px;
    }
</style>
