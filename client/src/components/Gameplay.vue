<template>
    <div id="game-play" class="container">
        <div v-if="error">Error</div>
        <div v-if="gameDetails">
            <h1 class="text-center my-4">{{ gameDetails.gameName }}</h1>
            <div class="row">
                <div class="col-4">
                    <chat-box></chat-box>
                </div>
                <div class="col-8">
                    Gameplay!
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ChatBox from '@/components/ChatBox'

    export default {
        props: ['gameDetails'],
        data() {
            return {
                error: null
            }
        },
        components: {
            ChatBox
        }
    }
</script>

<style scoped>

</style>
