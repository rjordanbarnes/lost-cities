<template>
    <div>
        {{ chatUsername }}: {{chatMessage }}
    </div>
</template>

<script>
    export default {
        props: ['chatUsername', 'chatMessage'],
        data() {
            return {}
        }
    }
</script>

<style scoped>

</style>
