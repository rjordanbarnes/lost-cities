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

</style>
