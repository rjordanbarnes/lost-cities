<template>
    <div>
        <div class="list-group-item list-group-item-action flex-column align-items-start">
            <div class="d-flex w-100 justify-content-end">
                <div class="mr-auto">
                    <h3 class="mt-1">{{ gameName }}</h3>
                    <h5 class="mb-1">{{ gameHost }}</h5>
                </div>

                <h3 class="my-0 mx-4 align-self-center">{{ gamePlayerCount }}/2</h3>
                <button class="open-game-button my-1 btn btn-lg" :class="openGameButtonColor" v-on:click="onOpenGame()"><i class="fa fa-lock" v-if="isPasswordProtected"></i> {{ openGameButtonText }}</button>
            </div>
        </div>

        <game-password-prompt :game-s-k="gameSK" :is-game-full="isGameFull" ref="gamePasswordPrompt"></game-password-prompt>
    </div>
</template>

<script>
    import GamePasswordPrompt from '@/components/Lobby/GamePasswordPrompt'

    export default {
        name: "GameListItem",
        props: ['gameSK', 'gameName', 'gameHost', 'gamePlayerCount', 'isPasswordProtected'],
        data() {
            return {
                showPasswordPrompt: false
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
            onOpenGame(){
                if (this.isPasswordProtected) {
                    this.$refs.gamePasswordPrompt.showPrompt();
                } else {
                    if (this.isGameFull) {
                        this.$socket.emit('gameSpectate', {gameSK: this.gameSK});
                    } else {
                        this.$socket.emit('gameJoin', {gameSK: this.gameSK});
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
