<template>
    <div class="d-flex align-items-end flex-column" v-bind:style="scorePileStyle" v-on:click.stop="emitScorePileClicked">
        <score-pile-card class="p-2" :card="card" :key="card.CardSK" v-for="card in opponentCards"></score-pile-card>
        <score-pile-card class="p-2" :card="card" :index="index" :key="card.CardSK" v-for="(card, index) in playerCards.reverse()"></score-pile-card>
    </div>
</template>

<script>
    import { GameplayEventBus } from '../events/GameplayEventBus.js'
    import ScorePileCard from '@/components/ScorePileCard'

    export default {
        props: ['playerCards', 'opponentCards', 'color', 'sk'],
        data() {
            return {
                scorePileStyle: {
                    'background-color': 'var(--score-pile-' + this.color.toLowerCase() + ')'
                }
            }
        },methods: {
            emitScorePileClicked() {
                GameplayEventBus.$emit('score-pile-clicked', this);
            },
            addPlayerCard(card) {
                this.playerCards.push(card);
                this.$forceUpdate();
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
        cursor: pointer;
    }
</style>
