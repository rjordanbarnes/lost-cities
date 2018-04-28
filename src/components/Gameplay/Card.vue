<template>
    <div v-bind:style="cardStyle" :class="selectedHighlight" class="mx-auto" v-on:click="emitCardClicked">
        {{ cardDisplayText }}
    </div>
</template>

<script>
    import { GameplayEventBus } from '../../events/GameplayEventBus.js'

    export default {
        name: "Card",
        props: ['card'],
        data() {
            return {
                isSelected: false,
                cardStyle: {
                    'background-color': 'var(--card-' + this.card.CardColor + ')'
                }
            }
        },
        methods: {
            emitCardClicked() {
                GameplayEventBus.$emit('card-clicked', this);
            },
            toggleIsSelected() {
                this.isSelected = !this.isSelected;
            }
        },
        computed: {
            selectedHighlight() {
                return (this.isSelected ? 'card-selected' : '');
            },
            cardDisplayText() {
                return (this.card.CardValue === 1) ? '$' : this.card.CardValue;
            }
        }
    }
</script>

<style scoped>
    div {
        font-weight: bold;
        font-size: 30px;
        height: 50px;
        width: 75px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        outline-style: none;
        box-shadow: 1px 8px 6px -6px rgba(0, 0, 0, 0.4), inset 0px -1px 2px -1px rgba(0,0,0,0.2);
    }

    .card-selected {
        box-shadow: 0 0 10px 2px rgba(81, 203, 238, 1);
        border: 2px solid rgba(81, 203, 238, 1);
    }
</style>
