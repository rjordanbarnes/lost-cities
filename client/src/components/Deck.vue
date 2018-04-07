<template>
    <div>
        {{deckSize}}
    </div>
</template>

<script>
    export default {
        props: ['deckSize'],
        data() {
            return {}
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
