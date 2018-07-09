<template>
    <div class="mt-2 discard-pile" v-on:click.stop="emitDiscardPileClicked" v-bind:style="discardPileStyle">
        <card class="p-2" :card="cards[cards.length - 1]" v-if="cards.length > 0"></card>
        <i class="fa fa-trash fa-2x" v-bind:style="trashCanStyle" v-else></i>
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
                error: null,
                discardPileStyle: {
                    'border-color': 'var(--card-' + this.color + ')'
                },
                trashCanStyle: {
                    'color':  'var(--card-' + this.color + ')'
                }
            }
        },methods: {
            emitDiscardPileClicked() {
                GameplayEventBus.$emit('discard-pile-clicked', this);
            }
        }, components: {
            Card
        }
    }
</script>

<style scoped>
    .discard-pile {
        border-width: 3px;
        border-style: dashed;
        border-radius: 5px;
        height: 65px;
        width: 95px;
        margin-left: auto;
        margin-right: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
</style>
