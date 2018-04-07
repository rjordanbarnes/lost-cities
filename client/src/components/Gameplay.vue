<template>
    <div id="game-play" class="container">
        <div v-if="error">Error</div>
        <div v-if="gameDetails">
            <div class="row">
                <BoardColumn class="col" :player-score-pile="player.scorePiles.Yellow" :opponent-score-pile="opponent.scorePiles.Yellow" :discard-pile="gameDetails.discardPiles.Yellow" color="yellow"></BoardColumn>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.White" :opponent-score-pile="opponent.scorePiles.White" :discard-pile="gameDetails.discardPiles.White" color="white"></BoardColumn>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.Red" :opponent-score-pile="opponent.scorePiles.Red" :discard-pile="gameDetails.discardPiles.Red" color="red"></BoardColumn>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.Green" :opponent-score-pile="opponent.scorePiles.Green" :discard-pile="gameDetails.discardPiles.Green" color="green"></BoardColumn>
                <BoardColumn class="col" :player-score-pile="player.scorePiles.Blue" :opponent-score-pile="opponent.scorePiles.Blue" :discard-pile="gameDetails.discardPiles.Blue" color="blue"></BoardColumn>
            </div>
            <div class="row  m-4">
                <hand class="col-4" :hand="playerHand" v-if="playerHand.length > 0"></hand>
                <deck class="col-1" :deck-size="gameDetails.deckSize"></deck>
                <div class="col-5 offset-2">
                    <chat-box></chat-box>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    import ChatBox from '@/components/ChatBox'
    import BoardColumn from '@/components/BoardColumn'
    import Hand from '@/components/Hand'
    import Deck from '@/components/Deck'

    export default {
        props: ['gameDetails', 'player', 'opponent'],
        data() {
            return {
                error: null,
                playerHand: [],
                selectedCard: null
            }
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
            Deck
        }
    }
</script>

<style scoped>

</style>
