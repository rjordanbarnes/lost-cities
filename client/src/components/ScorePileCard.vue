<template>
    <div v-bind:style="cardStyle" v-bind:class="topMargin">
        {{card.CardValue}}
    </div>
</template>

<script>
    export default {
        props: ['card', 'index'],
        data() {
            return {
                cardStyle: {
                    height: this.card.CardValue * 7 + 'px',
                    'background-color': this.card.CardColor,
                    'text-align': 'center',
                    'vertical-align': 'middle',
                    'line-height': this.card.CardValue * 7 + 'px'
                }
            }
        }, computed: {
            topMargin() {
                return (this.index === 0) ? 'mt-auto' : null;
            }
        }
    }
</script>

<style scoped>
    div {
        border-style: solid;
        border-width: 1px;
        width: 100%;
    }
</style>
