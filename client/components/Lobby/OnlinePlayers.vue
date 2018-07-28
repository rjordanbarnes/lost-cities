<template>
    <div class="d-flex flex-column">
        <h4>Online Players ({{onlinePlayers.length}})</h4>
        <div id="online-players">
            <div v-for="player in onlinePlayers.sort()" :key="player">{{ player }}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "OnlinePlayers",
        props: ['onlinePlayers'],
        data() {
            return {}
        }
    }
</script>

<style scoped>
    #online-players {
        overflow: auto;
    }
</style>
