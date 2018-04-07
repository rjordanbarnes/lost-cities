<template>
    <div class="board-column">
        <score-pile-score :cards="opponentScorePileCards"></score-pile-score>
        <score-pile :player-cards="playerScorePileCardsWithoutInvestments" :opponent-cards="opponentScorePileCardsWithoutInvestments" :color="color"></score-pile>
        <score-pile-score :cards="playerScorePileCards"></score-pile-score>
        <discard-pile :cards="discardPileCards"></discard-pile>
    </div>
</template>

<script>
    import ScorePile from '@/components/ScorePile'
    import ScorePileScore from '@/components/ScorePileScore'
    import DiscardPile from '@/components/DiscardPile'

    export default {
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
    .board-column {

    }
</style>
