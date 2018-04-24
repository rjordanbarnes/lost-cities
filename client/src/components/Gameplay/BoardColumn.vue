<template>
    <div class="board-column">
        <score-pile-score :cards="opponentScorePileCards"></score-pile-score>
        <score-pile :sk="Object.keys(playerScorePile)[0]" :player-cards="playerScorePileCardsWithoutInvestments" :opponent-cards="opponentScorePileCardsWithoutInvestments" :color="color"></score-pile>
        <score-pile-score :cards="playerScorePileCards"></score-pile-score>
        <discard-pile :sk="Object.keys(discardPile)[0]" :cards="discardPileCards" :color="color"></discard-pile>
    </div>
</template>

<script>
    import ScorePile from '@/components/Gameplay/ScorePile'
    import ScorePileScore from '@/components/Gameplay/ScorePileScore'
    import DiscardPile from '@/components/Gameplay/DiscardPile'

    export default {
        name: "BoardColumn",
        props: ['playerScorePile', 'opponentScorePile', 'discardPile', 'color'],
        data() {
            return {
                error: null
            }
        }, computed: {
            playerScorePileCards() {
                return this.playerScorePile[Object.keys(this.playerScorePile)[0]];
            },
            opponentScorePileCards() {
                return this.opponentScorePile[Object.keys(this.opponentScorePile)[0]];
            },
            playerScorePileCardsWithoutInvestments() {
                return this.playerScorePileCards.filter(card => card.CardValue !== 1);
            },
            opponentScorePileCardsWithoutInvestments() {
                return this.opponentScorePileCards.filter(card => card.CardValue !== 1);
            },
            discardPileCards() {
                return this.discardPile[Object.keys(this.discardPile)[0]];
            }
        }, components: {
                ScorePileScore,
                ScorePile,
                DiscardPile
        }
    }
</script>

<style scoped>

</style>
