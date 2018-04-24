<template>
    <div v-bind:style="cardStyle" :class="selectedHighlight" class="mx-auto" v-on:click="emitCardClicked">
        {{card.CardValue}}
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
        border-style: solid;
        border-width: 1px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        outline-style: none;
    }

    .card-selected {
        box-shadow: 0 0 10px 2px rgba(81, 203, 238, 1);
        border: 2px solid rgba(81, 203, 238, 1);
    }
</style>
