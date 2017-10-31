<template>
    <div id="lobby" class="container">
        <div class="row">
            <div class="col-3">
                <button id="createRoom" type="button" data-toggle="modal" data-target="#create-room">Create Room
                </button>
            </div>
            <div id="room-list" class="list-group col-9">
                <room-list-item
                    v-for="room in rooms"
                    :key="room.roomId"
                    :room-id="room.roomId"
                    :room-name="room.roomName"
                    :room-host="room.roomHost"
                    :room-player-count="room.roomPlayerCount"
                    :is-password-protected="room.isPasswordProtected">
                </room-list-item>
            </div>
        </div>
        <div class="modal fade" id="create-room" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Create Room</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="create-room-name" class="form-control-label">Room Name:</label>
                            <input type="text" class="form-control" id="create-room-name" v-model="enteredRoomName">
                        </div>
                        <div class="form-group">
                            <label for="create-room-password" class="form-control-label">Room Password:</label>
                            <input type="text" class="form-control" id="create-room-password"
                                   v-model="enteredRoomPassword">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" id="create-room-button" class="btn btn-primary" data-dismiss="modal"
                                @click="onCreateRoom">Create
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import RoomListItem from '@/components/RoomListItem'

    export default {
        data() {
            return {
                rooms: [],
                enteredRoomName: '',
                enteredRoomPassword: ''
            }
        },
        mounted() {
            if (this.rooms.length === 0) {
                this.$socket.emit('lobbyGetRooms');
            }
        },
        sockets: {
            lobbyRoomList(data) {
                this.rooms = data.rooms;
            },
            roomCreate(data) {
                if (data.errors) {
                    console.log(data.errors);
                } else {
                    this.$router.push('room/' + data.roomId);
                }
            }
        },
        methods: {
            onCreateRoom() {
                this.$socket.emit('roomCreate',
                    {roomName: this.enteredRoomName,
                        roomPassword: this.enteredRoomPassword});
            }
        },
        components: {
            RoomListItem
        }
    }
</script>

<style scoped>

</style>
