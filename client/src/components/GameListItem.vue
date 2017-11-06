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
    </div>
</template>

<script>
    export default {
        props: ['gameId', 'gameName', 'gameHost', 'gamePlayerCount', 'isPasswordProtected'],
        data() {
            return {

            }
        },
        computed: {
            openGameButtonText() {
                return (this.gamePlayerCount < 2 ? 'Join' : 'View');
            },
            openGameButtonColor() {
                return {
                    'btn-outline-primary': this.gamePlayerCount < 2,
                    'btn-outline-info' : this.gamePlayerCount === 2
                }
            }
        },
        methods: {
            onOpenGame(gameId){
                this.$router.push('game/' + gameId);
            }
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
