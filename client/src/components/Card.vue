<template>
    <div v-bind:style="cardStyle" class="mx-auto">
        {{card.CardValue}}
    </div>
</template>

<script>
    export default {
        props: ['card'],
        data() {
            return {
                cardStyle: {
                    'background-color': 'var(--card-' + this.card.CardColor.toLowerCase() + ')'
                }
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
    }
</style>
