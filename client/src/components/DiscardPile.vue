<template>
    <div class="mt-2">
        <card class="p-2" :card="cards[cards.length - 1]" v-if="cards.length > 0"></card>
    </div>
</template>

<script>
    import Card from '@/components/Card'

    export default {
        props: ['cards'],
        data() {
            return {
                error: null
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
    }
</style>
