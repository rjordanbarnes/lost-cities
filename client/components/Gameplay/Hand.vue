<template>
    <div>
        <div class="d-flex flex-wrap">
            <card :card="card" :key="card.CardSK" v-for="card in hand.slice(0, 4)"></card>
        </div>
        <div class="d-flex flex-wrap mt-2">
            <card :card="card" :key="card.CardSK" v-for="card in hand.slice(4, 9)"></card>
        </div>
    </div>
</template>

<script>
    import Card from '@/components/Gameplay/Card'

    export default {
        name: "Hand",
        props: ['hand'],
        data() {
            return {}
        }, components: {
            Card
        }
    }
</script>

<style scoped>

</style>
