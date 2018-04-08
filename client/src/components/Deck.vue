<template>
    <div v-on:click.stop="emitDeckClicked">
        {{deckSize}}
    </div>
</template>

<script>
    import { GameplayEventBus } from '../events/GameplayEventBus.js'

    export default {
        props: ['deckSize', 'sk'],
        data() {
            return {}
        },methods: {
            emitDeckClicked() {
                GameplayEventBus.$emit('deck-clicked', this);
            }
        }
    }
</script>

<style scoped>
    div {
        background-color: darkgrey;
        height: 108px;
        font-weight: bold;
        font-size: 30px;
        border-style: solid;
        border-width: 1px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
