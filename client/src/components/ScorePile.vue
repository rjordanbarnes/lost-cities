<template>
    <div class="d-flex align-items-end flex-column">
        <score-pile-card class="p-2" :card="card" v-for="card in opponentCards"></score-pile-card>
        <score-pile-card class="p-2" :card="card" :index="index" v-for="(card, index) in playerCards.reverse()"></score-pile-card>
    </div>
</template>

<script>
    import ScorePileCard from '@/components/ScorePileCard'

    export default {
        props: ['playerCards', 'opponentCards'],
        data() {
            return {
                error: null
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
