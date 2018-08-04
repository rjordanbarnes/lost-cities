<template>
    <div>
        {{ chatUsername }}: {{chatMessage }}
    </div>
</template>

<script>
    export default {
        name: "ChatLine",
        props: ['chatUsername', 'chatMessage'],
        data() {
            return {}
        }
    }
</script>

<style scoped>
    div {
        font-size: .875rem;
    }
</style>
