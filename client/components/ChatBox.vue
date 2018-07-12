<template>
    <div id="chat-box" class="d-flex flex-column">
        <div id="chat-line-container" class="border p-2 d-flex flex-column-reverse">
            <chat-line
                v-for="chatLine in chatLines"
                :key=""
                :chat-username="chatLine.chatUsername"
                :chat-message="chatLine.chatMessage"/>
        </div>
        <input type="text" class="form-control" id="chat-input" placeholder="Type your message here" @keyup.enter="onChatSubmit" v-model="chatInput">
    </div>
</template>

<script>
    import ChatLine from '@/components/ChatLine'

    export default {
        name: "ChatBox",
        data() {
            return {
                chatInput: "",
                chatLines: []
            }
        },
        sockets: {
            chatMessage(data) {
                if (data.gameSK === this.$route.params.gameSK) {
                    this.chatLines.unshift(data);
                }
            }
        },
        methods: {
            onChatSubmit() {
                this.$socket.emit('chatMessage', {message: this.chatInput, gameSK: this.$route.params.gameSK});
                this.chatInput = "";
            }
        },
        components: {
            ChatLine
        }
    }
</script>

<style scoped>
    #chat-line-container {
        height: inherit;
        overflow-y:auto;
    }

    #chat-box {
        font-size: 14px;
        word-wrap: break-word;
    }
</style>
