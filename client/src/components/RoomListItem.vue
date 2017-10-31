<template>
    <div class="list-group-item list-group-item-action flex-column align-items-start">
        <div class="d-flex w-100 justify-content-end">
            <div class="mr-auto">
                <h3 class="mt-1">{{ roomName }}</h3>
                <h5 class="mb-1">{{ roomHost }}</h5>
            </div>

            <h3 class="my-0 mx-4 align-self-center">{{ roomPlayerCount }}/2</h3>
            <button class="open-room-button my-1 btn btn-lg" :class="openRoomButtonColor" v-on:click="onOpenRoom(roomId)"><i class="fa fa-lock" v-if="isPasswordProtected"></i> {{ openRoomButtonText }}</button>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['roomId', 'roomName', 'roomHost', 'roomPlayerCount', 'isPasswordProtected'],
        data() {
            return {

            }
        },
        computed: {
            openRoomButtonText() {
                return (this.roomPlayerCount < 2 ? 'Join' : 'View');
            },
            openRoomButtonColor() {
                return {
                    'btn-outline-primary': this.roomPlayerCount < 2,
                    'btn-outline-info' : this.roomPlayerCount === 2
                }
            }
        },
        methods: {
            onOpenRoom(roomId){
                this.$router.push('room/' + roomId);
            }
        }

    }
</script>

<style scoped>
    .list-group-item {
        margin: 10px 0;
    }

    .open-room-button {
        width: 90px;
    }
</style>
