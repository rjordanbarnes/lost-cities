<template>
    <div id="lobby-online-players" class="d-flex flex-column border p-3 bg-white rounded">
        <h5>Online Players ({{onlinePlayers.length}})</h5>
        <div id="online-players">
            <div v-for="player in sortedPlayers" :key="player">{{ player }}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "OnlinePlayers",
        props: ['onlinePlayers'],
        data() {
            return {}
        },
        computed: {
            sortedPlayers() {
                return this.onlinePlayers.sort();
            }
        }
    }
</script>

<style scoped>
    #lobby-online-players {
        height: 30vh;
        margin-top: 10px;
    }
    #online-players {
        overflow: auto;
    }
</style>
