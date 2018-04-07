<template>
    <div class="d-flex align-items-end flex-column" v-bind:style="scorePileStyle">
        <score-pile-card class="p-2" :card="card" :key="card.CardSK" v-for="card in opponentCards"></score-pile-card>
        <score-pile-card class="p-2" :card="card" :index="index" :key="card.CardSK" v-for="(card, index) in playerCards.reverse()"></score-pile-card>
    </div>
</template>

<script>
    import ScorePileCard from '@/components/ScorePileCard'

    export default {
        props: ['playerCards', 'opponentCards', 'color'],
        data() {
            return {
                scorePileStyle: {
                    'background-color': 'var(--score-pile-' + this.color.toLowerCase() + ')'
                }
            }
        }, components: {
            ScorePileCard
        }
    }
</script>

<style scoped>

    div {
        height: 392px;
        border-style: solid;
        border-width: 2px;
    }
</style>
