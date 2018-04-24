<template>
    <div class="mt-2" v-on:click.stop="emitDiscardPileClicked">
        <card class="p-2" :card="cards[cards.length - 1]" v-if="cards.length > 0"></card>
    </div>
</template>

<script>
    import { GameplayEventBus } from '../../events/GameplayEventBus.js'
    import Card from '@/components/Gameplay/Card'

    export default {
        name: "DiscardPile",
        props: ['cards', 'color', 'sk'],
        data() {
            return {
                error: null
            }
        },methods: {
            emitDiscardPileClicked() {
                GameplayEventBus.$emit('discard-pile-clicked', this);
            },
            addPlayerCard(card) {
                this.cards.push(card);
                this.$forceUpdate();
            }
        }, components: {
            Card
        }
    }
</script>

<style scoped>
    div {
        background-color: grey;
        height: 75px;
        border-style: solid;
        border-width: 1px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
</style>
