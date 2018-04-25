<template>
    <div id="alert" class="alert" role="alert" :class="alertColor">
        {{ message }}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
</template>

<script>
    export default {
        name: "Alert",
        props: ['message', 'alertStyle'],
        data() {
            return {
            }
        },
        computed: {
            alertColor() {
                return {
                    'alert-success': this.style === 'success',
                    'alert-info': this.style === 'info',
                    'alert-warning': this.style === 'warning',
                    'alert-danger': this.alertStyle === 'danger',
                }
            }
        }
    }
</script>

<style scoped>
    #alert {
        position: fixed;
        height: 50px;
        bottom: 0;
        width: 100%;
        margin-bottom: 0;
    }
</style>
