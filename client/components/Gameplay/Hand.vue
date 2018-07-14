<template>
    <div>
        <div class="d-flex flex-wrap">
            <card class="mx-1" :card="card" :key="card.CardSK" v-for="card in hand"></card>
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
