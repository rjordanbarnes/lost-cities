<template>
    <div class="list-group-item list-group-item-action flex-column align-items-start">
        <div class="d-flex w-100 justify-content-end">
            <div class="mr-auto">
                <h3 class="mt-1">{{ gameName }}</h3>
                <h5 class="mb-1">{{ gameHost }}</h5>
            </div>

            <h3 class="my-0 mx-4 align-self-center">{{ gamePlayerCount }}/2</h3>
            <button class="open-game-button my-1 btn btn-lg" :class="openGameButtonColor" v-on:click="onOpenGame(gameId)"><i class="fa fa-lock" v-if="isPasswordProtected"></i> {{ openGameButtonText }}</button>
        </div>
        <game-password-prompt :game-id="this.gameId" :is-game-full="this.isGameFull" id="password-prompt"></game-password-prompt>
    </div>
</template>

<script>
    import GamePasswordPrompt from '@/components/GamePasswordPrompt'

    export default {
        props: ['gameId', 'gameName', 'gameHost', 'gamePlayerCount', 'isPasswordProtected'],
        data() {
            return {
                enteredPassword: ''
            }
        },
        computed: {
            isGameFull() {
                return this.gamePlayerCount >= 2;
            },
            openGameButtonText() {
                return (this.isGameFull ? 'View' : 'Join');
            },
            openGameButtonColor() {
                return (this.isGameFull ? 'btn-outline-info' : 'btn-outline-primary');
            }
        },
        methods: {
            onOpenGame(gameId){
                if (this.isPasswordProtected) {
                    $('#password-prompt').modal('show');
                } else {
                    if (this.isGameFull) {
                        this.$socket.emit('gameSpectate', {gameId: this.gameId});
                    } else {
                        this.$socket.emit('gameJoin', {gameId: this.gameId});
                    }
                }
            },
        },
        components: {
            GamePasswordPrompt
        }
    }
</script>

<style scoped>
    .list-group-item {
        margin: 10px 0;
    }

    .open-game-button {
        width: 90px;
    }
</style>
