<template>
    <div id="game-play" class="container">
        <div v-if="error">Error</div>
        <div v-if="gameDetails">
            <div class="row">
                <BoardColumn :player-score-pile="player.scorePiles.Blue" :opponent-score-pile="opponent.scorePiles.Blue" :discard-pile="gameDetails.discardPiles.Blue" color="blue"></BoardColumn>
                <BoardColumn :player-score-pile="player.scorePiles.Green" :opponent-score-pile="opponent.scorePiles.Green" :discard-pile="gameDetails.discardPiles.Green" color="green"></BoardColumn>
                <BoardColumn :player-score-pile="player.scorePiles.Red" :opponent-score-pile="opponent.scorePiles.Red" :discard-pile="gameDetails.discardPiles.Red" color="red"></BoardColumn>
                <BoardColumn :player-score-pile="player.scorePiles.White" :opponent-score-pile="opponent.scorePiles.White" :discard-pile="gameDetails.discardPiles.White" color="white"></BoardColumn>
                <BoardColumn :player-score-pile="player.scorePiles.Yellow" :opponent-score-pile="opponent.scorePiles.Yellow" :discard-pile="gameDetails.discardPiles.Yellow" color="yellow"></BoardColumn>
                <div class="col-2">
                    <chat-box></chat-box>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ChatBox from '@/components/ChatBox'
    import BoardColumn from '@/components/BoardColumn'

    export default {
        props: ['gameDetails', 'player', 'opponent'],
        data() {
            return {
                error: null
            }
        },
        components: {
            ChatBox,
            BoardColumn
        }
    }
</script>

<style scoped>

</style>
