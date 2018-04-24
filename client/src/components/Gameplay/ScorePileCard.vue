<template>
    <div v-bind:style="scorePileCardStyle" v-bind:class="topMargin">
        {{card.CardValue}}
    </div>
</template>

<script>
    export default {
        name: "ScorePileCard",
        props: ['card', 'index'],
        data() {
            return {
                scorePileCardStyle: {
                    height: this.card.CardValue * 7 + 'px',
                    'font-size': this.card.CardValue + 14 + 'px',
                    'background-color': 'var(--card-' + this.card.CardColor + ')'
                }
            }
        }, computed: {
            topMargin() {
                return (parseInt(this.index) === 0) ? 'mt-auto' : null;
            }
        }
    }
</script>

<style scoped>
    div {
        border-style: solid;
        border-width: 1px;
        width: 100%;
        font-weight: bold;
        font-size: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        outline-style: none;
    }
</style>
