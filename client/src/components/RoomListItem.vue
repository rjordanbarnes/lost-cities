<template>
    <div class="list-group-item list-group-item-action flex-column align-items-start">
        <div class="d-flex w-100 justify-content-end">
            <div class="mr-auto">
                <h3 class="mt-1">{{ roomName }}</h3>
                <h5 class="mb-1">{{ roomHost }}</h5>
            </div>

            <h3 class="my-0 mx-4 align-self-center">{{ roomUserCount }}/2</h3>
            <button class="join-room-button my-1 btn btn-outline-primary btn-lg" v-on:click="onJoinRoom(roomId)"><i class="fa fa-lock" v-if="isPasswordProtected"></i> Join</button>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['roomId', 'roomName', 'roomHost', 'roomUserCount', 'isPasswordProtected'],
        data() {
            return {

            }
        },
        methods: {
            onJoinRoom(roomId){
                this.$router.push('room/' + roomId);
            }
        }

    }
</script>

<style scoped>
    .list-group-item {
        margin: 10px 0;
    }

    .join-room-button {
        width: 90px;
    }
</style>
